"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [hasPermission, setHasPermission] = useState(false);

  // Auto-enable if JS is already running well (optional)
  useEffect(() => {
    console.log("!!! PAGE MOUNTED !!! JS IS RUNNING");
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col font-sans">
      {!hasPermission ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white p-10 text-center" dir="rtl">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <div className="w-10 h-10 border-4 border-white rounded-md rotate-45" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">InnSight - TABA Analyzer</h1>
          <p className="text-slate-400 mb-8 max-w-md">
            לחץ על הכפתור למטה כדי לאשר הפעלת רכיבים אינטראקטיביים ולהתחיל בעבודה.
          </p>
          <button 
            onClick={() => {
              console.log("Permission Granted by Click");
              setHasPermission(true);
            }}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 text-xl"
          >
            אישור והמשך למערכת
          </button>
          <p className="mt-8 text-xs text-slate-500">
            אם הכפתור לא מגיב, ייתכן ש-JavaScript חסום בדפדפן שלך.
          </p>
        </div>
      ) : (
        <Dashboard />
      )}
    </main>
  );
}
