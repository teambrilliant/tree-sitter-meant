// Drift alarm: keywords.json must stay in sync with the live `meant spec 15` output.
// Lenient by design — §15 formats its inventory as a prose-annotated table, so we compare
// word sets with explicit allowlists rather than parsing the section's layout.
import K from "../keywords.json";

const proc = Bun.spawnSync(["meant", "spec", "15"]);
if (proc.exitCode !== 0) {
  console.error("cannot run `meant spec 15` — is meant on PATH? (bun add -g meant-lang)");
  process.exit(2);
}
const spec = proc.stdout.toString();

// §15's inventory is the section's single fenced block. Capitalized words (ActionRef) are
// examples, not keywords, so only all-lowercase tokens count.
const fence = spec.split("```")[1] ?? "";
const specWords = new Set(
  (fence.match(/[A-Za-z][A-Za-z0-9_-]*/g) ?? []).filter(w => /^[a-z][a-z0-9-]*$/.test(w)),
);

// Row labels and comment prose inside the fence — not vocabulary.
const SPEC_PROSE = new Set([
  "kinds", "the", "wrapper", "cross-cutting", "expressions",
  "fuse", "expr", "duration", "units", "two", "context", "entities",
]);
// §15 entries the grammar models as their own token class, not as a keyword string:
// `(planned)` is `marker`, `@handle` is `handle`.
const NON_KEYWORD_TOKENS = new Set(["planned", "handle"]);
// Duration units: §15 names them as a class ("duration units"), the grammar enumerates them.
const GRAMMAR_ONLY = new Set(K.units);

const grammarWords = new Set([...K.decl, ...K.other, ...K.context]);

const missingFromGrammar = [...specWords].filter(
  w => !grammarWords.has(w) && !SPEC_PROSE.has(w) && !NON_KEYWORD_TOKENS.has(w) && !GRAMMAR_ONLY.has(w),
);
const missingFromSpec = [...grammarWords, ...K.units].filter(
  w => !specWords.has(w) && !GRAMMAR_ONLY.has(w),
);

if (missingFromGrammar.length + missingFromSpec.length > 0) {
  if (missingFromGrammar.length) console.error(`in \`meant spec 15\` but not keywords.json: ${missingFromGrammar.join(", ")}`);
  if (missingFromSpec.length) console.error(`in keywords.json but not \`meant spec 15\`: ${missingFromSpec.join(", ")}`);
  process.exit(1);
}
console.log("keywords in sync with meant spec 15");
