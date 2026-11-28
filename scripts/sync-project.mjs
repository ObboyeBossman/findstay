import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API_BASE = 'https://api.trello.com/1';
const OUT_DIR = join(process.cwd(), 'docs', 'evidence', 'project');

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set TRELLO_API_KEY, TRELLO_TOKEN, and TRELLO_BOARD_ID (see .env.example).`
    );
  }
  return value;
}

async function trelloGet(path, params, auth) {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set('key', auth.key);
  url.searchParams.set('token', auth.token);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Trello API GET ${path} failed (${res.status} ${res.statusText})`);
  }
  return res.json();
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

async function main() {
  const auth = {
    key: getRequiredEnv('TRELLO_API_KEY'),
    token: getRequiredEnv('TRELLO_TOKEN'),
  };
  const boardId = getRequiredEnv('TRELLO_BOARD_ID');

  const [board, lists, members, cards] = await Promise.all([
    trelloGet(`/boards/${boardId}`, { fields: 'name,shortUrl,url' }, auth),
    trelloGet(`/boards/${boardId}/lists`, { filter: 'open', fields: 'name,pos' }, auth),
    trelloGet(`/boards/${boardId}/members`, { fields: 'fullName,username' }, auth),
    trelloGet(
      `/boards/${boardId}/cards`,
      {
        filter: 'open',
        fields: 'name,idList,idMembers,labels,shortUrl,url,due,dueComplete,pos,dateLastActivity',
        checklists: 'all',
      },
      auth
    ),
  ]);

  const listById = new Map(lists.map((l) => [l.id, l]));
  const memberById = new Map(
    members.map((m) => [m.id, m.username ? `@${m.username}` : m.fullName])
  );

  const listOrder = new Map(
    [...lists].sort((a, b) => a.pos - b.pos).map((l, idx) => [l.id, idx])
  );

  const items = [...cards]
    .sort((a, b) => {
      const la = listOrder.get(a.idList) ?? Number.MAX_SAFE_INTEGER;
      const lb = listOrder.get(b.idList) ?? Number.MAX_SAFE_INTEGER;
      return la !== lb ? la - lb : (a.pos ?? 0) - (b.pos ?? 0);
    })
    .map((card) => {
      const checkItems = (card.checklists ?? []).flatMap((cl) => cl.checkItems ?? []);
      const completedCheckItems = checkItems.filter((ci) => ci.state === 'complete').length;

      return {
        id: card.id,
        title: card.name,
        status: listById.get(card.idList)?.name ?? 'Backlog',
        assignees: (card.idMembers ?? []).map((id) => memberById.get(id) ?? id),
        labels: (card.labels ?? []).map((l) => l.name || l.color).filter(Boolean),
        checklistProgress:
          checkItems.length > 0 ? `${completedCheckItems}/${checkItems.length}` : null,
        due: card.due ?? null,
        dueComplete: Boolean(card.dueComplete),
        url: card.shortUrl ?? card.url ?? null,
        updatedAt: card.dateLastActivity ?? null,
      };
    });

  const updatedAt = new Date().toISOString();
  mkdirSync(OUT_DIR, { recursive: true });

  writeFileSync(
    join(OUT_DIR, 'board.json'),
    JSON.stringify(
      {
        source: 'trello',
        board: { id: board.id, name: board.name, url: board.shortUrl ?? board.url ?? null },
        updatedAt,
        lists: [...lists].sort((a, b) => a.pos - b.pos).map((l) => l.name),
        items,
      },
      null,
      2
    ) + '\n'
  );

  const rows = items.map((i) => {
    const titleCell = i.url ? `[${escapeCell(i.title)}](${i.url})` : escapeCell(i.title);
    const labelsCell = i.labels.length ? i.labels.map(escapeCell).join(', ') : '-';
    const assigneesCell = i.assignees.length ? i.assignees.map(escapeCell).join(', ') : 'Unassigned';
    const checklistCell = i.checklistProgress ?? '-';
    return `| ${titleCell} | ${escapeCell(i.status)} | ${assigneesCell} | ${labelsCell} | ${checklistCell} |`;
  });

  const md = [
    `# FindStay Delivery — Cached Trello Board${board.name ? ` (${board.name})` : ''}`,
    '',
    `Updated: ${updatedAt}`,
    ...(board.shortUrl || board.url ? [`Board: ${board.shortUrl ?? board.url}`] : []),
    '',
    '| Card | List (Status) | Assignees | Labels | Checklist |',
    '| :--- | :--- | :--- | :--- | :---: |',
    ...(rows.length ? rows : ['| _No cards yet_ | - | - | - | - |']),
    '',
  ].join('\n');

  writeFileSync(join(OUT_DIR, 'board.md'), md);
  console.log(`Synced ${items.length} Trello cards to docs/evidence/project/`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
