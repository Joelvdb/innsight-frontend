"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "@/components/Dashboard";
import Image from "next/image";

export default function Home() {
  const { user, isGuest, isLoading, setIsGuest } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setAuthError("Firebase לא מוגדר. בדוק את משתני הסביבה.");
      return;
    }
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== "auth/popup-closed-by-user") {
        setAuthError("הכניסה נכשלה. נסה שוב.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleGuest = () => {
    setIsGuest(true);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user || isGuest) {
    return (
      <main className="h-screen w-screen overflow-hidden flex flex-col font-sans">
        <Dashboard />
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950" dir="rtl">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative flex flex-1 flex-col lg:flex-row">
        {/* Left branding panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 text-white">
          <div className="max-w-md space-y-8">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-innsight.png"
                alt="InnSight"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <span className="text-3xl font-bold tracking-tight">InnSight</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-extrabold leading-tight text-white">
                ניתוח תכניות<br />
                <span className="text-orange-400">תב&quot;ע בישראל</span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed">
                פלטפורמה מתקדמת לחיפוש, ניתוח והשוואת תכניות בניה ברחבי הארץ — עם מפות אינטראקטיביות ובינה מלאכותית.
              </p>
            </div>

            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>חיפוש מבוסס בינה מלאכותית על פני אלפי תכניות</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>מפה אינטראקטיבית עם שכבות מידע מרחביות</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>התראות מייל על עדכוני תכניות חדשות</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right sign-in panel */}
        <div className="flex flex-1 lg:w-1/2 flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm space-y-8">
            {/* Mobile logo */}
            <div className="flex lg:hidden flex-col items-center gap-3 mb-2">
              <Image
                src="/logo-innsight.png"
                alt="InnSight"
                width={56}
                height={56}
                className="rounded-2xl shadow-2xl"
              />
              <h1 className="text-3xl font-extrabold text-white tracking-tight">InnSight</h1>
              <p className="text-slate-400 text-sm text-center">ניתוח תכניות תב&quot;ע בישראל</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">ברוכים הבאים</h2>
                <p className="text-slate-400 text-sm mt-1">התחברו כדי להתחיל לחקור</p>
              </div>

              {authError && (
                <div className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-4 py-2">
                  {authError}
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition-all active:scale-[0.98] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {signingIn ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{signingIn ? "מתחבר..." : "כניסה עם Google"}</span>
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-600">או</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <button
                onClick={handleGuest}
                className="w-full px-4 py-3 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 font-medium rounded-xl transition-all active:scale-[0.98]"
              >
                המשך כאורח
              </button>
            </div>

            <p className="text-center text-xs text-slate-600 px-4">
              בהתחברות אתם מסכימים לתנאי השימוש ומדיניות הפרטיות שלנו.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
