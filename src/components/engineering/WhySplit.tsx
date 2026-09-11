"use client";

import { useT } from "../shell/LocaleProvider";

/**
 * Why the system is in pieces, said in the business's terms.
 *
 * The service catalogue already answers this — every entry has a WHEN that
 * is a scene from the business, not a property of the software — but it was
 * reachable only by clicking a box on the map, one service at a time. These
 * three are the scenes that explain the split, lifted up to where a reader
 * who never opens the map will still see them.
 */
const REASONS = ["surge", "night", "gradual"] as const;

export function WhySplit() {
  const t = useT();
  return (
    <section className="border-t border-border bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-20">
        <div>
          <p className="type-eyebrow">{t("why.eyebrow")}</p>
          <h2 className="mt-5 max-w-[30ch] type-page">{t("why.title")}</h2>
          <p className="mt-3 max-w-[56ch] type-body text-muted">{t("why.lede")}</p>
        </div>
        <ul className="grid gap-8 sm:grid-cols-3">
          {REASONS.map((k) => (
            <li key={k} className="flex flex-col gap-2 border-t border-border pt-5">
              <h3 className="type-label">{t(`why.${k}.title`)}</h3>
              <p className="type-caption">{t(`why.${k}.body`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
