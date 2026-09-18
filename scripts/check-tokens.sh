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

# Geometry and elevation.
#
# v3 opened up what v2 closed: three radii instead of one, two shadows instead
# of none, and gradients over photographs. The set is still closed, so the
# grep still has work to do -- it just guards a different fence.
#
# rounded-full is now legal (badges, avatars, radio dots) and is spelled with
# Tailwind's own hardcoded calc(infinity * 1px), which is why it never obeyed
# the --radius-* reset in the first place. Everything between 4px and 10px is
# still off-token and still emits nothing, so it has to be caught here.
# BSD grep has no -P, so the legal shadows are subtracted with a second pass
# rather than expressed as a negative lookahead.
report "no off-token radius or elevation" \
  "$(printf '%s\n' "$CLASS_LINES" \
     | grep -E 'rounded-(xs|sm|md|lg|xl|2xl|3xl|4xl)|(^|[ "'\''`])shadow-[a-z0-9]|drop-shadow|inset-shadow|(^|[ "'\''`])blur-[a-z0-9]' \
     | grep -vE '(^|[ "'\''`])shadow-(card|raised|none)($|[ "'\''`])')"

# Gradients are legal in exactly one place: a charcoal scrim over a photograph,
# spelled with one of the three named scrim-* utilities. A raw gradient class in
# a component is either a fill or a button, and both are still forbidden.
report "gradients only via the named photo scrims" \
  "$(printf '%s\n' "$CLASS_LINES" | grep -E 'bg-gradient|bg-linear|bg-radial')"

# Off-scale type utilities compile to NOTHING and fail silently, so grep is the
# only thing standing between a typo and 15px inherited text.
report "no off-scale type utilities" \
  "$(printf '%s\n' "$CLASS_LINES" | grep -E '(^|[ "'\''`])text-(xs|sm|base|lg|xl|[2-9]xl)($|[ "'\''`])|font-serif')"

# Six places had re-invented the small-caps label role at three tracking values
# and four colours. type-eyebrow and type-overline are the only two spellings;
# an arbitrary tracking value means a seventh is being born.
report "no hand-rolled small-caps labels" \
  "$(printf '%s\n' "$CLASS_LINES" | grep -E 'tracking-\[')"

report "no serif display faces anywhere" \
  "$(grep -rnE 'Playfair|Georgia|Times New Roman' src/ 2>/dev/null | grep -v 'NOT defined')"

# ── ZERO LEAKAGE — REMOVED ──────────────────────────────────────────────────
# The name checks are gone, deliberately, and this note is here so nobody
# reintroduces them by halves.
#
# The site is no longer built to hide the client. The photography carries the
# wordmark on a hull, a jacket and a truck, and this script cannot read a PNG —
# it said so itself, every run, in the line about unscanned binaries. Keeping a
# guard that passes while the leak sits in the artwork is worse than having no
# guard: it reports safety it cannot check.
#
# What that means for anyone reading this later:
#   - The repository now identifies the client. Treat it as private.
#   - `intro.md`, `examples/` and `main.py` stay gitignored anyway. They hold
#     the mapping table and the substitution script, which are a different kind
#     of disclosure from a product name.
#   - Real names are also in the git history from early commits. That was
#     already true and is now intentional rather than an outstanding fix.
#
# The design-token guards below are untouched. They were never about names.

report "Terminal Green confined to the console" \
  "$(grep -rn 'text-terminal' src/ 2>/dev/null | grep -vE 'components/(organisms/engineering/RequestLog|atoms/CodeBlock)')"

# three.js must stay inside the lazily-loaded scene chunk, or the other five
# screens start paying ~250 kB for a renderer they never use.
report "three.js confined to components/organisms/process/scene/" \
  "$(grep -rlE 'from "(three|@react-three/|maath)' src/ 2>/dev/null | grep -v 'components/organisms/process/scene/')"

exit $fail
