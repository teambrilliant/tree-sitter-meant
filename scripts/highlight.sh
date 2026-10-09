#!/usr/bin/env bash
# Terminal color preview (the L2 loop) — iterates queries/highlights.scm without touching Zed.
# Uses the repo-local .tree-sitter config so nothing on the machine needs configuring.
set -euo pipefail
cd "$(dirname "$0")/.."
TREE_SITTER_DIR="$PWD/.tree-sitter" exec bunx tree-sitter highlight "${@:-examples/known-good.meant}"
