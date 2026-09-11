# Working rules

Run `pnpm verify` before every commit. It runs the token guards, TypeScript,
ESLint, the unit tests, and a production build.

## The design system is `intro.md` section 3. It is not negotiable.

**Do not colour-pick from `examples/*.png`.** Those comps are warm cream
(`#FAF7F2`) with a serif display face. The tokens are cool (`#F8FAFC`) with
Inter. The images are a layout reference only.

Nine colours, and no others:

| Token | Value | Use |
| :--- | :--- | :--- |
| `studio` | `#FFFFFF` | panels, card faces |
| `canvas` | `#F8FAFC` | app background |
| `border` | `#CBD5E1` | **decorative** hairlines: dividers, table rules |
| `control` | `#818FA3` | **interactive** boundaries: inputs, buttons, selectable rows |
| `charcoal` | `#0F172A` | headings, console background |
| `muted` | `#617187` | captions, metadata |
| `crimson` | `#B01838` | accent — **under 10% of any screen**. Legible as fill AND as type |
| `tint` | `#FDF2F3` | active item background |
| `console` | `#0F172A` | terminal background |
| `terminal` | `#34D399` | **console only** (1.75:1 on white) |
| `mist` | `#E2E8F0` | inert fills, progress tracks, disabled controls |
| `crimson-lift` | `#E4606F` | accent **type** on charcoal (5.27) |

**The accent is one token, and it used to be three.** `#E1127A` worked as a
fill and failed as type — 4.60 on studio, 4.39 on canvas, 4.21 on tint — so
text took a darkened `crimson-ink` while fills kept the magenta. `#B01838` is
darker to begin with and needs none of that: 6.92 / 6.62 / 6.34 as type on
studio, canvas and tint, and 6.92 for white on it as a fill. `crimson-ink` is
gone.

The one ground it cannot serve is `charcoal` (2.58). A dark band that wants
accent type takes `crimson-lift`, the same hue lightened until it clears 4.5
there. Picking by eye will look right and measure wrong.

Type scale, as bundled utilities: `type-hero` (up to 120px at weight 900,
**reserved for the home hero and nothing else** — the comp opens on two words
running across a photograph, and that composition does not exist at 56px),
`type-display` (56px, for the process hero),
`type-page`, `type-section`, `type-body`, `type-label`, `type-caption`,
`type-console`, `type-wordmark`.

Small-caps labels have exactly two spellings and no third. `type-eyebrow` is
the crimson section opener; `type-overline` is every other one — column
headings, panel titles, the words up the edge of a photograph — and sets no
colour, because colour is the axis that legitimately varies there. Both track
at 0.16em. Six places had re-invented this role at three tracking values and
four colours, which is the loudest single reason five screens can stop reading
as one product; `check:tokens` now fails on any `tracking-[…]`.

**v2 reserved `type-display` for the three persona titles.** Those had a screen
each at `/journeys`; they are now cards in the home page's closing band, and
56px does not fit in a 220px card. The rule moved with the design rather than
the cards being bent to fit it.

Geometry, as of v3. The refreshed comps use rounder corners and a whisper of
elevation, and they won that argument — but the set is still closed, and
anything outside it emits nothing rather than erroring.

| Token | Value | Use |
| :--- | :--- | :--- |
| `rounded-sharp` | 4px | chips, tags, inline marks |
| `rounded-card` | 10px | anything with a surface: cards, panels, inputs, buttons |
| `rounded-full` | pill | badges, avatars, radio dots |
| `shadow-card` | 1px + 3px | resting cards |
| `shadow-raised` | 4px + 12px | the one hovered or selected card |
| `shadow-none` | — | everywhere else |

Borders stay 1px; active states may use 2px crimson. **A control's boundary
takes `control`, not `border`.** WCAG 1.4.11 wants 3:1 where the boundary is
what makes the control perceivable, and `#CBD5E1` measures 1.48:1 on studio —
under half. Every input, select, button and selectable row on this site was
identified by nothing else. `border` stays where the rule does not apply:
dividers, table rules, the hairline under a heading.

`muted` is `#617187`, not `#64748B`. The old value cleared 4.5 on studio and
canvas and failed on `tint` at 4.36 — which is the active/selected ground, the
row the reader is on. On `console` it measured 3.75 and is replaced there by
`border`, which reads 12.02:1. Elevation is measured off
the comps, where a card edge is a 1px rule with a short, very low-contrast ramp
beneath it. **If you can point at it and call it a shadow, it is already too
much.**

**Gradients are legal in exactly one place**: a scrim over a photograph,
spelled with `scrim-l`, `scrim-b`, `scrim-full` (charcoal, for light type) or
`scrim-l-light` (white, for charcoal type). Never as a fill, never on a button,
never between two hues. If a gradient is not sitting on an `<img>`, it is a
mistake. v2 banned them outright; the comps put type over full-bleed
photography, and no flat overlay both pushes the type side far enough and
leaves the picture side alone.

