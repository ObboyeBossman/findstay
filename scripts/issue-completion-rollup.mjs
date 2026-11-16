import { readFileSync } from 'node:fs';

const API_BASE = 'https://api.github.com';
const GRAPHQL_URL = 'https://api.github.com/graphql';
const PROMPT_MARKER = '<!-- findstay-completion-prompt -->';
const ROLLUP_MARKER = '<!-- findstay-story-rollup -->';
const NEEDS_NOTES_LABEL = 'needs-completion-summary';
const SUMMARY_HEADING_RE = /^#{1,3}\s*Completion Summary\b/im;

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function ghRequest(path, token, { method = 'GET', body, allowNotFound = false } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (allowNotFound && res.status === 404) {
    return null;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${method} ${path} failed (${res.status}): ${text}`);
  }
  if (res.status === 204) {
    return null;
  }
  return res.json();
}

async function ghGraphQL(query, variables, token) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await res.json();
  if (!res.ok || payload.errors?.length) {
    throw new Error(`GitHub GraphQL error: ${JSON.stringify(payload.errors || payload)}`);
  }
  return payload.data;
}

async function listAllPages(path, token) {
  const results = [];
  for (let page = 1; page <= 20; page += 1) {
    const sep = path.includes('?') ? '&' : '?';
    const items = await ghRequest(`${path}${sep}per_page=100&page=${page}`, token);
    if (!Array.isArray(items) || items.length === 0) break;
    results.push(...items);
    if (items.length < 100) break;
  }
  return results;
}

function isPlaceholderOnly(text) {
  const stripped = text
    .replace(SUMMARY_HEADING_RE, '')
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/PR\s*\/\s*commit\s*\/\s*live URL\s*:/gi, '')
    .replace(/Link to live page, test result, or pull request\s*:/gi, '')
    .replace(/[-*]\s*\[[ xX]\]\s*/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[_\s`>*|-]/g, '')
    .trim();
  return stripped.length < 10;
}

function findSummaryComment(comments) {
  const candidates = comments.filter(
    (c) =>
      c.body &&
      !c.body.includes(PROMPT_MARKER) &&
      !c.body.includes(ROLLUP_MARKER) &&
      SUMMARY_HEADING_RE.test(c.body) &&
      !isPlaceholderOnly(c.body)
  );
  return candidates.at(-1) ?? null;
}

function extractSummaryDigest(commentBody) {
  const lines = commentBody
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith('#') &&
        !line.startsWith('<!--') &&
        !/^All deliverables for /i.test(line)
    );

  const bullets = lines
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s*(\[[ xX]\]\s*)?/, '').trim());

  const chosen = [];
  let totalLen = 0;
  for (const item of bullets.length ? bullets : lines) {
    const clean = item.replace(/\s+/g, ' ').trim();
    if (chosen.length > 0 && totalLen + clean.length + 3 > 320) break;
    if (chosen.length === 0 && clean.length > 320) {
      chosen.push(`${clean.slice(0, 317).replace(/\s+\S*$/, '')}...`);
      break;
    }
    chosen.push(clean);
    totalLen += clean.length + 3;
    if (chosen.length >= 4) break;
  }
  return chosen.join(' · ');
}

function naturalTaskSortKey(title) {
  const match = title.match(/\bS(\d+)-(\d+)(?:-T(\d+))?/i);
  if (!match) return [999, 999, 999, title];
  return [Number(match[1]), Number(match[2]), Number(match[3] ?? 999), title];
}

function compareIssuesNaturally(a, b) {
  const ka = naturalTaskSortKey(a.title);
  const kb = naturalTaskSortKey(b.title);
  for (let i = 0; i < 3; i += 1) {
    if (ka[i] !== kb[i]) return ka[i] - kb[i];
  }
  return ka[3].localeCompare(kb[3]);
}

