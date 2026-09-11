"use client";

import { useT } from "../providers/LocaleProvider";

export function SkipLink() {
  const t = useT();
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:border focus:border-crimson focus:bg-studio focus:px-4 focus:py-2 focus:type-label focus:rounded-card"
    >
      {t("nav.skip")}
    </a>
  );
}
