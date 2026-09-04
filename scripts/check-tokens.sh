#!/usr/bin/env bash
# Design-system and zero-leakage guards. Exits non-zero on any violation.
#
# The utility checks scan only lines that mention className, so the token
# DEFINITIONS in globals.css and three.js props like shadow-camera-left are not
# mistaken for violations.
set -u
fail=0

report() {
  local label="$1" out="$2"
  if [ -n "$out" ]; then
    printf 'FAIL: %s\n' "$label"
    printf '%s\n' "$out" | head -20
    fail=1
  else
    printf '  ok: %s\n' "$label"
  fi
}

CLASS_LINES=$(grep -rn 'className' src/ --include='*.tsx' --include='*.ts' 2>/dev/null)

# Geometry and elevation. rounded-full survives the --radius-* reset because
# Tailwind hardcodes it to calc(infinity * 1px), so it has to be caught here.
report "no off-token radius, shadow, gradient or blur" \
  "$(printf '%s\n' "$CLASS_LINES" | grep -E 'rounded-(full|xs|sm|md|lg|xl|2xl|3xl|4xl)|(^|[ "'\''`])shadow-[a-z0-9]|drop-shadow|inset-shadow|bg-gradient|bg-linear|bg-radial|(^|[ "'\''`])blur-[a-z0-9]')"

# Off-scale type utilities compile to NOTHING and fail silently, so grep is the
# only thing standing between a typo and 15px inherited text.
report "no off-scale type utilities" \
  "$(printf '%s\n' "$CLASS_LINES" | grep -E '(^|[ "'\''`])text-(xs|sm|base|lg|xl|[2-9]xl)($|[ "'\''`])|font-serif')"

report "no serif display faces anywhere" \
  "$(grep -rnE 'Playfair|Georgia|Times New Roman' src/ 2>/dev/null | grep -v 'NOT defined')"

# ── ZERO LEAKAGE ────────────────────────────────────────────────────────────
# The pattern is base64 so this script does not itself publish the list of
# masked names. A guard that spells out the answer key is not a guard.
#
# Scope is every TRACKED file, not just src/: the spec, the README, commit
# messages and asset filenames are all part of a public repository, and an
# earlier version of this script missed a full mapping table sitting in the
# repo root.
LEAK_PATTERN=$(printf '%s' 'b2NlYW4gbmV0d29yayBleHByZXNzfFxiT05FIFFVT1RFXGJ8XGJPUFVTXGJ8bGF1bmNoZGFya2x5fGxva2FsaXNlfFxiamlyYVxifFxibGluaFxifFxiZGVuaXNcYg==' | base64 --decode)

tracked_hits=""
while IFS= read -r f; do
  [ "$f" = "scripts/check-tokens.sh" ] && continue
  if grep -liE "$LEAK_PATTERN" "$f" >/dev/null 2>&1; then
    tracked_hits="${tracked_hits}${f}"$'\n'
  fi
done < <(git ls-files 2>/dev/null)

report "no real organisation, vendor or person names in tracked files" "$tracked_hits"

# Filenames are published too.
report "no real names in tracked filenames" \
  "$(git ls-files 2>/dev/null | grep -iE "$LEAK_PATTERN" || true)"

# The deploy subdomain is derived from this. It must not name the client.
report "deployable project name is neutral" \
  "$(grep -E '"name"[[:space:]]*:' package.json | grep -iE "$LEAK_PATTERN" || true)"

# A public repository publishes its HISTORY, not just its tip. Removing a file
# from the working tree leaves every earlier commit intact and recoverable.
history_hits=""
if git rev-parse --git-dir >/dev/null 2>&1; then
  while IFS= read -r blob; do
    [ -z "$blob" ] && continue
    if git cat-file -p "$blob" 2>/dev/null | grep -qiE "$LEAK_PATTERN"; then
      history_hits="${history_hits}${blob}"$'\n'
    fi
  done < <(git rev-list --objects --all 2>/dev/null \
             | grep -E '\.(md|ts|tsx|css|json|txt)$' \
             | awk '{print $1}' | sort -u)
fi

if [ -n "$history_hits" ]; then
  printf 'FAIL: real names are recoverable from git history\n'
  printf '      Removing the file from the working tree does not remove it from\n'
  printf '      earlier commits. Nothing has been pushed yet, so this is still\n'
  printf '      fixable. To rebuild history as one clean commit:\n\n'
  printf '        git checkout --orphan clean && git add -A \\\n'
  printf '          && git commit -m "feat: interactive delivery portfolio" \\\n'
  printf '          && git branch -D main && git branch -m main\n\n'
  printf '      DO NOT add a remote or push until this passes.\n'
  fail=1
else
  printf '  ok: no real names recoverable from git history\n'
fi

# Terminal Green measures 1.75:1 on white — console surfaces only.
report "Terminal Green confined to the console" \
  "$(grep -rn 'text-terminal' src/ 2>/dev/null | grep -vE 'components/(quote/QuoteConsole|ui/CodeBlock)')"

# three.js must stay inside the lazily-loaded scene chunk, or the other five
# screens start paying ~250 kB for a renderer they never use.
report "three.js confined to components/process/scene/" \
  "$(grep -rlE 'from "(three|@react-three/|maath)' src/ 2>/dev/null | grep -v 'components/process/scene/')"

exit $fail
