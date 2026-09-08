"use client";

import { useEffect } from "react";
import { t } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

/**
 * The two strings a translated page still announces in English.
 *
 * `<html lang>` and `<title>` are decided on the server, and this site is a
 * static export — there is one HTML file per route and it is built in the base
 * locale. Everything visible switches, and then a screen reader announces the
 * Vietnamese page in an English voice because the document still claims
 * `lang="en"`, and the tab strip still reads "Quotation simulator".
 *
 * The title needs an observer rather than one assignment. Next writes the
 * route's own title into <head> during hydration, AFTER this effect has run,
 * so a single assignment is silently reverted; and rendering a <title> of our
 * own does not help either — React hoists it as a SECOND element and the
 * browser keeps using the first. So we keep writing the first one, and watch
 * for anything that writes it back. The comparison makes the observer a
 * fixed point rather than a loop.
 *
 * The server-rendered English title is not a fallback that never runs — it is
 * the correct answer for the base locale and for anything that reads the page
 * without executing scripts.
 */
export function DocumentLocale({ titleKey }: { titleKey: string }) {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;

    const want = `${t(titleKey, locale)} — ${t("meta.site", locale)}`;
    const apply = () => {
      if (document.title !== want) document.title = want;
    };
    apply();

    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [locale, titleKey]);

  return null;
}
