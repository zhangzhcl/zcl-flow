#!/usr/bin/env node
/**
 * One-shot migration: import images referenced by existing knowledge chunks.
 *
 * Chunks store markdown as uploaded; their image refs look like
 * `attachments/<doc>/01.png` and are relative to the original document
 * directory. Frontmatter `category` + chunk `sourceTitle` locate that
 * directory under the source root, so referenced files can be resolved,
 * stored as knowledge assets, and the refs rewritten to `/api/knowledge/assets/...`.
 *
 * Usage:
 *   node scripts/migrate-kb-images.js --src /path/to/faq [--dry-run] [--db path]
 *
 * A backup of all rewritten chunk contents is written next to the database
 * before any change is applied.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--dry-run') args.dryRun = true;
  else if (process.argv[i] === '--src') args.src = process.argv[++i];
  else if (process.argv[i] === '--db') args.db = process.argv[++i];
}

const repoRoot = path.resolve(__dirname, '..');
const dbPath = args.db || path.join(repoRoot, 'data', 'zcl-flow.sqlite');
const srcRoot = args.src;
if (!srcRoot || !fs.existsSync(dbPath) || !fs.existsSync(srcRoot)) {
  console.error('Usage: node migrate-kb-images.js --src /path/to/faq-source [--dry-run] [--db path]');
  process.exit(1);
}

// eslint-disable-next-line import/no-dynamic-require
const Database = require(path.join(repoRoot, '..', 'node_modules', 'better-sqlite3'));
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const mimeFor = (file) => MIME_BY_EXT[path.extname(file).toLowerCase()] || null;

const sha1 = (buf) => crypto.createHash('sha1').update(buf).digest('hex');

const normalizeRef = (ref) => {
  try {
    return decodeURIComponent(ref.trim());
  } catch {
    return ref.trim();
  }
};

/** sha1 -> existing asset row (dedup across the whole KB like saveAsset does per KB). */
const assetCache = new Map();

function ensureSchema() {
  db.exec(`CREATE TABLE IF NOT EXISTS knowledge_assets (
    id TEXT PRIMARY KEY,
    knowledgeBaseId TEXT NOT NULL,
    sha1 TEXT NOT NULL,
    fileName TEXT NOT NULL DEFAULT '',
    mimeType TEXT NOT NULL,
    size INTEGER NOT NULL,
    createdAt datetime NOT NULL DEFAULT (datetime('now'))
  )`);
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS IDX_knowledge_assets_kb_sha1 ON knowledge_assets (knowledgeBaseId, sha1)');
}

function saveAsset(kbId, bytes, mime, fileName, uploadsDir) {
  const digest = sha1(bytes);
  const key = kbId + ':' + digest;
  if (assetCache.has(key)) return assetCache.get(key);
  const existing = db.prepare('SELECT * FROM knowledge_assets WHERE knowledgeBaseId = ? AND sha1 = ?').get(kbId, digest);
  if (existing) {
    assetCache.set(key, existing);
    return existing;
  }
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO knowledge_assets (id, knowledgeBaseId, sha1, fileName, mimeType, size) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(id, kbId, digest, fileName, mime, bytes.length);
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(uploadsDir, id + path.extname(fileName)), bytes);
  const row = { id };
  assetCache.set(key, row);
  return row;
}

ensureSchema();

const rows = db.prepare('SELECT id, knowledgeBaseId, sourceTitle, content FROM knowledge_chunks').all();
const byDoc = new Map();
for (const row of rows) {
  if (!byDoc.has(row.sourceTitle)) byDoc.set(row.sourceTitle, []);
  byDoc.get(row.sourceTitle).push(row);
}

const uploadsDir = path.join(repoRoot, 'data', 'uploads');
const backup = [];
let copied = 0;
let rewrittenChunks = 0;
let missingRefs = 0;
const missingSamples = [];

