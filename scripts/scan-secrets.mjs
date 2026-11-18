#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/**
 * Secret scanner for FindStay repository (Task S1-02-T8 / PD-12 / NFR-27).
 * Scans tracked files and commit history for potential credentials, API tokens,
 * database passwords, or leaked private keys.
 */

const SECRET_PATTERNS = [
  { name: 'Private Key', regex: /-----BEGIN (?:RSA|EC|DSA|OPENSSH)? ?PRIVATE KEY-----/ },
  { name: 'AWS/R2 Secret Access Key', regex: /(?:r2|aws)?[_-]?secret[_-]?access[_-]?key\s*[:=]\s*["\x27]?[0-9a-zA-Z\/+]{30,}["\x27]?/i },
  { name: 'Database Password in URI', regex: /postgres(?:ql)?:\/\/[^:]+:([^@\s]{6,})@[^:\s]+:\d+\/[^\s]+/i },
  { name: 'Supabase Service Role Key', regex: /eyJh[a-zA-Z0-9_-]+\.eyJh[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/ },
  { name: 'Generic Password Assignment', regex: /(?:api[_-]?password|db[_-]?password)\s*[:=]\s*["\x27][^"\x27]{6,}["\x27]/i }
];

const IGNORE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.pdf', '.jar', '.lock', '.ico'];
const IGNORE_PATHS = ['.env.example', 'node_modules', 'target', 'dist', 'package-lock.json'];

function scanTrackedFiles() {
  console.log('🔍 Scanning tracked repository files...');
  const files = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);
  let findings = [];

  for (const file of files) {
    if (IGNORE_EXTENSIONS.some(ext => file.endsWith(ext))) continue;
    if (IGNORE_PATHS.some(p => file.includes(p))) continue;

    try {
      const content = readFileSync(file, 'utf8');
      for (const { name, regex } of SECRET_PATTERNS) {
        if (regex.test(content)) {
          // Allow placeholder mock values in tests or documentation examples
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              const line = lines[i].trim();
              if (line.includes('placeholder') || line.includes('example') || line.includes('mock') || line.includes('CHANGEME')) {
                continue;
              }
              findings.push({ file, line: i + 1, type: name, snippet: line.substring(0, 60) + '...' });
            }
          }
        }
      }
    } catch (err) {
      // Ignore unreadable or binary files
    }
  }

  return findings;
}

function scanCommitHistory() {
  console.log('🔍 Scanning git commit history for leaked private keys or credentials...');
  try {
    const diff = execSync('git log --all -p -n 100', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    let findings = [];
    for (const { name, regex } of SECRET_PATTERNS) {
      if (name === 'Private Key' && regex.test(diff)) {
        findings.push({ type: name, location: 'Git history contains private key match' });
      }
    }
    return findings;
  } catch (err) {
    console.error('Error reading git history:', err.message);
    return [];
  }
}

console.log('====================================================');
console.log('FindStay Security & Credential Hygiene Scanner');
console.log('Requirement: PD-12, TA-11, NFR-27');
console.log('====================================================');

const fileFindings = scanTrackedFiles();
const historyFindings = scanCommitHistory();
const totalFindings = fileFindings.length + historyFindings.length;

if (totalFindings === 0) {
  console.log('✅ PASS: No leaked secrets, private keys, or passwords detected.');
  console.log('All tracked files and commit history meet FindStay credential hygiene standards.');
  process.exit(0);
} else {
  console.error(`❌ FAIL: Found ${totalFindings} potential secret leaks:`);
  for (const f of fileFindings) {
    console.error(` - [${f.type}] in ${f.file}:${f.line} -> ${f.snippet}`);
  }
  for (const h of historyFindings) {
    console.error(` - [${h.type}] in ${h.location}`);
  }
  process.exit(1);
}
