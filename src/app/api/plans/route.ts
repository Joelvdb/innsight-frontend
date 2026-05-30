import { NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";
import { Plan } from "@/types";

function makeBigQueryClient() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    return new BigQuery({ projectId: process.env.GCP_PROJECT_ID, credentials });
  }
  return new BigQuery({
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
}

const bigquery = makeBigQueryClient();

function mapStatusToColor(status: string | null): string {
  if (!status) return "אפור";
  const s = status.trim();
  if (s.includes("בתוקף") || s.includes("אושרה") || s.includes("אושר")) return "ירוק";
  if (s.includes("הופקד") || s.includes("בהפקדה") || s.includes("להפקדה")) return "צהוב";
  if (s.includes("בהכנה") || s.includes("בהתנגדויות") || s.includes("הוגשה")) return "כתום";
  if (s.includes("בוטל") || s.includes("נדחה") || s.includes("פג")) return "אדום";
  return "כתום";
}

function maybeNum(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

// Converts ITM (Israeli Transverse Mercator) grid coordinates to WGS84 lat/lng.
// ITM X (easting) ~ 100k–280k, Y (northing) ~ 350k–820k.
// If values already look like WGS84 (lat 29–34, lng 34–36), pass them through unchanged.
function itmToWgs84(x: number, y: number): { lat: number; lng: number } {
  if (x > 30 && x < 37 && y > 29 && y < 34) {
    return { lat: y, lng: x };
  }

  const a = 6378137.0;
  const f = 1 / 298.257222101;
  const e2 = 2 * f - f * f;
  const e = Math.sqrt(e2);
  const k0 = 1.0000067;
  const lat0 = 31.7343936111111 * (Math.PI / 180);
  const lon0 = 35.2045169444444 * (Math.PI / 180);
  const E0 = 219529.584;
  const N0 = 626907.390;

  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));

  const sin2 = (t: number) => Math.sin(2 * t);
  const sin4 = (t: number) => Math.sin(4 * t);
  const sin6 = (t: number) => Math.sin(6 * t);
  const sin8 = (t: number) => Math.sin(8 * t);

  const M0 =
    a *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * lat0 -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * sin2(lat0) +
      ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * sin4(lat0) -
      ((35 * e2 * e2 * e2) / 3072) * sin6(lat0));

  const Ep = x - E0;
  const Np = y - N0;
  const M = M0 + Np / k0;
  const mu = M / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 * e1 * e1) / 32) * sin2(mu) +
    ((21 * e1 * e1) / 16 - (55 * e1 * e1 * e1 * e1) / 32) * sin4(mu) +
    ((151 * e1 * e1 * e1) / 96) * sin6(mu) +
    ((1097 * e1 * e1 * e1 * e1) / 512) * sin8(mu);

  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const tanPhi1 = Math.tan(phi1);

  const N1 = a / Math.sqrt(1 - e2 * sinPhi1 * sinPhi1);
  const T1 = tanPhi1 * tanPhi1;
  const C1 = (e2 / (1 - e2)) * cosPhi1 * cosPhi1;
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * sinPhi1 * sinPhi1, 1.5);
  const D = Ep / (N1 * k0);
  const D2 = D * D;
  const D3 = D2 * D;
  const D4 = D3 * D;
  const D5 = D4 * D;
  const D6 = D5 * D;
  const ep2 = e2 / (1 - e2);

  const lat =
    phi1 -
    ((N1 * tanPhi1) / R1) *
      (D2 / 2 -
        (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * (D4 / 24) +
        (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * (D6 / 720));

  const lon =
    lon0 +
    (D -
      (1 + 2 * T1 + C1) * (D3 / 6) +
      (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * (D5 / 120)) /
      cosPhi1;

  return { lat: lat * (180 / Math.PI), lng: lon * (180 / Math.PI) };
}

export async function GET() {
  try {
    const projectId = process.env.GCP_PROJECT_ID;
    const dataset = process.env.BQ_DATASET || "main";
    const table = process.env.BQ_TABLE || "main";

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing GCP_PROJECT_ID environment variable" },
        { status: 500 }
      );
    }

    const query = `
      SELECT
        plan_number,
        plan_name,
        city,
        plan_status,
        CAST(last_status_date AS STRING) AS last_status_date,
        coordinate_x,
        coordinate_y,
        pdf_link,
        accommodation_units_min,
        accommodation_units_max,
        num_floors,
        building_height_meters,
        land_ownership,
        plot_designation,
        tourism_use_type,
        num_plots_with_building_rights,
        num_plots_with_tourism_building_rights,
        use_type_exclusive_or_mixed,
        hotel_above_commercial_or_mixed_use,
        tourism_building_rights_main_area,
        tourism_building_rights_service_area,
        total_tourism_building_rights_min,
        total_tourism_building_rights_max
      FROM \`${projectId}.${dataset}.${table}\`
      ORDER BY last_status_date DESC
    `;

    const [rows] = await bigquery.query({ query });

    const plans: Plan[] = rows.map((row: any, index: number) => ({
      id: row.plan_number ? `${row.plan_number}-${index}` : String(index),
      planNumber: row.plan_number ?? "",
      city: row.city ?? "",
      mahut: row.plan_name ?? "",
      status: mapStatusToColor(row.plan_status),
      statusLabel: row.plan_status ?? undefined,
      takanon_text: "",
      takanon_url: row.pdf_link ?? "",
      govMapUrl: row.plan_number
        ? `https://www.govmap.gov.il/?q=${encodeURIComponent(row.plan_number)}`
        : "",
      nispachim: [],
      lastUpdated: row.last_status_date ?? "",
      roomsCount: maybeNum(row.accommodation_units_max) ?? 0,
      ...(() => {
        const cx = maybeNum(row.coordinate_x);
        const cy = maybeNum(row.coordinate_y);
        if (cx !== null && cy !== null) {
          const { lat, lng } = itmToWgs84(cx, cy);
          return { latitude: lat, longitude: lng };
        }
        return { latitude: 0, longitude: 0 };
      })(),

      // Extended fields
      accommodationUnitsMin: maybeNum(row.accommodation_units_min),
      accommodationUnitsMax: maybeNum(row.accommodation_units_max),
      numFloors: maybeNum(row.num_floors),
      buildingHeightMeters: maybeNum(row.building_height_meters),
      landOwnership: row.land_ownership ?? null,
      plotDesignation: row.plot_designation ?? null,
      tourismUseType: row.tourism_use_type ?? null,
      numPlotsWithBuildingRights: maybeNum(row.num_plots_with_building_rights),
      numPlotsWithTourismBuildingRights: maybeNum(row.num_plots_with_tourism_building_rights),
      useTypeExclusiveOrMixed: row.use_type_exclusive_or_mixed ?? null,
      hotelAboveCommercialOrMixedUse: row.hotel_above_commercial_or_mixed_use ?? null,
      tourismBuildingRightsMainArea: maybeNum(row.tourism_building_rights_main_area),
      tourismBuildingRightsServiceArea: maybeNum(row.tourism_building_rights_service_area),
      totalTourismBuildingRightsMin: maybeNum(row.total_tourism_building_rights_min),
      totalTourismBuildingRightsMax: maybeNum(row.total_tourism_building_rights_max),
    }));

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error("BigQuery Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch plans from BigQuery" },
      { status: 500 }
    );
  }
}
