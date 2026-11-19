#!/usr/bin/env node
/**
 * FindStay theme guard — fails the build when a hard-coded visual value is found.
 *
 * Every colour, size, spacing, radius, shadow, font, z-index and duration must come from
 * web/src/theme/tokens.css (surfaced through tailwind.config.js). See:
 *   .rules/06-design-system-and-theming.md
 *   .agents/AGENTS.md
 *
 * Usage:   node scripts/check-theme.mjs          (or: npm run lint:theme)
 * Escape hatch (rare, must carry a reason, reviewed in PR):
 *   // theme-lint-ignore: <why this value cannot be a token>
 * placed on the offending line or the line directly above it.
 *
 * This is a backstop, not a substitute for review: it catches the common ways values leak in.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_TARGETS = ['web/src', 'web/index.html'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.svg']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.vite']);

// The token layer itself is the only place raw values may live.
const THEME_DIR = `web${sep}src${sep}theme${sep}`;
// Raw brand scales (`palette-*`) are only for the theme layer and the design-system preview.
const PALETTE_ALLOWED = [THEME_DIR, `web${sep}src${sep}design-system${sep}`];

const NAMED_COLORS =
  'red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey|silver|gold|navy|teal|cyan|magenta|maroon|olive|lime|aqua|fuchsia|beige|ivory|tan|coral|salmon|crimson|indigo|violet|turquoise';
const TW_PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white';
const TW_COLOR_UTILS =
  'bg|text|border|ring|ring-offset|fill|stroke|from|via|to|divide|outline|shadow|decoration|accent|caret|placeholder';

/** @type {{id:string, test:RegExp, exts?:string[], when?:RegExp, message:string}[]} */
const RULES = [
  {
    id: 'hex-color',
    test: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/,
    message: 'Hard-coded hex colour. Use a colour token (e.g. bg-primary, text-muted).',
  },
  {
    id: 'color-function',
    test: /(?<![\w.$-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/,
    message: 'Colour function with literal values. Use a colour token (only rgb(var(--color-*)) belongs in the theme layer).',
  },
  {
    id: 'named-color',
    test: new RegExp(
      `\\b(?:color|background-color|backgroundColor|background|fill|stroke|border-color|borderColor|border|outline|box-?shadow)\\s*[:=]\\s*[\`'"{ ]*[^;}\\n]*?\\b(?:${NAMED_COLORS})\\b`,
      'i',
    ),
    message: 'Named CSS colour. Use a colour token (or currentColor).',
  },
  {
    id: 'tailwind-default-palette',
    test: new RegExp(`(?<![\\w-])(?:[a-z-]+:)*(?:${TW_COLOR_UTILS})-(?:${TW_PALETTE})(?:-\\d{2,3})?(?![\\w-])`),
    message: 'Tailwind default colour. Only semantic tokens exist (bg-primary, text-text, border-border, ...).',
  },
  {
    id: 'tailwind-arbitrary-value',
    test: /[a-z0-9-]+-\[(?![^\]]*=)(?!&|var\(--)[^\]\s]+\]/,
    message: 'Tailwind arbitrary value (e.g. p-[13px], bg-[#fff]). Add/choose a token instead.',
  },
  {
    id: 'literal-length',
    test: /(?<![\w.#$-])-?\d*\.?\d+(?:px|rem|em)\b/,
    message: 'Literal px/rem/em value. Use a spacing/size/radius/typography token.',
  },
  {
    id: 'inline-numeric-style',
    test: /\b(?:margin|padding|gap|width|height|top|left|right|bottom|fontSize|borderRadius|minWidth|maxWidth|minHeight|maxHeight|lineHeight|letterSpacing)[A-Za-z]*\s*:\s*-?\d/,
    exts: ['.tsx', '.jsx'],
    message: 'Numeric inline style value. Use token-backed Tailwind classes.',
  },
  {
    id: 'icon-size-prop',
    test: /\bsize=\{\s*\d+\s*\}/,
    message: 'Hard-coded icon size. Use className="h-icon-md w-icon-md" (or -sm / -lg).',
  },
  {
    id: 'font-family-literal',
    test: /font-?family\s*[:=]/i,
    message: 'Literal font-family. Use font-headline or font-body.',
  },
  {
    id: 'numeric-z-index',
    test: /(?<![\w-])-?z-\d+\b|z-?index\s*:\s*-?\d/i,
    message: 'Numeric z-index. Use a layer token (z-nav, z-modal, z-toast, ...).',
  },
  {
    id: 'literal-timing',
    test: /(?<![\w-])(?:duration|delay)-\d+\b|(?<![\w.-])\d*\.?\d+m?s\b/,
    when: /transition|animation|duration|delay|ease/i,
    message: 'Literal duration/easing. Use duration-fast|base|slow and ease-standard.',
  },
  {
    id: 'literal-shadow',
    test: /box-?shadow\s*:\s*(?!var\(|none)/i,
    message: 'Literal box-shadow. Use shadow-sm|md|lg.',
  },
  {
    id: 'palette-outside-theme',
    test: /(?<![\w-])(?:[a-z-]+:)*[a-z]+-palette-|var\(--palette-/,
    palette: true,
    message: 'Raw palette scale used outside the theme layer. Use a semantic token (bg-primary, text-muted, ...).',
  },
];

function* walk(path) {
  const stat = statSync(path, { throwIfNoEntry: false });
  if (!stat) return;
  if (stat.isFile()) {
    yield path;
    return;
  }
  for (const entry of readdirSync(path)) {
    if (SKIP_DIRS.has(entry)) continue;
    yield* walk(join(path, entry));
  }
}

const IGNORE = /theme-lint-ignore:\s*\S+/;
const isCommentLine = (line) => /^\s*(?:\/\/|\*|\/\*|<!--)/.test(line);

const violations = [];

for (const target of SCAN_TARGETS) {
  for (const file of walk(join(ROOT, target))) {
    const rel = relative(ROOT, file);
    const ext = rel.slice(rel.lastIndexOf('.'));
    if (!EXTENSIONS.has(ext)) continue;
    if (rel.startsWith(THEME_DIR)) continue;

    const paletteOk = PALETTE_ALLOWED.some((p) => rel.startsWith(p));
    const lines = readFileSync(file, 'utf8').split('\n');

    lines.forEach((line, i) => {
      if (isCommentLine(line)) return;
      if (IGNORE.test(line) || (i > 0 && IGNORE.test(lines[i - 1]))) return;

      for (const rule of RULES) {
        if (rule.exts && !rule.exts.includes(ext)) continue;
        if (rule.palette && paletteOk) continue;
        if (rule.when && !rule.when.test(line)) continue;
        const m = rule.test.exec(line);
        if (m) {
          violations.push({ rel, line: i + 1, col: m.index + 1, id: rule.id, message: rule.message, snippet: line.trim() });
        }
      }
    });
  }
}

if (violations.length === 0) {
  console.log('theme-guard: OK — no hard-coded visual values found.');
  process.exit(0);
}

console.error(`theme-guard: ${violations.length} hard-coded value(s) found.\n`);
for (const v of violations) {
  console.error(`${v.rel}:${v.line}:${v.col}  [${v.id}]  ${v.message}`);
  console.error(`    ${v.snippet.length > 140 ? v.snippet.slice(0, 137) + '...' : v.snippet}`);
}
console.error(
  '\nFix: use a token from web/src/theme/tokens.css (via Tailwind classes). Need a new value? Add it to tokens.css and tailwind.config.js first.\nSee .rules/06-design-system-and-theming.md',
);
process.exit(1);
