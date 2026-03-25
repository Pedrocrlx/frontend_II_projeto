"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { Translations } from "@/lib/i18n/en";
import en from "@/lib/i18n/en";
import fr from "@/lib/i18n/fr";
import es from "@/lib/i18n/es";
import de from "@/lib/i18n/de";
import pt from "@/lib/i18n/pt";

export type Locale = "pt" | "en" | "fr" | "es" | "de";

const LOCALES: Record<Locale, Translations> = { pt, en, fr, es, de };
const STORAGE_KEY = "grid-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Helper function to get initial locale (prevents flash)
function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "pt";
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && stored in LOCALES) return stored;
  return "pt";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initialization to prevent locale flash
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: LOCALES[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