async function getProjectCompletionNote(owner, repo, issueNumber, projectToken) {
  if (!projectToken) return null;
  const query = `
    query($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $number) {
          projectItems(first: 10) {
            nodes {
              id
              project {
                id
                number
              }
              fieldValueByName(name: "Completion Notes") {
                ... on ProjectV2ItemFieldTextValue {
                  text
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await ghGraphQL(query, { owner, repo, number: issueNumber }, projectToken);
  const nodes = data?.repository?.issue?.projectItems?.nodes ?? [];
  const item = nodes.find((n) => n.project?.number === 5) ?? nodes[0];
  if (!item) return null;
  return {
    projectId: item.project.id,
    itemId: item.id,
    text: item.fieldValueByName?.text?.trim() || '',
  };
}

async function setProjectCompletionNote(projectId, itemId, text, projectToken) {
  if (!projectToken || !projectId || !itemId || !text) return;
  const fieldQuery = `
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          field(name: "Completion Notes") {
            ... on ProjectV2FieldCommon {
              id
            }
          }
        }
      }
    }
  `;
  const fieldData = await ghGraphQL(fieldQuery, { projectId }, projectToken);
  const fieldId = fieldData?.node?.field?.id;
  if (!fieldId) return;

  const mutation = `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $text: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { text: $text }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;
  await ghGraphQL(mutation, { projectId, itemId, fieldId, text }, projectToken);
}

async function ensureLabelExists(repoPath, token) {
  const existing = await ghRequest(
    `/repos/${repoPath}/labels/${encodeURIComponent(NEEDS_NOTES_LABEL)}`,
    token,
    { allowNotFound: true }
  );
  if (existing) return;
  await ghRequest(`/repos/${repoPath}/labels`, token, {
    method: 'POST',
    body: {
      name: NEEDS_NOTES_LABEL,
      color: 'D93F0B',
      description: 'Requires a ## Completion Summary comment before closing',
    },
  });
}

async function ensureRollupForParent(repoPath, parentNumber, token, projectToken) {
  const parent = await ghRequest(`/repos/${repoPath}/issues/${parentNumber}`, token);
  const subIssues = await listAllPages(`/repos/${repoPath}/issues/${parentNumber}/sub_issues`, token);
  if (subIssues.length === 0) return;

  subIssues.sort(compareIssuesNaturally);

  const achieved = [];
  const openItems = [];
  const skippedItems = [];

  for (const sub of subIssues) {
    if (sub.state === 'open') {
      openItems.push(`- #${sub.number} ${sub.title}`);
      continue;
    }
    if (sub.state_reason === 'not_planned') {
      skippedItems.push(`- #${sub.number} ${sub.title} _(not planned)_`);
      continue;
    }

    const comments = await listAllPages(`/repos/${repoPath}/issues/${sub.number}/comments`, token);
    const summaryComment = findSummaryComment(comments);
    let summaryText = summaryComment ? extractSummaryDigest(summaryComment.body) : '';

    if (!summaryText) {
      const projectNote = await getProjectCompletionNote(
        repoPath.split('/')[0],
        repoPath.split('/')[1],
        sub.number,
        projectToken
      );
      summaryText = projectNote?.text || '_Closed without summary comment_';
    }

    const link = summaryComment ? ` ([details](${summaryComment.html_url}))` : '';
    achieved.push(`- **#${sub.number} ${sub.title}** — ${summaryText}${link}`);
  }

  const totalCount = subIssues.length - skippedItems.length;
  const lines = [
    ROLLUP_MARKER,
    `## Completion Summary — Story Roll-up (${achieved.length} / ${totalCount} tasks done)`,
    '',
    `Automatically aggregated from completed sub-issues on **${parent.title}** so the team can see everything achieved so far.`,
    '',
    '### Achieved So Far',
    ...(achieved.length ? achieved : ['_No completed tasks yet._']),
    '',
    '### Remaining Open Tasks',
    ...(openItems.length ? openItems : ['_All planned tasks are closed._']),
  ];

  if (skippedItems.length) {
    lines.push('', '### Not Planned / Cancelled', ...skippedItems);
  }

  const body = `${lines.join('\n')}\n`;
  if (process.env.DRY_RUN === 'true') {
    console.log(body);
    return;
  }

  const parentComments = await listAllPages(`/repos/${repoPath}/issues/${parentNumber}/comments`, token);
  const existingRollup = parentComments.find((c) => c.body?.includes(ROLLUP_MARKER));

  if (existingRollup) {
    await ghRequest(`/repos/${repoPath}/issues/comments/${existingRollup.id}`, token, {
      method: 'PATCH',
      body: { body },
    });
  } else {
    await ghRequest(`/repos/${repoPath}/issues/${parentNumber}/comments`, token, {
      method: 'POST',
      body: { body },
    });
  }

  const [owner, repo] = repoPath.split('/');
  const parentNote = await getProjectCompletionNote(owner, repo, parentNumber, projectToken);
  if (parentNote && !parentNote.text) {
    await setProjectCompletionNote(
      parentNote.projectId,
      parentNote.itemId,
      `Roll-up: ${achieved.length}/${totalCount} tasks done. See story issue #${parentNumber} roll-up comment.`,
      projectToken
    );
  }
}

