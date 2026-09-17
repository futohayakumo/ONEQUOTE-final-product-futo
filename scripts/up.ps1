# One command brings everything up on Windows: PostgreSQL, the API, the site.
#
#   pnpm boot:win           # site in dev mode
#   pnpm boot:win -- -Prod  # site built and served — use this for the presentation
#   pnpm halt:win           # stop the API and the site
#
# Needs: Node 22+, pnpm, and PostgreSQL 16 — either the EDB installer
# (service "postgresql-x64-16", user postgres) or Docker Desktop
# (docker compose up -d db). See WINDOWS.md.
param([switch]$Prod)
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

function Say($m) { Write-Host $m -ForegroundColor Cyan }
function Listening($port) { (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) -ne $null }
function Wait-Url($url, $tries = 40) {
  for ($i = 0; $i -lt $tries; $i++) {
    try { Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2 | Out-Null; return $true } catch { Start-Sleep 1 }
  }
  return $false
}

# ── 1. PostgreSQL ────────────────────────────────────────────────────
$usingDocker = $false
if (Listening 5432) {
  Say "postgres  already up on :5432"
} else {
  $svc = Get-Service -Name "postgresql-x64-16" -ErrorAction SilentlyContinue
  if ($svc) {
    Start-Service $svc
    Say "postgres  started (Windows service)"
  } elseif (Get-Command docker -ErrorAction SilentlyContinue) {
    docker compose up -d db | Out-Null
    $usingDocker = $true
    Say "postgres  started (docker compose db)"
  } else {
    throw "No PostgreSQL found. Install PostgreSQL 16 (EDB installer) or Docker Desktop. See WINDOWS.md."
  }
  for ($i = 0; $i -lt 20 -and -not (Listening 5432); $i++) { Start-Sleep 1 }
}

# ── 2. Dependencies and the API's .env ──────────────────────────────
if (-not (Test-Path node_modules)) { Say "pnpm install"; pnpm install }
if (-not (Test-Path api/.env)) {
  if ($usingDocker -or (docker compose ps db 2>$null | Select-String running)) {
    $url = "postgresql://quotation:quotation@localhost:5432/quotation"
  } else {
    $pw = Read-Host "PostgreSQL password for user 'postgres' (from the installer)"
    $url = "postgresql://postgres:$pw@localhost:5432/quotation"
  }
  (Get-Content api/.env.example) -replace "postgresql://USER@localhost:5432/quotation", $url | Set-Content api/.env
  Say "api/.env  written"
}

# ── 3. Database: create if missing, then migrate ────────────────────
$dbUrl = ((Get-Content api/.env | Select-String '^DATABASE_URL=') -replace '^DATABASE_URL=', '') -replace '"', ''
$createdb = Get-Command createdb -ErrorAction SilentlyContinue
if (-not $createdb) {
  $cand = "C:\Program Files\PostgreSQL\16\bin\createdb.exe"
  if (Test-Path $cand) { $createdb = $cand }
}
if ($createdb -and -not $usingDocker) {
  $u = [uri]$dbUrl
  $env:PGPASSWORD = ($u.UserInfo -split ':')[1]
  & $createdb -h localhost -U ($u.UserInfo -split ':')[0] quotation 2>$null
  if ($LASTEXITCODE -eq 0) { Say "database  quotation created" }
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
Push-Location api
pnpm exec prisma migrate deploy | Out-Null
pnpm exec prisma generate | Out-Null
Pop-Location
Say "database  migrated"

# ── 4. The API ──────────────────────────────────────────────────────
if (Listening 4000) {
  Say "api       already up on :4000"
} else {
  Start-Process -FilePath "pnpm" -ArgumentList "start" -WorkingDirectory (Join-Path (Get-Location) "api") -WindowStyle Minimized
  if (-not (Wait-Url "http://localhost:4000/v1/health")) { throw "API did not come up on :4000" }
  Say "api       started (minimised window)"
}
$health = (Invoke-WebRequest -UseBasicParsing http://localhost:4000/v1/health).Content
if ($health -match '"ports":0') {
  Say "ingest    pulling ECB rates and UN/LOCODE ports (one-off, ~20 s)"
  Invoke-WebRequest -UseBasicParsing -Method Post http://localhost:4000/v1/ingest/run | Out-Null
}

# ── 5. The site ─────────────────────────────────────────────────────
if (Listening 3000) {
  Say "site      already up on :3000"
} elseif ($Prod) {
  Say "site      building (production)"
  pnpm build
  Start-Process -FilePath "pnpm" -ArgumentList "start" -WindowStyle Minimized
  Say "site      started (production, minimised window)"
} else {
  Start-Process -FilePath "pnpm" -ArgumentList "dev" -WindowStyle Minimized
  Say "site      started (dev, minimised window)"
}
Wait-Url "http://localhost:3000" | Out-Null

Write-Host ""
Say "site      http://localhost:3000"
Say "swagger   http://localhost:4000/docs"
Say "health    $((Invoke-WebRequest -UseBasicParsing http://localhost:4000/v1/health).Content)"
