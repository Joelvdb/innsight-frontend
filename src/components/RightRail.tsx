"use client";

import { Conversation, Plan } from "@/types";
import { History, MessageSquare, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RightRailProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  activeConversationId: string | null;
  savedPlans: Plan[];
  onSelectPlan: (plan: Plan) => void;
}

export default function RightRail({
  conversations,
  onSelectConversation,
  activeConversationId,
  savedPlans,
  onSelectPlan
}: RightRailProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "bg-slate-900 text-slate-300 h-full flex flex-col transition-all duration-300 border-l border-slate-800",
        isCollapsed ? "w-12" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-semibold text-white truncate">
            <History className="w-4 h-4 text-slate-400" />
            <span>היסטוריית שיחות</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors"
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Saved Plans Section */}
        {!isCollapsed && savedPlans.length > 0 && (
          <div className="mt-4 px-4 mb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              <Bookmark className="w-3 h-3" />
              תכניות שמורות
            </div>
            <div className="space-y-1">
              {savedPlans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => onSelectPlan(plan)}
                  className="w-full text-right px-2 py-1.5 text-xs rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors truncate block"
                >
                  {plan.planNumber} - {plan.city}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          {!isCollapsed && (
            <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              שיחות אחרונות
            </div>
          )}
          
          {conversations.length === 0 && !isCollapsed && (
            <div className="px-4 py-4 text-center text-slate-500 text-xs italic">אין שיחות קודמות</div>
          )}
          
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={cn(
                "w-full text-right p-3 transition-colors hover:bg-slate-800 group relative",
                activeConversationId === conv.id && "bg-slate-800 text-white border-r-2 border-r-orange-500"
              )}
            >
              <div className="flex items-start gap-3">
                <MessageSquare className={cn("w-4 h-4 mt-0.5 shrink-0", activeConversationId === conv.id ? "text-orange-400" : "text-slate-500")} />
                {!isCollapsed && (
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">תכנית {conv.planNumber}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(conv.timestamp).toLocaleString("he-IL", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
