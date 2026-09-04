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

Geometry: `rounded-sharp` (4px) is the only legal radius. Borders are 1px;
active states may use 2px crimson. No shadows, no gradients, no glow, no pills.
The two sanctioned circles are the step-number badge and the radio mark — both
are marks, not containers.

Off-token utilities emit **nothing** rather than erroring, so a mistake fails
silently. `pnpm check:tokens` is what catches it.

Crimson is allowed on: primary CTA fills, the eyebrow label and its 2px rule,
an active node's 2px border, the selected connector, numbered badges, link
arrows, and the focus ring. Nothing else.

## Zero-leakage naming

Never use a real organisation, client, vessel, vendor or internal project name
— in copy, comments, class names, test fixtures, env var names, or simulated
payloads. Only these mapped names:

`Core Quotation Module`, `Quotation Flex Cart`, `Volume Loyalty Framework`,
`Campaign Cohort Hub`, `Legacy ERP Engine`, `Global Liner Alliance`,
`Technical Lead (TA)`, `Product Lead (PO)`, `Agile Delivery Protocol`.

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
