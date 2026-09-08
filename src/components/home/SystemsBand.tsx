"use client";

import { ALL_NODE_IDS, STAGES } from "@/lib/flow-data";
import { useT } from "../shell/LocaleProvider";
import { SectionIntro } from "./SectionIntro";

/**
 * The split, drawn as a split.
 *
 * This band was a dark operations floor photographed from behind someone's
 * shoulder, with three statistics scrimmed over it. It said "systems and
 * people" and showed neither: a reader could not tell what was automated, what
 * was not, or why the boundary sits where it does — which is the only
 * interesting question in the sentence.
 *
 * Two columns, four lines each, and the counts underneath taken from the flow
 * data so the claim and the diagram cannot disagree.
 */
const SYSTEM = ["sys1", "sys2", "sys3", "sys4"];
const PEOPLE = ["hum1", "hum2", "hum3", "hum4"];

function Column({
  titleKey,
  items,
  accent,
}: {
  titleKey: string;
  items: string[];
  accent: boolean;
}) {
  const t = useT();
  return (
    <div className="flex flex-col border border-border bg-studio p-6 rounded-card shadow-card">
      <h3 className="type-label">{t(titleKey)}</h3>
      <ul className="mt-5 flex flex-col gap-4">
        {items.map((k) => (
          <li key={k} className="flex gap-3 type-caption">
            {/* Charcoal for the automated side, crimson for the human one:
                the accent belongs to the half this band argues for. */}
            <span
              aria-hidden
              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                accent ? "bg-crimson" : "bg-charcoal"
              }`}
            />
            {t(`home.03.${k}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SystemsBand() {
  const t = useT();
  const counts: Record<string, string | number> = {
    layers: STAGES.length,
    services: ALL_NODE_IDS.length,
    traced: 1,
  };

  return (
    <section className="border-b border-border bg-canvas">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-12 px-6 py-20">
        <div className="flex flex-col gap-14 lg:flex-row lg:gap-20">
          <SectionIntro
            no="03"
            titleKey="home.03.title"
            subtitleKey="home.03.subtitle"
            bodyKey="home.03.body"
            href="/engineering"
            linkKey="home.03.link"
          />

          <div className="grid min-w-0 flex-1 gap-6 sm:grid-cols-2">
            <Column
              titleKey="home.03.systemTitle"
              items={SYSTEM}
              accent={false}
            />
            <Column titleKey="home.03.peopleTitle" items={PEOPLE} accent />
          </div>
        </div>

        {/* What the engineering screen actually contains, so the link out
            makes a promise it can keep. */}
        <dl className="grid gap-x-10 gap-y-8 border-t border-border pt-8 sm:grid-cols-3">
          {["layers", "services", "traced"].map((k) => (
            <div key={k}>
              <dt className="type-label tnum">
                <span className="text-crimson-ink">{counts[k]}</span>{" "}
                {t(`home.03.${k}`)}
              </dt>
              <dd className="mt-2 type-caption">{t(`home.03.${k}Body`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
