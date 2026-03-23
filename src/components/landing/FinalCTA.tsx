"use client";

import { useI18n } from "@/contexts/I18nContext";

export function FinalCTA() {
  const { t } = useI18n();

  return (
    <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10 dark:opacity-5 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
          {t.finalCta.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xl max-w-2xl mx-auto mb-10">
          {t.finalCta.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-10 py-5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-extrabold text-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/20">
            {t.finalCta.cta}
          </button>
        </div>
        <p className="mt-8 text-slate-500 text-sm font-medium">{t.finalCta.noCreditCard}</p>
      </div>
    </section>
  );
}
