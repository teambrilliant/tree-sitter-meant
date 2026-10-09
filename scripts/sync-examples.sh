#!/usr/bin/env bash
# Copy the dsl repo's conformance corpus, preserving multi-file fixture directories.
set -euo pipefail
cd "$(dirname "$0")/.."
count=0
while IFS= read -r -d '' source; do
  relative="${source#../meant-lang/fixtures/}"
  target="examples/$relative"
  mkdir -p "$(dirname "$target")"
  cp "$source" "$target"
  count=$((count + 1))
done < <(find ../meant-lang/fixtures -type f -name '*.meant' -print0)
echo "synced $count examples from ../meant-lang/fixtures"
