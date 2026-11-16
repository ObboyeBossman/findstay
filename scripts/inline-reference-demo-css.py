#!/usr/bin/env python3
"""Inline web/src/theme.css + web/src/global.css into the showcase reference
demo so it is self-contained (it was written when both files sat at repo root)."""
import re
from pathlib import Path

root = Path('/home/z/my-project/findstay')
demo = root / 'showcase/public/design-system-reference.html'
theme = (root / 'web/src/theme.css').read_text()
glob = (root / 'web/src/global.css').read_text()

# global.css imports theme.css via '@import ./theme.css' — drop that line,
# both bodies are concatenated with theme.css first.
glob = re.sub(r"@import\s+'\./theme\.css';\s*", '', glob)

css = (
    '/* Inlined copy of web/src/theme.css + web/src/global.css '
    '(source of truth lives in the web app; regenerate when tokens change) */\n'
    + theme + '\n' + glob
)

html = demo.read_text()
pattern = re.compile(
    r'<link rel="stylesheet" href="\./theme\.css">\s*'
    r'<link rel="stylesheet" href="\./global\.css">'
)
new_html, n = pattern.subn('<style>\n' + css + '\n</style>', html)
assert n == 1, f'expected exactly 1 link-pair match, got {n}'
demo.write_text(new_html)
print(f'OK — inlined {len(css)} chars of CSS, replaced {n} link pair')
print('remaining <link rel="stylesheet">:', new_html.count('stylesheet'))
