# Integrated Portfolio for Enterprise Delivery

An interactive portfolio built during an internship at OTSV / ONE. It shows one
engineer's understanding of the ocean-freight quotation business, the system
that serves a quotation, and the delivery process that ships that system. It
reads as an enterprise product showcase, not a dashboard and not a personal
site, and every figure on it is computed by the code rather than typed in.

**This repository identifies the client and is private.** The wordmark is real,
the throughput and defect figures are the ones the team adopted, and
the photography carries the name. Do not add a remote and do not push. The
rules for working in the tree are in `CLAUDE.md`; this file describes what is
here.

## Running it

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm verify         # token guards, types, lint, unit tests, production build
pnpm locales:check  # the three bundles carry the same keys and placeholders
pnpm build:static   # STATIC_EXPORT=1 -> out/, plain files for any static host
```

The site renders in English, Japanese and Vietnamese from
`src/locales/{en,ja,vi}.json`. The bundles are imported directly, so the
running site has no network dependency on the translation platform;
`pnpm locales:pull` refreshes them from Lokalise before a build and a failed
pull leaves the last good bundle in place.

## The five screens

| Route | What it does |
| :--- | :--- |
| `/` | Entrance. QUOTE / TO BERTH across a photograph, then the journey from quote to delivery, the network, the quotation screen on a tilted panel, and the three perspectives |
| `/business` | The real ONE QUOTE flow, observed first-hand: origin, destination, container rows of equipment × quantity × weight, commodity, and a departure day from a calendar priced per day; then the options from that day with sort, a freight view, filters and a per-option timeline; then the accepted option with value-added services, the ticket, and the document as JSON and email text |
| `/engineering` | The 1.3 seconds after a customer presses Quote, told as a pinned horizontal journey — web app, Node.js gateway, ONE Quote Booking, Apigee, rate engine — with the request's clock running. Then why the system is in pieces, in the business's terms. The system map (the services the technical lead named, in his grouping), the C4 views, the code and the log are behind one button |
| `/process` | Traditional scrum against AI-DLC. Five roles with a queue at every hand-off, or one Bolt of four phases inside 72 working hours. The adopted figures (×3 throughput, ×5 defects found — a POC benchmark, not yet the team's own record), the 3D simulation behind one click, and the three rules the tooling enforces |
| `/process/quiz` | Five questions on those rules, reached from the end of the process screen |

All five are statically rendered and must stay so. A loading screen — a ship
crossing three points, cut frame to frame — plays once per tab.

## Things worth knowing before changing anything

**The design system is enforced by omission.** Off-token utilities such as
`shadow-md`, `rounded-lg` or `text-2xl` compile to nothing rather than raising
an error, so a mistake fails silently and flat. `pnpm check:tokens` is what
catches it. The rules live in `CLAUDE.md`; the tokens live in
`src/app/globals.css` and nowhere else. Note that the guard reads utility
classes, not hex literals: the three.js materials kept the old magenta accent
for two weeks after the palette moved, and nothing flagged it.

**Components are laid out by Atomic Design.** `src/components/` is `atoms/`,
`molecules/`, `organisms/` (grouped by screen), `templates/` and `providers/`.
A component takes the folder its composition earns, not the folder its screen
suggests. The table is in `CLAUDE.md`.

**The quotation model is pure and deterministic.** `src/lib/pricing.ts` calls
no `Date` and no `Math.random`, so identical inputs always yield an identical
quote reference. `src/lib/charges.ts` builds the full ticket — origin, ocean,
destination — with haulage where the scope is Door, and groups every line
into the four freight-view switches.
The option card and the ticket print the same figure because they call the
same function; the day they did not, a reviewer found it in a minute.

**The engineering journey reads the same trace as the log.** `src/lib/trace.ts`
walks the quotation route once and produces the hops, the log and the total.
The journey's clock, its per-step figures and the "1.3 seconds" in the heading
are that walk; nothing on the page re-adds milliseconds on its own.

**The quality band carries one source and nothing else.** ×3 throughput and
×5 defects *found* are the external POC benchmark the team adopted with
AI-DLC — not, as this site said until 2026-09-16, the team's own
measurement. The team's own delivery is tracked in Jira and reported every
two weeks, but has not yet been reported as a multiplier, and the band says
so at the same size as the claim. The 80% break-even catch rate is 1 − 1/5,
arithmetic on the adopted figure. Everything anybody else published sits
behind the modal, labelled as theirs. `src/lib/quality.ts` has the sources.

**The delivery timing model is shared, not duplicated.**
`src/components/organisms/process/model/processModel.ts` has no runtime imports
at all, so the WebGL scene, the 2D readout and the no-WebGL fallback all
compute the same numbers, and the node test runner executes it directly. The
traditional room is a queueing model whose constants were chosen to draw a
curve, and it says so on the page. The AI-DLC room is anchored to the one
figure the lifecycle states about itself — a cap of 72 *working* hours, per
the technical lead — so the largest item on the tray uses the whole window
and the rest are in proportion, at eight hours to a working day.

**The two rooms do not share a station list.** Traditional has five roles —
product owner, designer, developer, QA, two reviewers — because a queue forms
in front of a person, not a verb. AI-DLC has the four phases of a Bolt:
Inception, 2-PC Construct, Verification, The Bolt. They share the span and the
camera so the comparison is like for like; the different count is the point.

**three.js is fenced in.** It may only be imported from
`src/components/organisms/process/scene/**`, enforced by ESLint and by
`check:tokens`. It loads as one lazy chunk on the process route, on demand,
and the other four screens never pay for it.

**Flags are drawn.** Seven inline SVGs on a 24×16 box with the site's
hairline, so a white field has an edge on a white page. They were emoji, which
are whatever the platform decides.

## What is still unverified

Three parts of the site state structure that has not been confirmed with a
real employee and will be corrected after interviews:

1. what the automated review actually catches on this team's delivery —
   the record exists in Jira, reported every two weeks, but no multiplier
   has been reported from it;
2. inside the quotation, the exact charge-line codes the product prints and
   what its "tariff" display mode shows — the three pages of the flow were
   observed and rebuilt, the line codes inside the detail panel were not;
3. **corrected 2026-09-16** — the system map now carries the services,
   the two gateways and the analytics isolation as the technical lead
   described them (`src/lib/flow-data.ts` says what was confirmed). What
   is still this site's reading: which service calls which, the components
   inside ONE Quote Booking, and what OSL+ covers.

Do not add invented detail to those areas in the meantime.

## Stack

Next.js 16 (App Router, Turbopack), Tailwind CSS v4 with a CSS-first token
theme, TypeScript, and `clsx`. The flow diagram is measured DOM plus plain
SVG, the drag and drop is native, the C4 views are Mermaid loaded only when
opened, and the horizontal journey is one `requestAnimationFrame` loop against
a pinned viewport. No animation library, no component library.

The exception is the process screen's simulation, which uses three.js through
react-three-fiber. An animated model was worth roughly 250 kB gzipped, so the
cost is fenced in as above, and a no-WebGL fallback implements the same
contract and computes the same numbers.

Pages are served `noindex`. `pnpm build:static` is opt-in behind
`STATIC_EXPORT=1` so `pnpm build`, which `pnpm verify` runs, keeps exercising
the same server build that `pnpm start` serves.
