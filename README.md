# tree-sitter-meant

Line-oriented tree-sitter grammar for Meant Lang, a DSL for business intent and observable behavior. The language, the `meant` CLI and the Zed extension live in [teambrilliant/meant-lang](https://github.com/teambrilliant/meant-lang).

**v1 is deliberately line-oriented.** Any line opening with one of the 9 kind keywords is a `declaration` (carrying `kind` / `id` / `name` fields — outline food); every other line is an anonymous token stream (color food). No blocks, no indentation, no external scanner. Grammar churn in Meant's productions therefore never bills an edit here — only changes to the §15 keyword inventory do, and those are erratum-gated in the spec and drift-checked by `scripts/check-keywords.ts`.

A low-precedence single-character fallback token means stray prose punctuation can never produce an `ERROR` node, which is what makes "the whole corpus parses clean" a hard gate rather than an aspiration.

## Loops

```bash
bun install
bun run sync        # refresh examples/ from all .meant fixtures, including nested domains
bun run check       # keyword drift → generate → corpus parse → snapshots
bun run highlight   # terminal color preview of examples/known-good.meant
bun run highlight examples/known-bad.meant
```

`bun run check` before every commit — Zed compiles `src/parser.c` from a pinned commit, so a commit with a stale `src/` is a broken editor install.

## Consumers

The Zed extension lives in the language repo at `editors/zed/`; it points here by repository URL and a pinned `rev`, and `editors/zed/languages/meant/highlights.scm` is the canonical copy of `queries/highlights.scm`. Every grammar change is a commit here plus a new sha there.

## License

[MIT](LICENSE). Copyright (c) 2026 Brilliant Consulting SL.
