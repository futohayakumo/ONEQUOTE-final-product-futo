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

# Zero-leakage. Must return nothing, in copy AND in code.
report "no real organisation, vendor or person names" \
  "$(grep -rniE 'ocean network express|\bONE QUOTE\b|\bOPUS\b|launchdarkly|lokalise|\bjira\b|\blinh\b|\bdenis\b' src/ 2>/dev/null)"

# Terminal Green measures 1.75:1 on white — console surfaces only.
report "Terminal Green confined to the console" \
  "$(grep -rn 'text-terminal' src/ 2>/dev/null | grep -vE 'components/(quote/QuoteConsole|ui/CodeBlock)')"

# three.js must stay inside the lazily-loaded scene chunk, or the other five
# screens start paying ~250 kB for a renderer they never use.
report "three.js confined to components/process/scene/" \
  "$(grep -rlE 'from "(three|@react-three/|maath)' src/ 2>/dev/null | grep -v 'components/process/scene/')"

exit $fail
