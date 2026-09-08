"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { BASE_LOCALE, LOCALES, t as translate, type Locale } from "@/lib/i18n";

/**
 * One locale for the whole site.
 *
 * It began as local state on the quotation screen, which meant the switch was
 * buried three scrolls into one page and moved one component while the nav and
 * the other four screens stayed English. A language control that changes part
 * of a page is worse than none: the reader concludes the translation is broken
 * rather than partial.
 *
 * Persisted in localStorage and read in an effect, never during render — a
 * storage read while rendering is a hydration mismatch, and this component
 * wraps every route.
 */
const STORAGE_KEY = "portfolio.locale.v1";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: BASE_LOCALE, setLocale: () => {} });

function isLocale(v: string | null): v is Locale {
  return v !== null && (LOCALES as readonly string[]).includes(v);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(BASE_LOCALE);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isLocale(saved)) setLocaleState(saved);
    } catch {
      /* private mode — the site still works, it just will not remember */
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* as above */
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

/**
 * The hook every component uses. Returns a bound `t`, so call sites read
 * `t("home.hero.title")` rather than threading the locale through props.
 */
export function useT() {
  const { locale } = useContext(LocaleContext);
  return useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(key, locale, vars),
    [locale],
  );
}
