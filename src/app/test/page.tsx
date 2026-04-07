"use client";
import { useEffect, useState } from "react";

export default function TestPage() {
  const [ok, setOk] = useState(false);
  useEffect(() => { setOk(true); }, []);
  return (
    <div className="p-20 text-center">
      <h1 className="text-2xl font-bold">
        {ok ? "✅ JS IS WORKING" : "❌ JS IS NOT WORKING"}
      </h1>
      <button 
        className="mt-4 p-2 bg-blue-500 text-white rounded"
        onClick={() => alert("CLICKED!")}
      >
        Click me
      </button>
    </div>
  );
}
