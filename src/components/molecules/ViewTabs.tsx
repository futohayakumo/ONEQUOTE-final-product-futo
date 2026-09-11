"use client";

import cn from "clsx";
import { useT } from "../providers/LocaleProvider";

export type EngView = "map" | "c4";

/**
 * Two views, both built.
 *
 * The C4 tab used to be a label reading "not built" — honest at the time, and
 * the same treatment the multimodal tab on the business screen still carries.
 * Now that there is a panel behind it this is a real tablist, with the roles
 * and the arrow-key behaviour that implies.
 */
const TABS: { id: EngView; key: string }[] = [
  { id: "map", key: "eng.systemMap" },
  { id: "c4", key: "eng.c4" },
];

export function ViewTabs({
  view,
  onChange,
}: {
  view: EngView;
  onChange: (v: EngView) => void;
}) {
  const t = useT();

  const move = (dir: 1 | -1) => {
    const i = TABS.findIndex((tab) => tab.id === view);
    onChange(TABS[(i + dir + TABS.length) % TABS.length].id);
  };

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border">
      <div
        role="tablist"
        aria-label={t("eng.systemMap")}
        className="flex gap-7"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        {TABS.map((tab) => {
          const active = tab.id === view;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`engtab-${tab.id}`}
              aria-selected={active}
              aria-controls={`engpanel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative pb-3 type-label transition-colors duration-150",
                active ? "text-crimson" : "text-muted hover:text-charcoal",
              )}
            >
              {t(tab.key)}
              {active ? (
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-crimson"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
