"use client";

import { Message } from "@/types";
import { Send, User, Bot, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeftPaneProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onNewChat: () => void;
}

export default function LeftPane({ messages, onSendMessage, onNewChat }: LeftPaneProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 w-full relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">צ׳אט ניתוח תכנית</h2>
        <button
          onClick={onNewChat}
          className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm active:scale-95"
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
              <p className="text-xs max-w-[200px] mt-1">שאל שאלה על התכניות במאגר</p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
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
                  m.role === "user" ? "bg-slate-200 text-slate-600" : "bg-orange-600 text-white"
                )}
              >
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                  m.role === "user"
                    ? "bg-white border border-slate-200 text-slate-800 rounded-tr-none"
                    : "bg-orange-600 text-white rounded-tl-none"
                )}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            placeholder="שאל שאלה על התכניות..."
            className="w-full pr-4 pl-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all disabled:bg-slate-300 shadow-sm active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">הצ׳אט משתמש בבינה מלאכותית, מומלץ לאמת נתונים מול המסמכים המקוריים.</p>
      </div>
    </div>
  );
}
