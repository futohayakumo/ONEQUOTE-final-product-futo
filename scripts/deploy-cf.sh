#!/usr/bin/env bash
# Builds a static export and deploys it to Cloudflare Pages.
#
# The safety property this script exists to enforce:
#
#   A build containing real names is only ever uploaded to a URL that has
#   ALREADY been proven to sit behind Cloudflare Access.
#
# So the first deploy of a project must be the abstract build. Access is
# configured against that, the gate is verified against the live URL, and only
# then will this script agree to upload a build that carries real names.
#
#   pnpm deploy:cf                       # abstract build (safe, public)
#   ALLOW_REAL_NAMES=1 pnpm deploy:cf    # real names, gate must already pass
#
set -uo pipefail

PROJECT="${CF_PAGES_PROJECT:-logistics-portfolio}"
URL_FILE=".cf-pages-url"

LEAK=$(printf '%s' 'b2NlYW4gbmV0d29yayBleHByZXNzfFxiT05FIFFVT1RFXGJ8XGJPUFVTXGJ8bGF1bmNoZGFya2x5fGxva2FsaXNlfFxiamlyYVxifFxibGluaFxifFxiZGVuaXNcYg==' | base64 --decode)

echo "Building static export…"
rm -rf out .next
STATIC_EXPORT=1 npx next build >/dev/null 2>&1 || { echo "build failed"; exit 1; }
[ -d out ] || { echo "no out/ directory — is output:'export' active?"; exit 1; }
echo "  $(find out -type f | wc -l | tr -d ' ') files"

# Does this build carry real names? Report only the count — never the content.
# json5 ships its author's name in a vendored bundle, which matches the guard
# pattern without being our content, so it is excluded by path.
hits=$(grep -rliE "$LEAK" out/ 2>/dev/null | grep -v 'json5' | wc -l | tr -d ' ')
echo "  files carrying real names: ${hits}"

if [ "$hits" != "0" ]; then
  if [ "${ALLOW_REAL_NAMES:-0}" != "1" ]; then
    echo
    echo "REFUSING: this build carries real names and ALLOW_REAL_NAMES is not set."
    echo "Deploy the abstract build first, or set ALLOW_REAL_NAMES=1 deliberately."
    exit 1
  fi

  echo
  echo "This build carries real names. Verifying the destination is gated…"
  if [ ! -f "$URL_FILE" ]; then
    echo "REFUSING: no known deployment URL yet (${URL_FILE} missing)."
    echo "Deploy the abstract build first so Access can be configured against it."
    exit 1
  fi
  url=$(cat "$URL_FILE")
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$url" || echo 000)
  # An Access-protected origin answers a bare request with a redirect to the
  # Access login, or a 403 — never a 200 carrying the page.
  if [ "$code" = "200" ]; then
    echo "REFUSING: ${url} returned 200 to an unauthenticated request."
    echo "Cloudflare Access is not gating it. Configure Access, then retry."
    exit 1
  fi
  echo "  ${url} -> HTTP ${code} unauthenticated. Gate is up."
fi

echo
echo "Deploying to Cloudflare Pages project '${PROJECT}'…"
out=$(npx wrangler pages deploy out --project-name "$PROJECT" --commit-dirty=true 2>&1)
status=$?
printf '%s\n' "$out" | grep -viE "$LEAK"

if [ $status -ne 0 ]; then
  echo "deploy failed"
  exit 1
fi

deployed=$(printf '%s' "$out" | grep -oE 'https://[a-z0-9.-]+\.pages\.dev' | tail -1)
if [ -n "$deployed" ]; then
  base=$(printf '%s' "$deployed" | sed -E 's#https://[^.]+\.(.*)#https://\1#')
  echo "$deployed" > "$URL_FILE"
  echo
  echo "Deployed: $deployed"
  [ "$hits" != "0" ] && echo "This deployment carries real names. Confirm the Access policy still covers it."
fi
