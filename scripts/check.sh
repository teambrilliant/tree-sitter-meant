#!/usr/bin/env bash
# The repo's single gate: keyword drift → generate → corpus parse → structure snapshots.
set -euo pipefail
cd "$(dirname "$0")/.."
export TREE_SITTER_DIR="$PWD/.tree-sitter"
bun scripts/check-keywords.ts
bunx tree-sitter generate
scripts/parse.sh
bunx tree-sitter test
