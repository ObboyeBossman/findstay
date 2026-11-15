import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OWNER = 'ObboyeBossman';
const PROJECT_NUMBER = 5;
const OUT_DIR = join(process.cwd(), 'docs', 'evidence', 'project');

mkdirSync(OUT_DIR, { recursive: true });

const raw = execSync(
  `gh project item-list ${PROJECT_NUMBER} --owner ${OWNER} --limit 100 --format json`,
  { encoding: 'utf8' }
);

const data = JSON.parse(raw);
const items = (data.items ?? []).map((item) => ({
  id: item.id,
  title: item.title,
  status: item.status ?? 'Backlog',
  assignees: item.assignees ?? [],
  labels: item.labels ?? [],
  url: item.content?.url ?? null,
}));

writeFileSync(
  join(OUT_DIR, 'board.json'),
  JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + '\n'
);

const rows = items.map(
  (i) =>
    `| ${i.title} | ${i.status} | ${i.assignees.join(', ') || 'Unassigned'} |`
);
const md = [
  '# FindStay Delivery — Cached Board',
  '',
  `Updated: ${new Date().toISOString()}`,
  '',
  '| Story | Status | Assignees |',
  '| :--- | :--- | :--- |',
  ...(rows.length ? rows : ['| _No items yet_ | - | - |']),
  '',
].join('\n');

writeFileSync(join(OUT_DIR, 'board.md'), md);
console.log(`Synced ${items.length} items to docs/evidence/project/`);
