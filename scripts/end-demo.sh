#!/usr/bin/env bash
# Ends a real-name demo and proves nothing was left behind.
#
# `git checkout main` alone does NOT clean up. A demo branch that was never
# committed points at the same commit as main, so the checkout is a no-op for
# file contents and the substituted working tree simply follows you across —
# onto the safe branch, one `git add .` away from the history.
#
# Untracked files survive even `checkout -f`, and the build output is not in
# git at all. Both have to be removed explicitly.
set -euo pipefail

SAFE_BRANCH="${1:-main}"

echo "Discarding the working tree and returning to ${SAFE_BRANCH}…"
git checkout -f "$SAFE_BRANCH"

for b in $(git branch --list 'demo/*' --format='%(refname:short)'); do
  echo "Deleting demo branch ${b}…"
  git branch -D "$b"
done

echo "Removing substitution backups…"
find . -name '*.bak' -not -path './node_modules/*' -delete

echo "Removing build output (it was compiled from the substituted source)…"
rm -rf .next

echo
if [ -n "$(git status --porcelain)" ]; then
  echo "REFUSING TO CONFIRM: the working tree is not clean."
  git status --short
  exit 1
fi

echo "Working tree clean. Running the leakage guard…"
bash scripts/check-tokens.sh
