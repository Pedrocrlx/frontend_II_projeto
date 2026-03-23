"use client";

import { useI18n, LOCALE_LABELS, type Locale } from "@/contexts/I18nContext";

export function LanguageSelect() {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label="Select language"
      className="text-sm font-medium bg-transparent text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600/50 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
    >
      {(Object.entries(LOCALE_LABELS) as [Locale, string][]).map(([code, label]) => (
        <option key={code} value={code} className="bg-white dark:bg-slate-900">
          {label}
        </option>
      ))}
    </select>
  );
}
