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
| `/journeys/engineering` | Request flow across four platform stages. Select any node to re-route the request and read what that component does |
| `/journeys/process` | An animated 3D comparison of two delivery approaches, with live queue and cycle-time readouts |
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

**Both delivery rooms share one layout on purpose.** The five station slots,
the spacing and the camera are identical, so the only visible differences
between them are real ones: partition walls and queue piles on one side, a
moving belt and AI gantries on the other. Labels are DOM elements positioned on
the scene's projected station coordinates, which is what keeps the drop targets
aligned with the model and the typography inside the design system.

**The flow map draws three layers, never seventeen.** The always-on spine, the
selected route, and the hovered node's direct connections. A numbered text
readout carries the same route for screen readers, and is the whole flow story
below 1024px where the connectors are not drawn at all.

## Publishing safety

The spec this was built from (`intro.md`) and the design mockups (`examples/`)
are deliberately gitignored: the spec contains the mapping between real names
and the abstractions used throughout the app, so publishing it would undo all
of them. `pnpm check:tokens` enforces this across every tracked file, tracked
filenames, the deployable project name and git history. A `pre-push` hook runs
the same guard, so a repository that would leak cannot be pushed by accident.

**One item is outstanding and needs a human decision.** The spec is gitignored
now, but it remains recoverable from an earlier commit, and a public repository
publishes its history. Nothing has been pushed, so this is still free to fix.
Rewriting history is not reversible, so it is left deliberately:

```bash
git checkout --orphan clean && git add -A   && git commit -m "feat: interactive delivery portfolio"   && git branch -D main && git branch -m main
```

Until `pnpm check:tokens` passes, do not add a remote.

### Running a real-name demo locally

Substituting the real names back in, to show the app to people who know them,
is safe only if the teardown is complete. It is easy to get wrong:

- `git checkout main` alone cleans nothing. A demo branch with no commit points
  at the same commit as main, so the checkout is a no-op for file contents and
  the substituted working tree follows you onto the safe branch.
- `git checkout -f` discards tracked changes but leaves untracked files, so the
  substitution script's `.bak` backups survive.
- `.next` is not in git at all, and it was compiled from the substituted
  source. Verified: 22 files in the build output carried real names.

```bash
git add . && git commit -m "safe state"
git checkout -b demo/real-name-verification
python main.py && pnpm build && PORT=3001 pnpm start
pnpm demo:end          # discards, deletes, cleans, then reports
```

`pnpm demo:end` reports on the four things the demo could have left behind — a
dirty tree, `.bak` backups, `.next`, real names in tracked files — and fails
only on those. The outstanding git-history item predates any demo, so it is
printed prominently but does not make a clean teardown read as a failure.

Use a port other than 3000 if an editor is forwarding it; a held socket makes
`next start` fail with `EADDRINUSE` before you see anything. The substitution script itself is
gitignored: it contains the mapping, so committing it would publish in one file
exactly what the abstractions exist to hide.

## Stack

Next.js 16 (App Router, Turbopack), Tailwind CSS v4 with a CSS-first token
theme, TypeScript, and `clsx`. Everything else is hand-rolled: the flow diagram
is measured DOM plus plain SVG, the drag and drop is native, the animations are
CSS keyframes and one `requestAnimationFrame` loop. No animation library, no
component library, no diagram library.

The exception is the Process Comparison screen, which uses three.js through
react-three-fiber. That is a deliberate trade: an animated model was worth
roughly 250 kB gzipped, so the cost is fenced in. ESLint forbids importing the
renderer outside `src/components/process/scene/**`, it loads as one lazy chunk
on one route, and the other five screens never pay for it. A no-WebGL fallback
implements the same contract and computes the same numbers.
