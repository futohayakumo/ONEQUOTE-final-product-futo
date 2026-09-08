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

# ── ZERO LEAKAGE ────────────────────────────────────────────────────────────
# The pattern is base64 so this script does not itself publish the list of
# masked names. A guard that spells out the answer key is not a guard.
#
# Scope is every TRACKED file, not just src/: the spec, the README, commit
# messages and asset filenames are all part of a public repository, and an
# earlier version of this script missed a full mapping table sitting in the
# repo root.
LEAK_PATTERN=$(printf '%s' 'b2NlYW4gbmV0d29yayBleHByZXNzfFxiT05FIFFVT1RFXGJ8XGJPUFVTXGJ8bGF1bmNoZGFya2x5fGxva2FsaXNlfFxiamlyYVxifFxibGluaFxifFxiZGVuaXNcYg==' | base64 --decode)

# -I skips binary files. Without it a PNG's compressed bytes match the pattern
# by chance and the guard cries wolf on every run, which is worse than useless:
# a check that always fails is a check nobody reads.
tracked_hits=""
binaries=0
while IFS= read -r f; do
  [ "$f" = "scripts/check-tokens.sh" ] && continue
  if ! grep -Iq . "$f" 2>/dev/null; then
    binaries=$((binaries + 1))
    continue
  fi
  if grep -liE "$LEAK_PATTERN" "$f" >/dev/null 2>&1; then
    tracked_hits="${tracked_hits}${f}"$'\n'
  fi
done < <(git ls-files 2>/dev/null)

report "no real organisation, vendor or person names in tracked files" "$tracked_hits"

# Say the quiet part out loud. Skipping binaries is correct for a text pattern
# and it is also this repository's largest blind spot: a wordmark rendered into
# a photograph passes every check above. The eleven assets known to carry one
# are gitignored under public/assets/branded/, and nothing automated can tell
# whether the twelfth exists.
printf '  ..: %d tracked binary files were NOT scanned for names (images cannot be grepped)\n' "$binaries"

# Filenames are published too.
# The directory this repository lives in is itself a name, and the guard above
# cannot see it: `git ls-files` prints paths relative to the root, so the root's
# own name never appears in the scan. That is how a sessionStorage key built
# from the folder name sat in the source through every check -- the pattern
# matches the two-word product name, not the bare token the folder uses.
#
# This check skips itself, like the pattern scan above does, or it would report
# its own explanation as the violation.
REPO_DIR=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
report "the repository directory name appears in no tracked file" \
  "$(git grep -lI -i -- "$REPO_DIR" 2>/dev/null | grep -v '^scripts/check-tokens.sh$' || true)"

# Blob CONTENTS are scanned above; commit objects are not. Author name, author
# email and message text all publish with the repository and all survived every
# check here. An email address is a real name whatever the pattern says.
report "commit authorship carries no real name" \
  "$(git log --format='%an <%ae>' 2>/dev/null | sort -u | grep -iE "$LEAK_PATTERN" || true)"

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
  "$(grep -rn 'text-terminal' src/ 2>/dev/null | grep -vE 'components/(quote/QuoteConsole|engineering/RequestLog|ui/CodeBlock)')"

# three.js must stay inside the lazily-loaded scene chunk, or the other five
# screens start paying ~250 kB for a renderer they never use.
report "three.js confined to components/process/scene/" \
  "$(grep -rlE 'from "(three|@react-three/|maath)' src/ 2>/dev/null | grep -v 'components/process/scene/')"

exit $fail
