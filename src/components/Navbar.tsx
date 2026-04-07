"use client";

import Link from "next/link";
import { Bell, LogIn } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [emailUpdates, setEmailUpdates] = useState(false);

  return (
    <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50 sticky top-0 shadow-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            InnSight
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            href="/"
            className="hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 py-1"
          >
            דף הבית
          </Link>
          <Link
            href="#"
            className="hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 py-1"
          >
            תוכניות בטיפול
          </Link>
          <Link
            href="#"
            className="hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 py-1"
          >
            אודות
          </Link>
        </div>
      </div>

      <div className="cursor-pointer flex items-center gap-4">
        {/* Fixed Email Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            window.alert("Clicked");
            console.log("Email toggle clicked. New state:", !emailUpdates);
            setEmailUpdates(!emailUpdates);
          }}
          className="cursor-pointer flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-all active:scale-95 group"
        >
          <span className="text-xs font-bold text-slate-600 select-none whitespace-nowrap">
            עדכונים למייל
          </span>
          <div
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
              emailUpdates ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all duration-200 ${
                emailUpdates ? "translate-x-1" : "translate-x-5.5"
              }`}
            />
          </div>
          <Bell
            className={`w-4 h-4 transition-colors ${emailUpdates ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"}`}
          />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            התחברות
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all hover:shadow-md active:scale-95"
          >
            הרשמה
          </Link>
        </div>
      </div>
    </nav>
  );
}
