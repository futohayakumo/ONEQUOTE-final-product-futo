"use client";

import { useT } from "../../providers/LocaleProvider";

/**
 * The Scrum cheat-sheet: the one page a person keeps open in the first
 * week. Module 3 of the internship plan is "Scrum Cheat-sheet + 5-question
 * Mini Quiz", and this is the first half; the quiz underneath asks about
 * what is here.
 *
 * The content is the Scrum Guide 2020 (scrumguides.org) — three
 * accountabilities, five events with their time-boxes, three artifacts each
 * with its commitment, three pillars, five values — and then the practices
 * this team layers on it: story points, Definition of Ready, refinement,
 * and the delivery protocol. The guide's own numbers are used and nothing is
 * rounded; a time-box is a time-box.
 */

const ACCOUNTABILITIES = ["po", "sm", "devs"] as const;
const EVENTS = ["sprint", "planning", "daily", "review", "retro"] as const;
const ARTIFACTS = ["backlog", "sprintBacklog", "increment"] as const;
const PRACTICES = ["storyPoints", "dor", "dod", "refinement"] as const;
const PROTOCOL = ["commit", "approvals", "branches"] as const;

const SOURCE = "https://scrumguides.org/scrum-guide.html";

export function ScrumCheatSheet() {
  const t = useT();

  const card = (key: string, title: string, sub: string | null, body: string) => (
    <li key={key} className="flex flex-col gap-1.5 border-t border-border pt-4">
      <h3 className="type-label">{title}</h3>
      {sub ? <p className="type-caption text-crimson">{sub}</p> : null}
      <p className="type-caption">{body}</p>
    </li>
  );

  return (
    <section className="flex flex-col gap-12">
      <div>
        <p className="type-eyebrow">{t("cheat.eyebrow")}</p>
        <h2 className="mt-4 type-page">{t("cheat.title")}</h2>
        <p className="mt-3 max-w-[60ch] type-body text-muted">
          {t("cheat.lede")}{" "}
          <a
            href={SOURCE}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-crimson"
          >
            {t("cheat.source")}
          </a>
        </p>
      </div>

      {/* ── Three accountabilities ─────────────────────────────── */}
      <div>
        <h3 className="type-overline text-muted">{t("cheat.roles.title")}</h3>
        <ul className="mt-4 grid gap-6 sm:grid-cols-3">
          {ACCOUNTABILITIES.map((k) =>
            card(k, t(`cheat.roles.${k}`), t(`cheat.roles.${k}.owns`), t(`cheat.roles.${k}.body`)),
          )}
        </ul>
        <p className="mt-4 max-w-[60ch] type-caption">{t("cheat.roles.note")}</p>
      </div>

      {/* ── Five events, with the guide's time-boxes ─────────── */}
      <div>
        <h3 className="type-overline text-muted">{t("cheat.events.title")}</h3>
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {EVENTS.map((k) =>
            card(k, t(`cheat.events.${k}`), t(`cheat.events.${k}.box`), t(`cheat.events.${k}.body`)),
          )}
        </ul>
        <p className="mt-4 max-w-[60ch] type-caption">{t("cheat.events.note")}</p>
      </div>

      {/* ── Three artifacts, each with its commitment ───────── */}
      <div>
        <h3 className="type-overline text-muted">{t("cheat.artifacts.title")}</h3>
        <ul className="mt-4 grid gap-6 sm:grid-cols-3">
          {ARTIFACTS.map((k) =>
            card(
              k,
              t(`cheat.artifacts.${k}`),
              t("cheat.artifacts.commitment", { c: t(`cheat.artifacts.${k}.commitment`) }),
              t(`cheat.artifacts.${k}.body`),
            ),
          )}
        </ul>
      </div>

      {/* ── Pillars and values ───────────────────────────────── */}
      <div className="grid gap-6 border border-border bg-studio p-6 rounded-card lg:grid-cols-2">
        <div>
          <h3 className="type-label">{t("cheat.pillars.title")}</h3>
          <p className="mt-2 type-caption">{t("cheat.pillars.body")}</p>
        </div>
        <div>
          <h3 className="type-label">{t("cheat.values.title")}</h3>
          <p className="mt-2 type-caption">{t("cheat.values.body")}</p>
        </div>
      </div>

      {/* ── What this team adds to the guide ─────────────────── */}
      <div>
        <h3 className="type-overline text-muted">{t("cheat.practices.title")}</h3>
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRACTICES.map((k) => card(k, t(`cheat.practices.${k}`), null, t(`cheat.practices.${k}.body`)))}
        </ul>
      </div>

      <div>
        <h3 className="type-overline text-muted">{t("process.protocol.eyebrow")}</h3>
        <ul className="mt-4 grid gap-6 sm:grid-cols-3">
          {PROTOCOL.map((k) => card(k, t(`process.protocol.${k}`), null, t(`process.protocol.${k}Body`)))}
        </ul>
        <p className="mt-4 max-w-[60ch] type-caption">{t("cheat.quizNote")}</p>
      </div>
    </section>
  );
}
