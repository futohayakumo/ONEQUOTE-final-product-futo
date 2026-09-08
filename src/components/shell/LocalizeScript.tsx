"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useLocale } from "./LocaleProvider";

/**
 * The Localize (localizejs.com) integration, running beside the Lokalise one.
 *
 * The two are opposite in kind and it is worth being precise about how.
 * Lokalise is a BUILD-time source of truth: keys live in the repository,
 * `pull-locales.mjs` writes JSON before the build, and the running site has no
 * vendor dependency. Localize is a RUN-time layer: a script scans the rendered
 * DOM, ships the strings it finds to a dashboard, and swaps text in place.
 *
 * They are both wired up so the difference can be measured on this codebase
 * rather than argued about. `scripts/analyse-localize-fit.mjs` reports what the
 * DOM-scanning model would and would not reach here.
 *
 * Off unless NEXT_PUBLIC_LOCALIZE_KEY is set, so a missing key is a no-op
 * rather than a console full of errors.
 */
const KEY = process.env.NEXT_PUBLIC_LOCALIZE_KEY;

/** Every method the snippet stubs, so a call before load is not a TypeError. */
const METHODS = [
  "translate", "untranslate", "phrase", "initialize", "translatePage",
  "setLanguage", "getLanguage", "detectLanguage", "getAvailableLanguages",
  "untranslatePage", "bootstrap", "prefetch", "on", "off",
  "hideWidget", "showWidget", "getSourceLanguage",
] as const;

declare global {
  interface Window {
    Localize?: Record<string, (...args: unknown[]) => unknown>;
  }
}

export function LocalizeScript() {
  const { locale } = useLocale();

  useEffect(() => {
    if (!KEY) return;
    window.Localize?.setLanguage?.(locale);
  }, [locale]);

  if (!KEY) return null;

  return (
    <>
      {/* afterInteractive, not beforeInteractive: the latter is only legal
          in pages/_document, and the stub only has to exist before the CDN
          script calls into it — which script order already guarantees. */}
      <Script id="localize-stub" strategy="afterInteractive">
        {`(function(a){if(!a.Localize){a.Localize={};for(var e=${JSON.stringify(METHODS)},t=0;t<e.length;t++)a.Localize[e[t]]=function(){}}})(window);`}
      </Script>
      <Script
        src="https://global.localizecdn.com/localize.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.Localize?.initialize?.({
            key: KEY,
            rememberLanguage: false,
            // The site already owns language selection; two switchers on one
            // page is two sources of truth.
            disableWidget: true,
            autodetectLanguage: false,
            // Content on this site changes on interaction — selecting a node
            // re-times a whole panel — and the default only translates what was
            // in the DOM at load.
            retranslateOnNewPhrases: true,
            // Off in this experiment: it would post every rendered phrase to
            // the dashboard, including the ones interpolation has already
            // multiplied. See the fit analysis.
            saveNewPhrases: false,
          });
        }}
      />
    </>
  );
}
