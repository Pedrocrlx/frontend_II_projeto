"use client";

import { useI18n } from "@/contexts/I18nContext";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    { number: "01", key: "setup" as const },
    { number: "02", key: "configure" as const },
    { number: "03", key: "launch" as const },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-3">
          Process
        </h2>
        <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-20">
          {t.howItWorks.title}
        </p>
        <div className="flex flex-col md:flex-row gap-12 relative">
          {steps.map(({ number, key }) => (
            <div key={key} className="flex-1 relative">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{number}</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                {t.howItWorks.steps[key].title}
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                {t.howItWorks.steps[key].description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
