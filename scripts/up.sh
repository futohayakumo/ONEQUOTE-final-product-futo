#!/usr/bin/env bash
# One command brings everything up: PostgreSQL, the quotation API, the site.
#
#   pnpm boot          # site in dev mode
#   pnpm boot --prod   # site built and served — use this for the presentation
#   pnpm halt          # stop the API and the site (PostgreSQL stays up)
#
# Idempotent: anything already running is left alone. Every step says what it
# did, and the last lines are the three URLs.
set -euo pipefail
cd "$(dirname "$0")/.."

MODE="dev"; [[ "${1:-}" == "--prod" ]] && MODE="prod"

say() { printf '\033[1m%s\033[0m\n' "$*"; }
listening() { lsof -ti ":$1" >/dev/null 2>&1; }

# ── 1. PostgreSQL ────────────────────────────────────────────────────
if pg_isready -h localhost -p 5432 -q 2>/dev/null; then
  say "postgres  already up on :5432"
else
  PG_BIN=""
  for d in /opt/homebrew/opt/postgresql@16/bin /usr/local/opt/postgresql@16/bin; do
    [[ -x "$d/pg_ctl" ]] && PG_BIN="$d" && break
  done
  if [[ -n "$PG_BIN" ]]; then
    DATA="${PG_BIN%/bin}"; DATA="/opt/homebrew/var/postgresql@16"
    [[ -d "$DATA" ]] || DATA="/usr/local/var/postgresql@16"
    "$PG_BIN/pg_ctl" -D "$DATA" -l /tmp/pg.log start >/dev/null
    say "postgres  started (Homebrew)"
  elif command -v docker >/dev/null 2>&1; then
    docker compose up -d db >/dev/null
    say "postgres  started (docker compose db)"
  else
    echo "No PostgreSQL found. Install postgresql@16 with Homebrew, or Docker Desktop." >&2
    exit 1
  fi
  for _ in $(seq 1 20); do pg_isready -h localhost -p 5432 -q 2>/dev/null && break; sleep 1; done
fi

# ── 2. Dependencies and the API's .env ──────────────────────────────
[[ -d node_modules ]] || { say "pnpm install"; pnpm install; }
if [[ ! -f api/.env ]]; then
  if docker compose ps db 2>/dev/null | grep -q running; then
    URL="postgresql://quotation:quotation@localhost:5432/quotation"
  else
    URL="postgresql://$USER@localhost:5432/quotation"
  fi
  sed "s|postgresql://USER@localhost:5432/quotation|$URL|" api/.env.example > api/.env
  say "api/.env  written with $URL"
fi

# ── 3. Database: create if missing, then migrate ────────────────────
DB_URL=$(grep '^DATABASE_URL=' api/.env | cut -d= -f2- | tr -d '"')
if command -v createdb >/dev/null 2>&1 && ! psql "$DB_URL" -qtc 'select 1' >/dev/null 2>&1; then
  createdb quotation 2>/dev/null && say "database  quotation created" || true
fi
(cd api && pnpm exec prisma migrate deploy >/dev/null 2>&1 && pnpm exec prisma generate >/dev/null 2>&1) \
  && say "database  migrated" || { echo "prisma migrate failed — check DATABASE_URL in api/.env" >&2; exit 1; }

# ── 4. The API ──────────────────────────────────────────────────────
if listening 4000; then
  say "api       already up on :4000"
else
  # Detached fully — stdin, stdout and stderr all off the terminal — so the
  # script can exit while the server keeps running.
  nohup bash -c 'cd api && exec pnpm start' </dev/null >/tmp/api.log 2>&1 &
  disown
  for _ in $(seq 1 30); do curl -sf localhost:4000/v1/health >/dev/null 2>&1 && break; sleep 1; done
  say "api       started → /tmp/api.log"
fi
# Rates and ports: pull them if the table is empty (first run on a machine).
if curl -sf localhost:4000/v1/health | grep -q '"ports":0'; then
  say "ingest    pulling ECB rates and UN/LOCODE ports (one-off, ~20 s)"
  curl -sf -X POST localhost:4000/v1/ingest/run >/dev/null
fi

# ── 5. The site ─────────────────────────────────────────────────────
if listening 3000; then
  say "site      already up on :3000"
elif [[ "$MODE" == "prod" ]]; then
  say "site      building (production)"
  pnpm build >/tmp/next-build.log 2>&1 || { echo "build failed — see /tmp/next-build.log" >&2; exit 1; }
  nohup pnpm start </dev/null >/tmp/next.log 2>&1 &
  disown
  say "site      started (production) → /tmp/next.log"
else
  nohup pnpm dev </dev/null >/tmp/next.log 2>&1 &
  disown
  say "site      started (dev) → /tmp/next.log"
fi
for _ in $(seq 1 30); do curl -sf -o /dev/null localhost:3000 && break; sleep 1; done

echo
say "site      http://localhost:3000"
say "swagger   http://localhost:4000/docs"
say "health    $(curl -sf localhost:4000/v1/health)"
