// Read-only transfer check. Requires Node, not npm install or a running server.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(root, 'docs/local-handoff/integrity.json'), 'utf8'));
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--originals')) {
  console.error('Usage: node scripts/verify-local-handoff.mjs [--originals "folder"]');
  process.exit(2);
}
const originals = args.length === 2;
const base = originals ? path.resolve(args[1]) : root;
const entries = originals ? manifest.originalFiles : manifest.repositoryFiles;
let missing = 0, changed = 0, passed = 0;
for (const item of entries) {
  if (path.posix.isAbsolute(item.path) || item.path.includes('\\') || item.path.split('/').includes('..')) {
    throw new Error(`Invalid manifest path: ${item.path}`);
  }
  const file = path.join(base, ...item.path.split('/'));
  if (!existsSync(file)) { missing++; console.error(`MISSING: ${item.path}`); continue; }
  const data = readFileSync(file);
  const sha256 = createHash('sha256').update(data).digest('hex');
  if (data.length !== item.bytes || sha256 !== item.sha256) {
    changed++; console.error(`CHANGED: ${item.path}`); continue;
  }
  passed++;
}
console.log(`${originals ? 'ORIGINALS' : 'REPOSITORY'}: ${passed}/${entries.length} match; ${missing} missing; ${changed} changed.`);
console.log(`Sealed application baseline: ${manifest.applicationCommit}; release ${manifest.release}.`);
if (!originals) {
  try {
    console.log(`Current Git HEAD: ${execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()}`);
    const status = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    console.log(status ? `Working tree has changes (preserve them):\n${status}` : 'Git working tree: clean.');
  } catch { console.log('No Git metadata available; file hashes were still checked.'); }
}
if (missing || changed) {
  console.error('Do not overwrite files. Check the folder/version and preserve local edits; Windows line-ending conversion also changes byte hashes.');
  process.exitCode = 1;
} else {
  console.log('Transfer matches the sealed snapshot. Run this before editing; later intentional edits will differ.');
}
