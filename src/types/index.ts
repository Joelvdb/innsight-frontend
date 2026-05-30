export interface Nispach {
  name: string;
  url: string;
}

export interface Plan {
  id: string;
  planNumber: string;
  city: string;
  mahut: string;            // plan_name
  status: string;           // color key: ירוק/צהוב/כתום/אדום
  statusLabel?: string;     // raw plan_status text from BigQuery
  takanon_text: string;
  takanon_url: string;      // pdf_link
  govMapUrl: string;
  nispachim: Nispach[];
  lastUpdated: string;      // last_status_date
  roomsCount: number;       // accommodation_units_max fallback
  latitude: number;         // coordinate_y
  longitude: number;        // coordinate_x

  // Extended BigQuery fields
  accommodationUnitsMin: number | null;
  accommodationUnitsMax: number | null;
  numFloors: number | null;
  buildingHeightMeters: number | null;
  landOwnership: string | null;
  plotDesignation: string | null;
  tourismUseType: string | null;
  numPlotsWithBuildingRights: number | null;
  numPlotsWithTourismBuildingRights: number | null;
  useTypeExclusiveOrMixed: string | null;
  hotelAboveCommercialOrMixedUse: string | null;
  tourismBuildingRightsMainArea: number | null;
  tourismBuildingRightsServiceArea: number | null;
  totalTourismBuildingRightsMin: number | null;
  totalTourismBuildingRightsMax: number | null;
}

export interface Message {
  id: string;
  role: "user" | "ai" | "system";
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  planId: string;
  planNumber: string;
  messages: Message[];
  timestamp: string;
}
