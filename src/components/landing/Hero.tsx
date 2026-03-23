"use client";

import Link from "next/link";
import { useI18n } from "@/contexts/I18nContext";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-slate-950 ">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-50 dark:opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-slate-50 leading-[1.1] mb-6">
            {t.hero.headline} <br />
            <span className="text-blue-600 dark:text-blue-400">{t.hero.headlineAccent}</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl shadow-slate-900/10 dark:shadow-slate-100/10">
              {t.hero.ctaPrimary}
            </Link>
            <button className="cursor-pointer w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              {t.hero.ctaSecondary}
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t.hero.noCreditCard}
          </div>
        </div>

        <div className="mt-20 relative max-w-5xl mx-auto animate-float">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden p-2">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 h-[400px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border border-slate-400 dark:border-slate-600"></div>
                ))}
              </div>
              <div className="z-10 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tighter text-sm">
                    Booking Preview
                  </h3>
                  <span className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">
                    LIVE
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="h-10 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center px-4 justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-50">10:00 — 10:30</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold">AVAILABLE</span>
                  </div>
                  <div className="h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center gap-3 px-4 justify-between text-white shadow-lg shadow-blue-500/20">
                    <span className="text-xs font-bold italic">10:30 — 11:00</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">SELECTED</span>
                  </div>
                  <div className="h-10 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center px-4 justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-50">11:00 — 11:30</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold">AVAILABLE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
