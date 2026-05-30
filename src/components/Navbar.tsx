"use client";

import Link from "next/link";
import { Bell, List, Map as MapIcon } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavbarProps {
  currentView: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
}

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  const [emailUpdates, setEmailUpdates] = useState(false);

  return (
    <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50 sticky top-0 shadow-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <img 
            src="/logo-innsight.png" 
            alt="InnSight Logo" 
            className="h-8 w-auto transition-transform group-hover:scale-110" 
          />
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            InnSight
          </span>
        </Link>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => onViewChange("list")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              currentView === "list" 
                ? "bg-white text-orange-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <List className="w-4 h-4" />
            <span>רשימה</span>
          </button>
          <button
            onClick={() => onViewChange("map")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              currentView === "map" 
                ? "bg-white text-orange-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <MapIcon className="w-4 h-4" />
            <span>מפה</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setEmailUpdates(!emailUpdates)}
          className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-all active:scale-95 group"
        >
          <span className="text-xs font-bold text-slate-600 select-none whitespace-nowrap">
            עדכונים למייל
          </span>
          <div
            className={cn(
              "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
              emailUpdates ? "bg-orange-600" : "bg-slate-300"
            )}
          >
            <span
              className={cn(
                "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all duration-200",
                emailUpdates ? "translate-x-5.5" : "translate-x-1"
              )}
            />
          </div>
          <Bell
            className={cn(
              "w-4 h-4 transition-colors",
              emailUpdates ? "text-orange-600" : "text-slate-400 group-hover:text-slate-500"
            )}
          />
        </button>
      </div>
    </nav>
  );
}
