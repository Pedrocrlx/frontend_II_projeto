"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Translations } from "@/lib/i18n/en";
import en from "@/lib/i18n/en";
import fr from "@/lib/i18n/fr";
import es from "@/lib/i18n/es";
import de from "@/lib/i18n/de";
import pt from "@/lib/i18n/pt";

export type Locale = "pt" | "en" | "fr" | "es" | "de";

const LOCALES: Record<Locale, Translations> = { pt, en, fr, es, de };
const STORAGE_KEY = "grid-locale";
const DEFAULT_LOCALE: Locale = "pt";

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
  isHydrated: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Always start with default locale to prevent hydration mismatch
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load locale from localStorage only after hydration
  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && stored in LOCALES) {
        setLocaleState(stored);
      }
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: LOCALES[locale], isHydrated }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
