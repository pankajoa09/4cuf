import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dataPath = resolve(root, 'data/events.json');
const htmlPath = resolve(root, 'index.html');
const checkOnly = process.argv.includes('--check');
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const allowedTypes = new Set(['meet', 'track', 'show', 'cruise']);
const allowedStatuses = new Set(['confirmed', 'tentative', 'cancelled']);
const requiredStrings = ['id', 'name', 'date', 'loc', 'type', 'desc', 'url', 'status', 'last_verified'];

const raw = await readFile(dataPath, 'utf8');
const data = JSON.parse(raw);

if (!datePattern.test(data.updated_at)) {
  throw new Error('updated_at must use YYYY-MM-DD');
}
if (!Array.isArray(data.events) || data.events.length === 0) {
  throw new Error('events must be a non-empty array');
}

const ids = new Set();
for (const [index, event] of data.events.entries()) {
  for (const field of requiredStrings) {
    if (typeof event[field] !== 'string' || event[field].trim() === '') {
      throw new Error(`events[${index}].${field} must be a non-empty string`);
    }
  }
  if (ids.has(event.id)) throw new Error(`Duplicate event id: ${event.id}`);
  ids.add(event.id);
  if (!datePattern.test(event.date) || Number.isNaN(Date.parse(`${event.date}T00:00:00Z`))) {
    throw new Error(`Invalid event date for ${event.id}`);
  }
  if (!datePattern.test(event.last_verified)) {
    throw new Error(`Invalid last_verified for ${event.id}`);
  }
  if (!allowedTypes.has(event.type)) throw new Error(`Invalid type for ${event.id}: ${event.type}`);
  if (!allowedStatuses.has(event.status)) throw new Error(`Invalid status for ${event.id}: ${event.status}`);
  const url = new URL(event.url);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Invalid source URL for ${event.id}`);
}

const html = await readFile(htmlPath, 'utf8');
const start = '/* EVENTS_FALLBACK_START */';
const end = '/* EVENTS_FALLBACK_END */';
const startAt = html.indexOf(start);
const endAt = html.indexOf(end);
if (startAt < 0 || endAt < startAt) throw new Error('Event fallback markers are missing from index.html');

const embedded = JSON.stringify(data.events, null, 2);
const synced = `${html.slice(0, startAt + start.length)}${embedded}${html.slice(endAt)}`;

if (checkOnly) {
  if (synced !== html) {
    console.error('index.html fallback is out of sync; run: node scripts/sync-events.mjs');
    process.exitCode = 1;
  } else {
    console.log(`Validated ${data.events.length} events; fallback is in sync.`);
  }
} else {
  await writeFile(htmlPath, synced);
  console.log(`Validated and synced ${data.events.length} events.`);
}