async function handleIssueEvent(repoPath, issueNumber, action, token, projectToken) {
  const issue = await ghRequest(`/repos/${repoPath}/issues/${issueNumber}`, token);
  const subIssues = await listAllPages(`/repos/${repoPath}/issues/${issueNumber}/sub_issues`, token);
  const isParentStory = subIssues.length > 0;

  if (isParentStory && issue.state === 'closed') {
    await ensureRollupForParent(repoPath, issueNumber, token, projectToken);
  }

  const comments = await listAllPages(`/repos/${repoPath}/issues/${issueNumber}/comments`, token);
  const summaryComment = findSummaryComment(comments);
  const [owner, repo] = repoPath.split('/');
  const projectNote = await getProjectCompletionNote(owner, repo, issueNumber, projectToken);

  const hasRollupComment = isParentStory && comments.some((c) => c.body?.includes(ROLLUP_MARKER));
  const hasCompletionSummary = Boolean(summaryComment || projectNote?.text || hasRollupComment);

  if (issue.state === 'closed' && issue.state_reason !== 'not_planned' && !hasCompletionSummary) {
    await ensureLabelExists(repoPath, token);
    await ghRequest(`/repos/${repoPath}/issues/${issueNumber}/labels`, token, {
      method: 'POST',
      body: { labels: [NEEDS_NOTES_LABEL] },
    });

    const alreadyPrompted = comments.at(-1)?.body?.includes(PROMPT_MARKER);
    if (!alreadyPrompted) {
      const promptBody = [
        PROMPT_MARKER,
        '## Completion Summary Required Before Closing',
        '',
        'Before closing this issue, please add a short summary in **plain, simple English (no technical jargon)** so anyone on the team can see what was accomplished.',
        '',
        'Copy and fill in the template below as a comment, then close the issue again:',
        '',
        '```markdown',
        '## Completion Summary',
        '',
        '### What was accomplished (in plain English)',
        '- ',
        '',
        '### Proof / Links',
        '- Link to live page, test result, or pull request: ',
        '```',
      ].join('\n');

      await ghRequest(`/repos/${repoPath}/issues/${issueNumber}/comments`, token, {
        method: 'POST',
        body: { body: promptBody },
      });
    }

    if (action === 'closed') {
      await ghRequest(`/repos/${repoPath}/issues/${issueNumber}`, token, {
        method: 'PATCH',
        body: { state: 'open' },
      });
    }
    return;
  }

  if (hasCompletionSummary) {
    const hasNeedsLabel = issue.labels?.some((l) => l.name === NEEDS_NOTES_LABEL);
    if (hasNeedsLabel) {
      await ghRequest(
        `/repos/${repoPath}/issues/${issueNumber}/labels/${encodeURIComponent(NEEDS_NOTES_LABEL)}`,
        token,
        { method: 'DELETE', allowNotFound: true }
      );
    }

    if (summaryComment && projectNote && !projectNote.text) {
      const digest = extractSummaryDigest(summaryComment.body);
      await setProjectCompletionNote(
        projectNote.projectId,
        projectNote.itemId,
        `${digest} (see #${issueNumber})`,
        projectToken
      );
    }
  }

  const parent = await ghRequest(`/repos/${repoPath}/issues/${issueNumber}/parent`, token, {
    allowNotFound: true,
  });
  if (parent?.number && (issue.state === 'closed' || hasCompletionSummary)) {
    await ensureRollupForParent(repoPath, parent.number, token, projectToken);
  }
}

async function main() {
  const token = getRequiredEnv('GITHUB_TOKEN');
  const projectToken = process.env.PROJECT_SYNC_TOKEN || '';
  const repoPath = getRequiredEnv('GITHUB_REPOSITORY');
  const eventName = process.env.GITHUB_EVENT_NAME || 'manual';

  if (process.env.STORY_NUMBER) {
    await ensureRollupForParent(repoPath, Number(process.env.STORY_NUMBER), token, projectToken);
    return;
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    throw new Error('Either STORY_NUMBER or GITHUB_EVENT_PATH must be provided.');
  }

  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  const issue = event.issue;
  if (!issue?.number) return;

  const commentBody = event.comment?.body || '';
  if (
    eventName === 'issue_comment' &&
    (commentBody.includes(PROMPT_MARKER) || commentBody.includes(ROLLUP_MARKER))
  ) {
    return;
  }

  await handleIssueEvent(repoPath, issue.number, event.action || '', token, projectToken);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
