# Integrated Portfolio for Enterprise Delivery

An interactive portfolio that shows one engineer's understanding of a global
ocean-freight business domain, the architecture that serves it, and the
delivery process that ships it. It is built to read as an enterprise product
showcase rather than a dashboard or a personal site.

Every organisation, system and person named in the application is a virtual
name. No real client, vessel, vendor or internal project code appears anywhere.

## Running it

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm verify         # token guards, types, lint, unit tests, production build
```

## The six screens

| Route | What it does |
| :--- | :--- |
| `/` | Entrance, and the case for the AI-driven development lifecycle behind the build |
| `/journeys` | Three persona gateways: business, engineering, process |
| `/journeys/business` | Quotation simulator, with a replayed transaction trace |
| `/journeys/engineering` | Request flow across four platform stages, with a what/when/how card per component |
| `/journeys/process` | An animated 3D comparison of two delivery approaches |
| `/journeys/process/quiz` | Five-question knowledge check on the team's rules |

All six are statically rendered.

## Things worth knowing before changing anything

**The design system is enforced by omission.** Off-token utilities such as
`shadow-md`, `rounded-lg` or `text-2xl` compile to nothing rather than raising
an error, so a mistake fails silently and flat. `pnpm check:tokens` is what
catches it. The rules live in `CLAUDE.md`; the tokens live in
`src/app/globals.css` and nowhere else.

**Do not colour-pick from `examples/*.png`.** Those comps are warm cream with a
serif display face. The tokens are cool with Inter. The images are a layout
reference only. Section 3 of `intro.md` is the authority.

**The quotation model is pure and deterministic.** `src/lib/pricing.ts` calls no
`Date` and no `Math.random`, so identical inputs always yield an identical
quote reference and an identical trace. Three worked lanes are pinned as test
fixtures.

**The delivery timing model is shared, not duplicated.**
`src/components/process/model/processModel.ts` has no runtime imports at all, so
the WebGL scene, the 2D readout and the no-WebGL fallback all compute the same
numbers, and the node test runner can execute it directly. The shape of that
model is the argument the screen makes: queue wait is superlinear in batch size
under traditional delivery and near-flat under AI-driven, so the advantage
widens from about 5x at 0.5 story points to about 14x at 8.

**three.js is fenced in.** It may only be imported from
`src/components/process/scene/**`, enforced by ESLint and by `check:tokens`.
It loads as one lazy chunk on the process route and nowhere else. The 3D
geometry is authored procedurally; `design/*.scad` are proportion sketches kept
as a record of intent, not build inputs.

## Stack

Next.js 16 (App Router, Turbopack), Tailwind CSS v4 with a CSS-first token
theme, TypeScript, and react-three-fiber for the one 3D screen. The only
runtime dependency outside that set is `clsx`.