Both directions exist because the comps use both, and picking the wrong one is
not a style slip — it decides whether the copy can be read at all. A band whose
type is charcoal must not sit on a charcoal scrim.

**Crimson means "look here".** That covers both the active state and the
invalid state, which is deliberate: an error needs the eye exactly as much as
an active selection does. Errors are never signalled by colour alone — they
always carry a message. Charcoal at 2px is the opposite register: resolved,
confirmed, factual. That is why the quiz marks a correct answer in charcoal and
a wrong one in crimson.

Decorative glyphs do not get the accent. It is reserved for primary calls to
action, active state, and the highlighted route.

Off-token utilities emit **nothing** rather than erroring, so a mistake fails
silently. `pnpm check:tokens` is what catches it — and note that it skips
binary files, so a real name rendered into a photograph passes every check in
this repository. That is why `public/assets/branded/` is gitignored.

Crimson is allowed on: primary CTA fills, the eyebrow label, an active node's
2px border, the selected connector, numbered badges, link arrows, the focus
ring, and **one word inside a hero heading** — the comps do this twice and it
is the only place the accent carries meaning rather than direction. Nothing
else.

Two corollaries that were violated and are worth stating. Decorative glyphs do
not get it: two crimson port dots in the route panel were the only warm marks
there, so the eye went to twelve pixels carrying no information. And a benefit
does not get it: crimson on the loyalty discount made a saving read as a
problem, in a charcoal invoice where it was the only colour.

**Crimson must mean one thing per screen.** On the process screen it marked
waiting on the left card and the AI-driven series on the chart 40px to its
right — two correct legends meaning opposite things, so a reader who trusted
the colour read the chart backwards. The accent belongs to whatever the screen
argues *for*.

## This repository identifies the client. Treat it as private.

It was built to be publishable with the client's identity removed, and that
constraint has been lifted. The wordmark is real, in `src/lib/brand.ts` and in
the photography, and the name checks in `check:tokens` are gone.

They were removed rather than relaxed for a reason worth keeping. The guard
read text; it could not read a PNG, and it said so on every run in the line
counting unscanned binaries. Once the wordmark is painted across a hull, a
jacket and a truck, a guard that passes is reporting a safety it never had the
means to check — which is worse than no guard, because someone will believe it.

Three things follow:

- **Do not add a remote, and do not push.** Real names are in the working tree
  and in the history from early commits.
- **`intro.md`, `examples/` and `main.py` stay gitignored.** A product name is
  one kind of disclosure; a mapping table and the script that applies it are
  another, and nothing has changed about those.
- **The design-token guards are untouched.** They were never about names, they
  catch the mistakes that fail silently, and `pnpm verify` is green — for the
  first time — so a red run now means something again.

The `name` in `package.json` is still neutral. It determines the deploy
subdomain, and there is no reason to spend the client's name on a hostname.

## Components are laid out by Atomic Design

`src/components/` has five folders and a file goes in exactly one of them:

| Folder | What lives there | Test |
| :--- | :--- | :--- |
| `atoms/` | one thing, composed of nothing else here — `Flag`, `Lines`, `ProgressBar`, `icons/` | imports no other component |
| `molecules/` | a few atoms with one job — `Modal`, `PageHeader`, `OptionRow`, `StoryPointChip`, `RouteLine` | imports atoms only |
| `organisms/` | a whole band or screen, grouped by the screen it belongs to — `home/`, `business/`, `engineering/`, `process/`, `quiz/` | composes molecules and atoms |
| `templates/` | the frame every page sits in — `SiteNav`, `SiteFooter`, `LoadingScreen` | |
| `providers/` | no pixels — `LocaleProvider`, `DocumentLocale`, `LocalizeScript` | |

Pages are `src/app/*/page.tsx`. The engineer reviewing this asked for the
source to be readable by its folder names, and this is the vocabulary they
named, so a new component takes the folder its composition earns rather than
the folder its screen suggests: a chip used by one screen is still a molecule.

## Architecture notes

- All five routes must stay statically rendered. Never read `searchParams` on
  the server; sync selection state client-side with `history.replaceState`.
- `three.js` may only be imported from `src/components/organisms/process/scene/**`.
  ESLint enforces this. The 2D UI and the no-WebGL fallback share
  `components/organisms/process/model/processModel.ts`, which has no runtime imports at
  all so the node test runner can execute it directly.
- Never call `new Date()` or read `sessionStorage` during render.
- `<Canvas flat>` is required. R3F's default ACESFilmic tone mapping shifts
  `#E1127A` toward salmon and would break the palette silently.
- The scene's camera fit lives in `useFrame`, so the frame loop must stay
  `always` while motion is on. On `demand` the fit never runs and the canvas
  renders nothing.
- The canvas mounts only after its wrapper has been measured. It is lazily
  imported into a subtree that is mid route-transition, and R3F's own first
  measurement can land before layout settles.
- Station labels are DOM, positioned from projected 3D coordinates. Never add
  text meshes; the type scale has to hold.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
