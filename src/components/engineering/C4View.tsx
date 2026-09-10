"use client";

import { useState } from "react";
import { C4_LEVELS } from "@/lib/c4";
import { useT } from "../shell/LocaleProvider";
import { MermaidDiagram } from "./MermaidDiagram";

/**
 * The C4 view: three diagrams rendered from Mermaid source held in the page.
 *
 * The source is shown on request beside each diagram. That is not a debugging
 * affordance — it is the point. A diagram pasted in as a PNG is a picture of an
 * architecture; one rendered from text that lives next to the code can be
 * reviewed in a pull request like anything else.
 */
export function C4View() {
  const t = useT();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-10">
      <div>
        <h2 className="type-section">{t("c4.title")}</h2>
        <p className="mt-2 max-w-[76ch] type-caption">{t("c4.lede")}</p>
      </div>

      {C4_LEVELS.map((level) => (
        <article
          key={level.id}
          className="grid gap-6 border-t border-border pt-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-10"
        >
          <div className="flex flex-col gap-3">
            <span className="type-eyebrow tnum">{level.no}</span>
            <h3 className="type-section">{t(level.titleKey)}</h3>
            <p className="type-caption">{t(level.bodyKey)}</p>

            {level.chart ? (
              <button
                type="button"
                onClick={() => setOpen(open === level.id ? null : level.id)}
                className="mt-1 self-start type-caption text-crimson underline underline-offset-4 transition-colors duration-150 hover:text-charcoal"
              >
                {open === level.id ? t("c4.hideSource") : t("c4.showSource")}
              </button>
            ) : (
              <span className="mt-1 self-start border border-border px-3 py-1.5 type-caption rounded-full">
                {t("c4.notDrawn")}
              </span>
            )}
          </div>

          {level.chart ? (
            <div className="flex min-w-0 flex-col gap-3">
              <MermaidDiagram chart={level.chart} label={t(level.titleKey)} />
              {open === level.id ? (
                <div className="overflow-hidden border border-charcoal rounded-sharp">
                  <div className="border-b border-muted bg-console px-4 py-2 type-console text-border">
                    {t("c4.source")}
                  </div>
                  <pre tabIndex={0} className="overflow-x-auto bg-console px-4 py-3">
                    <code className="type-console text-border">{level.chart}</code>
                  </pre>
                </div>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}
