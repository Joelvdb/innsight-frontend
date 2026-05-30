"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Plan } from "@/types";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix for Leaflet default icon issues in Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

interface MapPaneProps {
  plans: Plan[];
  selectedPlanId: string | null;
  onSelectPlan: (plan: Plan) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ירוק": return "#22c55e"; // green-500
    case "צהוב": return "#eab308"; // yellow-500
    case "כתום": return "#f97316"; // orange-500
    case "אדום": return "#ef4444"; // red-500
    default: return "#64748b"; // slate-500
  }
};

const createFlagIcon = (color: string) => {
  // Use a very explicit HTML structure with inline styles to ensure visibility
  return L.divIcon({
    className: "", // Empty class to avoid default Leaflet marker styling
    html: `
      <div style="
        width: 12px;
        height: 12px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 2px ${color}, 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
  });
};

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapPane({ plans, selectedPlanId, onSelectPlan }: MapPaneProps) {
  useEffect(() => {
    fixLeafletIcons();
    console.log("MapPane mounted. Plans count:", plans.length);
  }, [plans]);

  const israelCenter: [number, number] = [31.5, 34.8];
  
  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="h-full w-full min-h-[500px] relative z-10">
      <MapContainer 
        center={israelCenter} 
        zoom={8} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {selectedPlan && (
          <ChangeView center={[selectedPlan.latitude, selectedPlan.longitude]} />
        )}

        {plans.map((plan) => {
          // Diagnostic log for each marker
          if (typeof plan.latitude !== "number" || typeof plan.longitude !== "number") {
            console.warn("Invalid coordinates for plan:", plan.planNumber, plan.latitude, plan.longitude);
            return null;
          }

          return (
            <Marker
              key={plan.id}
              position={[plan.latitude, plan.longitude]}
              icon={createFlagIcon(getStatusColor(plan.status))}
              eventHandlers={{
                click: () => onSelectPlan(plan),
              }}
            >
              <Popup>
                <div className="text-right p-1 font-sans" dir="rtl">
                  <div className="font-bold text-orange-600">{plan.planNumber}</div>
                  <div className="text-sm font-medium">{plan.city}</div>
                  <div className="text-xs text-slate-500 mt-1">{plan.mahut}</div>
                  <div className="mt-2 flex items-center gap-2 justify-end">
                    <span className="text-xs font-bold">סטטוס:</span>
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] text-white font-bold"
                      style={{ backgroundColor: getStatusColor(plan.status) }}
                    >
                      {plan.status}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
