"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "../icons/ArrowRight";
import { PlatformNote } from "../flow/PlatformNote";
import { useT } from "../shell/LocaleProvider";
import { EngineeringScreen } from "./EngineeringScreen";

/**
 * The map, the C4 views, the code and the log — behind one button.
 *
 * Nothing was removed. This is the same screen that used to be the whole
 * page, mounted when asked for. A `<details>` would have been simpler, but
 * the map measures its own nodes to draw the connectors and a closed details
 * element has no layout to measure; mounting on open means the measurement
 * runs against a real box.
 *
 * A deep link still works: `?n=` or the older `?c=` opens the detail so the
 * selected service is on screen, which is what the link promised.
 */
export function TechnicalDetail() {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q.has("n") || q.has("c")) setOpen(true);
  }, []);

  return (
    <section id="detail" className="border-t border-border">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="type-eyebrow">{t("detail.eyebrow")}</p>
            <h2 className="mt-5 max-w-[30ch] type-page">{t("detail.title")}</h2>
            <p className="mt-3 max-w-[56ch] type-body text-muted">
              {t("detail.lede")}
            </p>
          </div>
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex shrink-0 items-center gap-3 border border-charcoal bg-charcoal px-7 py-3.5 type-label text-studio rounded-card transition-colors duration-150 hover:border-crimson hover:bg-crimson"
            >
              {t("detail.open")}
              <ArrowRight size={18} />
            </button>
          ) : null}
        </div>

        {open ? (
          <div className="flex flex-col gap-14">
            <EngineeringScreen />
            <PlatformNote />
          </div>
        ) : null}
      </div>
    </section>
  );
}
