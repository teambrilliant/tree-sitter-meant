/// <reference types="tree-sitter-cli/dsl" />
const K = require("./keywords.json");

// Line-oriented v1: any line opening with a kind keyword is a declaration (outline food);
// every other line is a token stream (color food). No blocks, no indentation — deliberately,
// so production-level grammar churn never bills an edit here. Only the §15 keyword inventory
// does, and that is erratum-gated (and drift-checked by scripts/check-keywords.ts).
module.exports = grammar({
  name: "meant",

  extras: $ => [/[ \t]+/, $.comment],

  word: $ => $.word,

  rules: {
    document: $ => repeat(choice($.declaration, $.actor_clause, $._line, $._newline)),

    declaration: $ =>
      prec(1, seq(
        field("kind", $.kw_decl),
        optional(field("id", $.id)),
        optional(field("name", choice($.ref, $.word, $.context_entity))),
        repeat($._inline),
        $._newline,
      )),

    // Line-initial `by`/`to` clause — admission lists (`by owner, client`, `by owner:`) and
    // exposure consumers (`to client at "PDF"`). Every plain word on such a line resolves to an
    // actor value in the checker, so all of them color as actor_value. Mid-line `by`/`to`
    // (`check by execution`, prose) are kw_clause and unaffected: a generic line cannot *start*
    // with kw_clause, which is what keeps this deterministic.
    actor_clause: $ =>
      seq(choice("by", "to"), repeat(choice($.actor_value, $._nonword)), $._newline),

    actor_value: $ => $.word,

    _line: $ => seq($._head, repeat($._inline), $._newline),

    _head: $ =>
      choice(
        $.kw_other,
        $.unit,
        $.context_entity,
        $.marker,
        $.handle,
        $.deny_code,
        $.id,
        $.ref,
        $.string,
        $.number,
        $.vb_path,
        $.word,
        $.operator,
        $.punctuation,
      ),

    _nonword: $ =>
      choice(
        $.kw_other,
        $.kw_clause,
        $.unit,
        $.context_entity,
        $.marker,
        $.handle,
        $.deny_code,
        $.id,
        $.ref,
        $.string,
        $.number,
        $.vb_path,
        $.operator,
        $.punctuation,
      ),

    _inline: $ => choice($._head, $.kw_clause),

    kw_clause: $ => choice("by", "to"),

    kw_decl: $ => choice(...K.decl),
    kw_other: $ => choice(...K.other.filter(w => w !== "by" && w !== "to")),
    unit: $ => choice(...K.units),
    context_entity: $ => choice(...K.context),

    comment: $ => token(/#[^\n]*/),
    string: $ => token(/"[^"]*"/),
    number: $ => token(/[0-9]+(\.[0-9]+)?/),

    marker: $ => token(prec(5, "(planned)")),
    handle: $ => token(/@[a-z][a-z0-9_-]*/),

    // S001 / A004 / I016 / SC001 — letters then digits. Outranks ref on equal length.
    id: $ => token(prec(4, /[A-Z]{1,3}[0-9]{1,4}/)),
    // NOT_OPEN / LIMIT_REACHED — all-caps with an underscore. Outranks ref.
    deny_code: $ => token(prec(4, /[A-Z][A-Z0-9]*_[A-Z0-9_]+/)),
    // Capitalized declared-name reference.
    ref: $ => token(prec(1, /[A-Z][A-Za-z0-9_]*/)),
    // verified-by anchor: a slashed path, optionally with a #fragment.
    vb_path: $ => token(prec(2, /[A-Za-z0-9_.-]*\/[A-Za-z0-9_.\/-]*(#[A-Za-z0-9_.-]+)?/)),

    word: $ => token(/[a-z][a-z0-9_'-]*/),

    operator: $ =>
      choice(":=", "->", "+=", "-=", ">=", "<=", "!=", "=", "<", ">", "+", "-", "*", "/", "|"),
    // Low-precedence single-char fallback keeps prose punctuation (; ' ?) and the
    // unterminated-string plant from ever producing an ERROR node.
    punctuation: $ =>
      choice(":", ",", ".", "(", ")", "[", "]", token(prec(-1, /[^\sA-Za-z0-9]/))),

    _newline: $ => /\r?\n/,
  },
});
