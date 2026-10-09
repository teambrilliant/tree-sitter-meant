#!/usr/bin/env bash
# Parse every standalone example, including nested multi-file domain fixtures.
set -euo pipefail
cd "$(dirname "$0")/.."
export TREE_SITTER_DIR="$PWD/.tree-sitter"
files=()
while IFS= read -r -d '' file; do
  files+=("$file")
done < <(find examples -type f -name '*.meant' -print0)
if [[ ${#files[@]} -eq 0 ]]; then
  echo "no .meant examples found" >&2
  exit 1
fi
bunx tree-sitter parse --quiet --stat "${files[@]}"
