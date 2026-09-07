# Screenshots

Full-page captures at 1512×950, 2× device pixel ratio, from a production build.

**These are of the masked build only.** They were taken from a separate
checkout of `main`, built and served in isolation, and that build was scanned
for real names before anything rendered it — zero hits in `src/`, and the only
match anywhere in the build output was a library author's name inside a
vendored `json5` bundle.

**Never put a real-name screenshot in this folder.** `pnpm check:tokens` reads
text; it cannot see inside a PNG. A leak that arrives as an image passes every
guard this repository has.

| File | Screen |
| :--- | :--- |
| `01-home.png` | Hero and the AI-driven development lifecycle panel |
| `02-journeys.png` | The three persona gateways |
| `03-quotation-simulator.png` | Quotation form and the empty console state |
| `04-system-flow-explorer.png` | Default request route across the four stages |
| `04b-…-node-selected.png` | Quotation Service selected: route re-drawn, deep dive open |
| `05-process-comparison-traditional.png` | The traditional floor — partitions, queues, the approval gate |
| `05b-…-ai-driven.png` | The AI-driven floor — one belt, gantries, no queues |
| `06-knowledge-check.png` | Quiz, first question |

Captured over the Chrome DevTools Protocol rather than `--screenshot`: the 3D
scene runs a continuous animation frame loop, so `--virtual-time-budget` never
decides the page is idle and Chrome hangs. WebGL renders under swiftshader.
