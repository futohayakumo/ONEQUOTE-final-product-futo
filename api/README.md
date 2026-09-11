# Quotation API

The pricing the site does in the browser, behind an HTTP boundary, with two
things the browser cannot have: exchange rates that were actually fetched
from the ECB, and a record of every quotation issued.

```bash
# local, against a Postgres on localhost (brew install postgresql@16)
cp .env.example .env        # set your user in DATABASE_URL
pnpm install                # from the repository root
pnpm db:migrate             # creates the tables
pnpm ingest                 # ECB rates + UN/LOCODE seaports, once, now
pnpm dev                    # http://localhost:4000 — Swagger at /docs

# or, with Docker, from the repository root
docker compose up
```

| Route | What |
| :--- | :--- |
| `POST /v1/quotations` | Price a shipment. Returns three sailings all-in, the selected sailing's ticket by section, cut-offs, the partner document, and the total in other currencies at the fetched ECB rate with that rate's date |
| `GET /v1/quotations/:reference` | Replay a quotation exactly as issued |
| `GET /v1/rates` | The exchange rates in use, with source, date and fetch time |
| `GET /v1/ports?country=JP` | Seaports from UN/LOCODE in the routed countries |
| `POST /v1/ingest/run` | Fetch both sources now (also runs daily at 06:00 UTC) |
| `GET /v1/health` | Up, and how many rates and ports are loaded |

## Where the numbers come from

- **Exchange rates** — European Central Bank reference rates, via
  [Frankfurter](https://api.frankfurter.dev/), an open mirror of the ECB
  feed. Fetched by the ingest, stored with the ECB's own date, served from
  the table. A quotation never calls the ECB.
- **Ports** — [UN/LOCODE](https://github.com/datasets/un-locode), the UNECE
  code list, filtered to seaports in the seven countries the site routes
  through. 2,272 of them, with coordinates where the list has them.
- **Prices** — the portfolio's own model, imported from `../src/lib`: lane
  base rates, container factors, surcharges and tier discounts. Not a
  carrier tariff, and every response says so in `provenance`.

The service and the site share `pricing.ts`, `charges.ts`, `sailings.ts`
and `quoteDocument.ts` by import, so a price the browser computes offline
and a price this service returns are the same number for the same inputs.

## Runtime

Run with `@swc-node/register`, not `tsx`: swc emits decorator metadata,
which Nest's dependency injection and its validation pipe both read. Under
esbuild the pipe silently validated nothing. The root `package.json` is
`"type": "module"` so the shared modules load as ESM here too.
