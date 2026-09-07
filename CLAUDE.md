# ONEportfolio — working rules

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
| `border` | `#CBD5E1` | 1px outlines |
| `charcoal` | `#0F172A` | headings, console background |
| `muted` | `#64748B` | captions, metadata |
| `crimson` | `#E1127A` | accent — **under 10% of any screen** |
| `tint` | `#FDF2F8` | active item background |
| `console` | `#0F172A` | terminal background |
| `terminal` | `#34D399` | **console only** (1.75:1 on white) |

Type scale, as bundled utilities: `type-display` (56px, hero H1 and the three
persona titles only), `type-page`, `type-section`, `type-body`, `type-label`,
`type-caption`, `type-console`, `type-eyebrow`.

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

Borders stay 1px; active states may use 2px crimson. Elevation is measured off
the comps, where a card edge is a 1px rule with a short, very low-contrast ramp
beneath it. **If you can point at it and call it a shadow, it is already too
much.**

**Gradients are legal in exactly one place**: a charcoal scrim over a
photograph, spelled with `scrim-l`, `scrim-b` or `scrim-full`. Never as a fill,
never on a button, never between two hues. If a gradient is not sitting on an
`<img>`, it is a mistake. v2 banned them outright; the comps put type over
full-bleed photography, and no flat overlay both darkens the type side enough
and leaves the picture side alone.

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

Crimson is allowed on: primary CTA fills, the eyebrow label and its 2px rule,
an active node's 2px border, the selected connector, numbered badges, link
arrows, and the focus ring. Nothing else.

## Publishing safety

This repository is written to be published. Three things follow from that:

- **`intro.md` and `examples/` are gitignored, not deleted.** The spec carries
  the real-name mapping table in full, so shipping it would defeat every
  abstraction in the app. They stay on disk as local design inputs.
- **`pnpm check:tokens` scans every tracked file, tracked filenames, the
  deployable project name, AND git history** — not just `src/`. A public repo
  publishes its history, so removing a file from the working tree is not enough.
- **The guard's own pattern is base64.** A script that spells out the list of
  masked names is an answer key, not a guard.

The `name` in `package.json` determines the deploy subdomain. It must never
identify the client.

## Zero-leakage naming

Never use a real organisation, client, vessel, vendor or internal project name
— in copy, comments, class names, test fixtures, env var names, or simulated
payloads. Only these mapped names:

`Core Quotation Module`, `Quotation Flex Cart`, `Volume Loyalty Framework`,
`Campaign Cohort Hub`, `Legacy ERP Engine`, `Global Liner Alliance`,
`Technical Advisor (TA)`, `Lead Product Owner (LPO)`, `Agile Delivery Protocol`.

This applies to code, copy, comments, class names, test fixtures, environment
variable names, simulated payloads, commit messages, filenames and assets.

## Architecture notes

- All six routes must stay statically rendered. Never read `searchParams` on
  the server; sync selection state client-side with `history.replaceState`.
- `three.js` may only be imported from `src/components/process/scene/**`.
  ESLint enforces this. The 2D UI and the no-WebGL fallback share
  `components/process/model/processModel.ts`, which has no runtime imports at
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
