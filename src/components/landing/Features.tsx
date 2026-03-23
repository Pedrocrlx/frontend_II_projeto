"use client";

import { useI18n } from "@/contexts/I18nContext";

export function Features() {
  const { t } = useI18n();

  const features = [
    {
      key: "calendar" as const,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    },
    {
      key: "international" as const,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    },
    {
      key: "instant" as const,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />,
    },
  ];

  return (
    <section id="features" className="py-24 bg-white relative dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-3">
            Core Engine
          </h2>
          <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50">
            {t.features.title}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map(({ key, icon }) => (
            <div
              key={key}
              className="group p-8 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-2xl hover:shadow-blue-500/5 transition-all bg-slate-50/50 dark:bg-slate-900/50"
            >
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {icon}
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-3">
                {t.features.items[key].title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {t.features.items[key].description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
