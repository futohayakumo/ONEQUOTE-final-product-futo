"use client";


/**
 * The comps show two views. Only the system map is built, and the second is
 * labelled rather than faked — the same way the comps themselves mark the
 * multimodal tab on the business screen. A tab that looks live and does
 * nothing is worse than one that says it is not ready.
 */
import { useT } from "../shell/LocaleProvider";

export function ViewTabs() {
  const t = useT();
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border">
      {/* Not a tablist. One tab and no tabpanel announces "tab 1 of 1" over a
          control that does nothing; the honest markup is a heading and a note.
          The business screen already does it this way. */}
      <div className="flex gap-7">
        <span className="relative pb-3 type-label text-crimson-ink">
          {t("eng.systemMap")}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-0.5 bg-crimson"
          />
        </span>
        <span className="pb-3 type-label text-muted">
          {t("eng.c4")}{" "}
          <span className="type-caption">{t("business.search.notBuilt")}</span>
        </span>
      </div>
    </div>
  );
}
