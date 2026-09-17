# Running this on Windows

Three things to install once, then one command.

1. **Node.js 22 LTS** — https://nodejs.org — then `corepack enable` in a terminal
   so `pnpm` is available (this repository pins pnpm in `package.json`).
2. **PostgreSQL 16**, either way:
   - the EDB installer — https://www.postgresql.org/download/windows/ — keep
     the default port 5432 and remember the password you set for `postgres`; or
   - Docker Desktop, in which case `docker compose up -d db` is what the
     script runs for you.
3. Unzip this folder somewhere without spaces in the path (e.g. `C:\dev\ONEportfolio`).

Then, in PowerShell inside the folder:

```powershell
pnpm install
pnpm boot:win -- -Prod   # first run asks for the postgres password, writes api/.env,
                         # migrates, pulls ECB rates and UN/LOCODE ports, builds the site
```

It ends with the three URLs. `pnpm boot:win` (without `-Prod`) runs the site in
dev mode; `pnpm halt:win` stops the API and the site.

If PowerShell refuses to run the script:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, then again.

What the script does, so you can do it by hand if something is different:
start PostgreSQL → `pnpm install` → write `api/.env` from `api/.env.example`
→ `createdb quotation` → `prisma migrate deploy` → start the API (`pnpm start`
in `api/`) → `POST /v1/ingest/run` if the tables are empty → `pnpm build`
and `pnpm start` at the root.
