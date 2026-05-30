"use client";

import { Plan, Nispach } from "@/types";
import { FileText, Map as MapIcon, Paperclip, Search, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CenterPaneProps {
  plans: Plan[];
  savedPlanIds: string[];
  onToggleSave: (id: string) => void;
}

export default function CenterPane({
  plans,
  savedPlanIds,
  onToggleSave
}: CenterPaneProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNispachim, setShowNispachim] = useState<string | null>(null);

  const filteredPlans = plans.filter(
    (plan) =>
      plan.planNumber.includes(searchTerm) ||
      plan.city.includes(searchTerm) ||
      plan.mahut.includes(searchTerm) ||
      (plan.statusLabel ?? "").includes(searchTerm)
  );

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "ירוק":
        return "bg-green-100 text-green-700 border-green-200";
      case "צהוב":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "כתום":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "אדום":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 relative z-10">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <h1 className="text-xl font-bold text-slate-800 mb-4">מאגר תכניות בניין עיר (תב״ע)</h1>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="חיפוש לפי מספר תכנית, עיר או מהות..."
            className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-right text-sm">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-medium z-30">
            <tr>
              <th className="px-4 py-3 font-semibold w-10"></th>
              <th className="px-4 py-3 font-semibold">מספר תכנית</th>
              <th className="px-4 py-3 font-semibold">יישוב</th>
              <th className="px-4 py-3 font-semibold">שם תכנית</th>
              <th className="px-4 py-3 font-semibold text-center">יח׳ אירוח</th>
              <th className="px-4 py-3 font-semibold">סטטוס</th>
              <th className="px-4 py-3 font-semibold text-center">מסמכים</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPlans.map((plan) => (
              <tr
                key={plan.id}
                className="transition-all hover:bg-slate-50 group"
              >
                <td className="px-4 py-4" onClick={(e) => {
                  e.stopPropagation();
                  console.log("Bookmark clicked for:", plan.planNumber);
                  onToggleSave(plan.id);
                }}>
                  <button 
                    className={cn(
                      "transition-colors",
                      savedPlanIds.includes(plan.id) ? "text-orange-600" : "text-slate-300 hover:text-slate-400"
                    )}
                  >
                    {savedPlanIds.includes(plan.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </td>
                <td className="px-4 py-4 font-mono font-medium text-orange-600 group-hover:underline">
                  {plan.planNumber}
                </td>
                <td className="px-4 py-4">{plan.city}</td>
                <td className="px-4 py-4 text-slate-600 max-w-xs truncate">{plan.mahut}</td>
                <td className="px-4 py-4 text-center text-slate-600 text-sm">
                  {plan.accommodationUnitsMin != null && plan.accommodationUnitsMax != null
                    ? `${plan.accommodationUnitsMin}–${plan.accommodationUnitsMax}`
                    : plan.accommodationUnitsMax != null
                    ? plan.accommodationUnitsMax
                    : "—"}
                </td>
                <td className="px-4 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    getStatusStyles(plan.status)
                  )}>
                    {plan.statusLabel || plan.status}
                  </span>
                </td>
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-3">
                    <a
                      href={plan.takanon_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="תקנון"
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors border border-transparent hover:border-red-100"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                    <a
                      href={plan.govMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="מפה"
                      className="p-1.5 hover:bg-orange-50 rounded-lg text-orange-500 transition-colors border border-transparent hover:border-orange-100"
                    >
                      <MapIcon className="w-4 h-4" />
                    </a>
                    <div className="relative">
                      <button
                        title="נספחים"
                        className={cn(
                          "p-1.5 rounded-lg transition-colors border border-transparent",
                          showNispachim === plan.id
                            ? "bg-slate-200 text-slate-700 border-slate-300"
                            : "hover:bg-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Paperclip clicked for:", plan.planNumber);
                          setShowNispachim(showNispachim === plan.id ? null : plan.id);
                        }}
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      
                      {showNispachim === plan.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-[100] bg-black/5" 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Closing nispachim backdrop");
                              setShowNispachim(null);
                            }}
                          />
                          <div 
                            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-[110] py-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-1 border-b border-slate-100 mb-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">נספחי התכנית</span>
                            </div>
                            {plan.nispachim.map((n, i) => (
                              <a
                                key={i}
                                href={n.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                              >
                                <span>{n.name}</span>
                                <ExternalLink className="w-3 h-3 opacity-50" />
                              </a>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPlans.length === 0 && (
          <div className="p-8 text-center text-slate-400">לא נמצאו תכניות העונות לחיפוש</div>
        )}
      </div>
    </div>
  );
}
