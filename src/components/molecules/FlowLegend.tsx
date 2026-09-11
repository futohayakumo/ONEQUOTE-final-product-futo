"use client";

import { useT } from "../providers/LocaleProvider";

export function FlowLegend() {
  const t = useT();
  return (
    <div className="flex flex-col gap-3 border border-border bg-studio p-4 rounded-sharp">
      <span className="type-eyebrow">{t("flow.legend.title")}</span>
      <div className="flex flex-col gap-2.5">
        <span className="flex items-center gap-3 type-caption">
          <svg width="34" height="6" aria-hidden>
            <path d="M0 3h26" stroke="#E1127A" strokeWidth={2} />
            <path d="M34 3 L26 0.5 L26 5.5 Z" fill="#E1127A" />
          </svg>
          {t("flow.legend.route")}
        </span>
        <span className="flex items-center gap-3 type-caption">
          <svg width="34" height="6" aria-hidden>
            <path d="M0 3h26" stroke="#CBD5E1" strokeWidth={1} />
            <path d="M34 3 L26 0.5 L26 5.5 Z" fill="#CBD5E1" />
          </svg>
          {t("flow.legend.default")}
        </span>
        <span className="flex items-center gap-3 type-caption">
          <svg width="34" height="6" aria-hidden>
            <path
              d="M0 3h34"
              stroke="#CBD5E1"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </svg>
          {t("flow.legend.direct")}
        </span>
      </div>
    </div>
  );
}
