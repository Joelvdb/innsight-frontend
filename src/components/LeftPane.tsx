"use client";

import { Message, Plan } from "@/types";
import { Send, User, Bot, Plus, Info, FileText, Map as MapIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeftPaneProps {
  selectedPlan: Plan | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onNewChat: () => void;
  isHighlighted?: boolean;
}

export default function LeftPane({ 
  selectedPlan, 
  messages, 
  onSendMessage, 
  onNewChat,
  isHighlighted 
}: LeftPaneProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when a plan is selected
  useEffect(() => {
    if (selectedPlan && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedPlan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-l border-slate-200 w-full transition-all duration-500 relative",
      isHighlighted && "ring-4 ring-blue-500/30 ring-inset bg-blue-50/10"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 transition-colors duration-500",
        isHighlighted && "bg-blue-100"
      )}>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">צ׳אט ניתוח תכנית</h2>
          {selectedPlan ? (
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 truncate">תכנית {selectedPlan.planNumber}</span>
              <span className="text-xs text-slate-500 truncate">{selectedPlan.mahut}</span>
            </div>
          ) : (
            <span className="text-slate-400 text-sm italic">בחר תכנית מהטבלה להתחלת ניתוח</span>
          )}
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3 h-3" />
          צ׳אט חדש
        </button>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-60">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Bot className="w-10 h-10 stroke-1 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-600">היי! המערכת מוכנה</p>
              <p className="text-xs max-w-[200px] mt-1">בחר תכנית מהטבלה מימין כדי להתחיל לנתח אותה באמצעות הבינה המלאכותית</p>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            if (m.role === "system") {
              return (
                <div key={m.id} className="flex flex-col items-center py-2 animate-pulse-once">
                  <div className="bg-white border border-blue-100 rounded-xl p-3 shadow-sm max-w-[90%] w-full">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-tight">הקשר ניתוח חדש</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-800">תכנית נבחרה: {selectedPlan?.planNumber}</div>
                        <div className="text-[11px] text-slate-500 truncate mb-2">{selectedPlan?.mahut}</div>
                        <div className="flex gap-2">
                          <button className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors flex items-center gap-1">
                            <FileText className="w-3 h-3" /> תקנון
                          </button>
                          <button className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors flex items-center gap-1">
                            <MapIcon className="w-3 h-3" /> מפה
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={m.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  m.role === "user" ? "mr-auto flex-row-reverse" : "ml-auto"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                    m.role === "user" ? "bg-slate-200 text-slate-600" : "bg-blue-600 text-white"
                  )}
                >
                  {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "bg-white border border-slate-200 text-slate-800 rounded-tr-none"
                      : "bg-blue-600 text-white rounded-tl-none"
                  )}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            disabled={!selectedPlan}
            placeholder={selectedPlan ? "שאל שאלה על התכנית..." : "יש לבחור תכנית תחילה"}
            className="w-full pr-4 pl-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all disabled:opacity-50 outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !selectedPlan}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:bg-slate-300 shadow-sm active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">הצ׳אט משתמש בבינה מלאכותית, מומלץ לאמת נתונים מול המסמכים המקוריים.</p>
      </div>
    </div>
  );
}