for (const [title, chunks] of byDoc) {
  const catMatch = chunks[0].content.match(/^---[\s\S]*?category:\s*(.+?)[\r\n]/);
  if (!catMatch) continue;
  const docDir = path.join(srcRoot, catMatch[1].trim().replace(/^["']|["']$/g, ''), path.dirname(title));

/** Reads the balanced-paren ref that starts at `startIdx` (after `](`). */
function parseRef(text, startIdx) {
  let depth = 1;
  for (let i = startIdx; i < text.length; i++) {
    const c = text[i];
    if (c === '(') depth += 1;
    else if (c === ')') {
      depth -= 1;
      if (depth === 0) return text.slice(startIdx, i);
    } else if (c === '\n') break;
  }
  return null;
}

const IMG_HEAD = /!\[[^\]]*\]\(|<img[^>]+src=["']/g;

/** One pass: rewrites every image ref in `content` via `resolve(ref) -> url|null`. */
function rewriteImageRefs(content, resolve) {
  let out = '';
  let last = 0;
  IMG_HEAD.lastIndex = 0;
  let m;
  while ((m = IMG_HEAD.exec(content))) {
    const refStart = m.index + m[0].length;
    if (m[0].startsWith('<img')) {
      // ref runs to the closing quote of src="..."
      const endQuote = content.indexOf(m[0].slice(-1), refStart);
      if (endQuote < 0) continue;
      const ref = content.slice(refStart, endQuote);
      const url = resolve(ref);
      if (url) {
        out += content.slice(last, refStart) + url;
        last = endQuote;
        IMG_HEAD.lastIndex = endQuote;
      }
    } else {
      const ref = parseRef(content, refStart);
      if (ref == null) continue;
      const url = resolve(ref);
      if (url) {
        out += content.slice(last, refStart) + url + ')';
        last = refStart + ref.length + 1;
        IMG_HEAD.lastIndex = last;
      }
    }
  }
  return out + content.slice(last);
}

  for (const chunk of chunks) {
    let changed = false;
    const next = rewriteImageRefs(chunk.content, (ref) => {
      const norm = normalizeRef(ref);
      if (/^\/api\/knowledge\/assets\//.test(norm)) return null;
      if (!/\.(png|jpe?g|webp|gif)$/i.test(norm)) return null;
      const abs = path.resolve(docDir, norm);
      if (!fs.existsSync(abs)) {
        missingRefs += 1;
        if (missingSamples.length < 8) missingSamples.push(norm);
        return null;
      }
      const mime = mimeFor(abs);
      if (!mime || !ALLOWED.has(mime)) return null;
      const bytes = fs.readFileSync(abs);
      if (bytes.length > MAX_IMAGE_BYTES) return null;
      const asset = saveAsset(chunk.knowledgeBaseId, bytes, mime, path.basename(abs), uploadsDir);
      copied += 1;
      changed = true;
      return `/api/knowledge/assets/${asset.id}/file`;
    });
    if (changed) {
      backup.push({ id: chunk.id, content: chunk.content });
      chunk.content = next;
      rewrittenChunks += 1;
    }
  }
}

if (args.dryRun) {
  console.log(`[dry-run] chunks to rewrite : ${rewrittenChunks}`);
  console.log(`[dry-run] image refs copied : ${copied}`);
  console.log(`[dry-run] missing source    : ${missingRefs}`);
  missingSamples.forEach((m) => console.log('  miss:', m));
  db.close();
  process.exit(0);
}

if (rewrittenChunks) {
  const backupPath = path.join(
    path.dirname(dbPath),
    `kb-image-migration-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  );
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`backup written: ${backupPath} (${backup.length} chunks)`);
}

const update = db.prepare('UPDATE knowledge_chunks SET content = ? WHERE id = ?');
const tx = db.transaction(() => {
  for (const chunk of rows) update.run(chunk.content, chunk.id);
});
tx();

console.log(`chunks rewritten : ${rewrittenChunks}`);
console.log(`image refs saved : ${copied}`);
console.log(`missing source   : ${missingRefs}`);
missingSamples.forEach((m) => console.log('  miss:', m));
db.close();
