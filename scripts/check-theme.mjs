#!/usr/bin/env node
/**
 * FindStay theme guard — fails the build when a hard-coded visual value is found.
 *
 * Every colour, size, spacing, radius, shadow, font, z-index and duration must come from
 * web/src/theme/tokens.css (mapped to classes in web/tailwind.config.js). See:
 *   docs/rules/design-system-and-theming.md
 *   web/AGENTS.md
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

const NAMED_COLORS =
  'red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey|silver|gold|navy|teal|cyan|magenta|maroon|lime|aqua|fuchsia|beige|tan|coral|salmon|crimson|indigo|violet|turquoise';
const TW_PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white';
const TW_COLOR_UTILS =
  'bg|text|border|ring|ring-offset|fill|stroke|from|via|to|divide|outline|shadow|decoration|accent|caret|placeholder';

/** @type {{id:string, test:RegExp, exts?:string[], when?:RegExp, message:string}[]} */
const RULES = [
  {
    id: 'hex-color',
    test: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/,
    message: 'Hard-coded hex colour. Use a colour token (e.g. bg-olive, text-earth, bg-surface-card, text-on-brand).',
  },
  {
    id: 'color-function',
    test: /(?<![\w.$-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/,
    message: 'Colour function with literal values. Use a colour token; raw colour values live only in web/src/theme/tokens.css.',
  },
  {
    id: 'named-color',
    test: new RegExp(
      `\\b(?:color|background-color|backgroundColor|background|fill|stroke|border-color|borderColor|border|outline|box-?shadow)\\s*[:=]\\s*[\`'"{ ]*(?!var\\()[^;}\\n]*?\\b(?:${NAMED_COLORS})\\b`,
      'i',
    ),
    message: 'Named CSS colour. Use a colour token (or currentColor).',
  },
  {
    id: 'tailwind-default-palette',
    test: new RegExp(`(?<![\\w-])(?:[a-z-]+:)*(?:${TW_COLOR_UTILS})-(?:${TW_PALETTE})(?:-\\d{2,3})?(?![\\w-])`),
    message: 'Tailwind default colour (incl. white/black). Only FindStay tokens exist: bg-olive, text-earth, bg-surface-card, border-border-subtle, text-on-brand, status-*.',
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
    message: 'Hard-coded icon size. Use spacing-scale classes, e.g. className="h-5 w-5".',
  },
  {
    id: 'font-family-literal',
    test: /font-?family[ \t]*[:=][ \t]*(?![ \t])(?!var\(|inherit)\S/i,
    message: 'Literal font-family. Use font-display / font-sans / font-mono (or var(--font-*)).',
  },
  {
    id: 'numeric-z-index',
    test: /(?<![\w-])-?z-\d+\b|z-?index\s*:\s*-?\d/i,
    message: 'Numeric z-index. Use a layer token: z-raised, z-sticky, z-overlay, z-top.',
  },
  {
    id: 'literal-timing',
    test: /(?<![\w-])(?:duration|delay)-\d+\b|(?<![\w.-])\d*\.?\d+m?s\b/,
    when: /transition|animation|duration|delay|ease/i,
    message: 'Literal duration/easing. Use the token durations (duration-fast|base|slow) and the default easing.',
  },
  {
    id: 'literal-shadow',
    test: /box-?shadow\s*:\s*(?!var\(|none)/i,
    message: 'Literal box-shadow. Use shadow-sm|md|lg|xl.',
  },
  {
    id: 'tailwind-default-font-size',
    test: /(?<![\w-])(?:[a-z-]+:)*text-(?:xs|sm|base|lg|xl|[2-9]xl)(?![\w-])/,
    message: 'Tailwind default font size. Use the type scale: text-display, text-heading-2…5, text-subtitle, text-label, text-body-1/2, text-caption.',
  },
  {
    id: 'raw-token-var-in-class',
    test: /(?<![\w-])(?:[a-z-]+:)*[a-z]+-\[var\(--/,
    message: 'Arbitrary var(--token) class. Add a named class in tailwind.config.js instead.',
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
// Media/container query breakpoints cannot use CSS variables: the one sanctioned literal in CSS.
// Remove trailing/inline comments so words inside comments are never judged as code.
const stripComments = (line) => line.replace(/\/\*.*?\*\//g, ' ').replace(/(^|\s)\/\/\s.*$/, '$1');
const isQueryLine = (line) => /^\s*@(?:media|container)\b/.test(line);

const violations = [];

for (const target of SCAN_TARGETS) {
  for (const file of walk(join(ROOT, target))) {
    const rel = relative(ROOT, file);
    const ext = rel.slice(rel.lastIndexOf('.'));
    if (!EXTENSIONS.has(ext)) continue;
    if (rel.startsWith(THEME_DIR)) continue;

    const lines = readFileSync(file, 'utf8').split('\n');

    lines.forEach((line, i) => {
      if (isCommentLine(line) || isQueryLine(line)) return;
      if (IGNORE.test(line) || (i > 0 && IGNORE.test(lines[i - 1]))) return;

      const code = stripComments(line);
      for (const rule of RULES) {
        if (rule.exts && !rule.exts.includes(ext)) continue;
        if (rule.when && !rule.when.test(code)) continue;
        const m = rule.test.exec(code);
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
  '\nFix: use a token from web/src/theme/tokens.css (via Tailwind classes). Need a new value? Add it to tokens.css and tailwind.config.js first.\nSee docs/rules/design-system-and-theming.md',
);
process.exit(1);
