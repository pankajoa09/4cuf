import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dataPath = resolve(root, 'data/events.json');
const thaiDataPath = resolve(root, 'data/events-th.json');
const htmlPath = resolve(root, 'index.html');
const thaiHtmlPath = resolve(root, 'th/index.html');
const eventsPath = resolve(root, 'events');
const thaiEventsPath = resolve(root, 'th/events');
const sitemapPath = resolve(root, 'sitemap.xml');
const robotsPath = resolve(root, 'robots.txt');
const checkOnly = process.argv.includes('--check');
const siteUrl = 'https://4cuf.com';
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedTypes = new Set(['meet', 'track', 'show', 'cruise']);
const allowedStatuses = new Set(['confirmed', 'tentative', 'cancelled']);
const requiredStrings = ['id', 'name', 'date', 'loc', 'type', 'desc', 'url', 'status', 'last_verified'];

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const eventStatus = status => ({
  confirmed: 'https://schema.org/EventScheduled',
  tentative: 'https://schema.org/EventScheduled',
  cancelled: 'https://schema.org/EventCancelled'
})[status];

const formatDate = date => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
}).format(new Date(`${date}T00:00:00Z`));

const formatThaiDate = date => new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
}).format(new Date(`${date}T00:00:00Z`));

function eventPage(event) {
  const canonical = `${siteUrl}/events/${encodeURIComponent(event.id)}/`;
  const thaiCanonical = `${siteUrl}/th/events/${encodeURIComponent(event.id)}/`;
  const title = `${event.name} | Thailand Car Event | 4CUF`;
  const humanDate = formatDate(event.date);
  const description = `${event.name} — ${humanDate} at ${event.loc}. ${event.desc}`;
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    startDate: event.date,
    eventStatus: eventStatus(event.status),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.loc,
      address: event.loc
    },
    description: event.desc,
    url: canonical,
    sameAs: event.url
  }).replaceAll('<', '\\u003c');
  const statusLabel = event.status === 'tentative' ? 'Tentative — confirm before attending' :
    event.status === 'cancelled' ? 'Cancelled' : 'Confirmed';
  const robots = event.status === 'cancelled' ? 'noindex,follow' : 'index,follow';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${canonical}">
<link rel="alternate" hreflang="th" href="${thaiCanonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:title" content="${escapeHtml(event.name)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="en_TH">
<meta property="og:locale:alternate" content="th_TH">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(event.name)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="theme-color" content="#ff3e1d">
<link rel="icon" type="image/svg+xml" href="/logo.svg">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<script type="application/ld+json">${schema}</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box}body{margin:0;background:#0a0a0a;color:#e8e8e8;font-family:"DM Sans",sans-serif;line-height:1.6;min-height:100vh}a{color:#ff6b4a}.wrap{width:min(760px,calc(100% - 2rem));margin:0 auto;padding:2rem 0 4rem}.top{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:3rem}.logo{height:48px;width:auto}.back{text-decoration:none;color:#888;font-size:.8rem;text-transform:uppercase;letter-spacing:.08em}.back:hover{color:#ff3e1d}.event{background:#111;border:1px solid #222;border-left:3px solid #ff3e1d;border-radius:6px;padding:clamp(1.25rem,5vw,2.5rem)}.eyebrow{color:#ff3e1d;text-transform:uppercase;letter-spacing:.12em;font-size:.7rem;font-weight:600;margin:0 0 .5rem}.title{font-family:"Bebas Neue",sans-serif;font-size:clamp(2.4rem,8vw,4.8rem);letter-spacing:.025em;line-height:.95;margin:0 0 1.5rem}.facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;border-top:1px solid #222;border-bottom:1px solid #222;padding:1.25rem 0;margin-bottom:1.5rem}.label{display:block;color:#777;font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.2rem}.value{font-size:.95rem}.desc{color:#aaa;margin:0 0 1.75rem}.actions{display:flex;gap:.7rem;flex-wrap:wrap}.button{display:inline-block;padding:.65rem 1rem;border-radius:5px;text-decoration:none;font-size:.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;background:#ff3e1d;color:white}.button.secondary{background:#1a1a1a;border:1px solid #333;color:#ddd}.note{color:#666;font-size:.72rem;margin-top:1.25rem}@media(max-width:560px){.facts{grid-template-columns:1fr}.top{margin-bottom:2rem}}
</style>
</head>
<body>
<main class="wrap">
  <div class="top"><a href="/"><img class="logo" src="/logo.svg" alt="4CUF"></a><div><a class="back" href="${thaiCanonical}" lang="th">ไทย</a> · <a class="back" href="/">← All events</a></div></div>
  <article class="event">
    <p class="eyebrow">${escapeHtml(event.type)} · ${escapeHtml(statusLabel)}</p>
    <h1 class="title">${escapeHtml(event.name)}</h1>
    <div class="facts">
      <div><span class="label">Date</span><span class="value"><time datetime="${event.date}">${escapeHtml(humanDate)}</time></span></div>
      <div><span class="label">Location</span><span class="value">${escapeHtml(event.loc)}</span></div>
    </div>
    <p class="desc">${escapeHtml(event.desc)}</p>
    <div class="actions">
      <a class="button" href="${escapeHtml(event.url)}" target="_blank" rel="noopener">Check official source ↗</a>
      <a class="button secondary" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(event.loc)}" target="_blank" rel="noopener">Open map ↗</a>
    </div>
    <p class="note">Last source check: ${escapeHtml(formatDate(event.last_verified))}. Event details can change; confirm with the linked source before travelling.</p>
  </article>
</main>
</body>
</html>
`;
}

function thaiEventPage(event) {
  const canonical = `${siteUrl}/th/events/${encodeURIComponent(event.id)}/`;
  const englishCanonical = `${siteUrl}/events/${encodeURIComponent(event.id)}/`;
  const title = `${event.name} | งานรถในไทย | 4CUF`;
  const humanDate = formatThaiDate(event.date);
  const description = `${event.name} — ${humanDate} ณ ${event.loc} ${event.desc}`;
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Event',
    inLanguage: 'th',
    name: event.name,
    startDate: event.date,
    eventStatus: eventStatus(event.status),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: event.loc, address: event.loc },
    description: event.desc,
    url: canonical,
    sameAs: event.url
  }).replaceAll('<', '\\u003c');
  const typeLabel = ({ meet: 'มีตติ้ง', track: 'สนามแข่ง', show: 'งานแสดงรถ', cruise: 'ขับรถเที่ยว' })[event.type];
  const statusLabel = event.status === 'tentative' ? 'ยังไม่ยืนยัน — โปรดตรวจสอบก่อนเดินทาง' :
    event.status === 'cancelled' ? 'ยกเลิกแล้ว' : 'ยืนยันแล้ว';
  const robots = event.status === 'cancelled' ? 'noindex,follow' : 'index,follow';

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${englishCanonical}">
<link rel="alternate" hreflang="th" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${englishCanonical}">
<meta property="og:title" content="${escapeHtml(event.name)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="th_TH">
<meta property="og:locale:alternate" content="en_TH">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(event.name)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="theme-color" content="#ff3e1d">
<link rel="icon" type="image/svg+xml" href="/logo.svg">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<script type="application/ld+json">${schema}</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');
*{box-sizing:border-box}body{margin:0;background:#0a0a0a;color:#e8e8e8;font-family:"Noto Sans Thai","DM Sans",sans-serif;line-height:1.7;min-height:100vh}a{color:#ff6b4a}.wrap{width:min(760px,calc(100% - 2rem));margin:0 auto;padding:2rem 0 4rem}.top{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:3rem}.logo{height:48px;width:auto}.back{text-decoration:none;color:#888;font-size:.8rem}.back:hover{color:#ff3e1d}.event{background:#111;border:1px solid #222;border-left:3px solid #ff3e1d;border-radius:6px;padding:clamp(1.25rem,5vw,2.5rem)}.eyebrow{color:#ff3e1d;font-size:.75rem;font-weight:600;margin:0 0 .5rem}.title{font-size:clamp(2rem,7vw,4rem);font-weight:700;letter-spacing:-.025em;line-height:1.2;margin:0 0 1.5rem}.facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;border-top:1px solid #222;border-bottom:1px solid #222;padding:1.25rem 0;margin-bottom:1.5rem}.label{display:block;color:#777;font-size:.7rem;margin-bottom:.2rem}.value{font-size:.95rem}.desc{color:#aaa;margin:0 0 1.75rem}.actions{display:flex;gap:.7rem;flex-wrap:wrap}.button{display:inline-block;padding:.65rem 1rem;border-radius:5px;text-decoration:none;font-size:.78rem;font-weight:600;background:#ff3e1d;color:white}.button.secondary{background:#1a1a1a;border:1px solid #333;color:#ddd}.note{color:#666;font-size:.72rem;margin-top:1.25rem}@media(max-width:560px){.facts{grid-template-columns:1fr}.top{margin-bottom:2rem}}
</style>
</head>
<body>
<main class="wrap">
  <div class="top"><a href="/th/"><img class="logo" src="/logo.svg" alt="4CUF"></a><div><a class="back" href="${englishCanonical}" lang="en">English</a> · <a class="back" href="/th/">← งานทั้งหมด</a></div></div>
  <article class="event">
    <p class="eyebrow">${escapeHtml(typeLabel)} · ${escapeHtml(statusLabel)}</p>
    <h1 class="title">${escapeHtml(event.name)}</h1>
    <div class="facts">
      <div><span class="label">วันที่</span><span class="value"><time datetime="${event.date}">${escapeHtml(humanDate)}</time></span></div>
      <div><span class="label">สถานที่</span><span class="value">${escapeHtml(event.loc)}</span></div>
    </div>
    <p class="desc">${escapeHtml(event.desc)}</p>
    <div class="actions">
      <a class="button" href="${escapeHtml(event.url)}" target="_blank" rel="noopener">ตรวจสอบกับแหล่งข้อมูล ↗</a>
      <a class="button secondary" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(event.loc)}" target="_blank" rel="noopener">เปิดแผนที่ ↗</a>
    </div>
    <p class="note">ตรวจสอบแหล่งข้อมูลล่าสุดเมื่อ ${escapeHtml(formatThaiDate(event.last_verified))} รายละเอียดอาจเปลี่ยนแปลง โปรดตรวจสอบกับผู้จัดก่อนเดินทาง</p>
  </article>
</main>
</body>
</html>
`;
}

function sitemap(data) {
  const pages = [
    { url: `${siteUrl}/`, lastmod: data.updated_at },
    { url: `${siteUrl}/th/`, lastmod: data.updated_at },
    { url: `${siteUrl}/art.html` },
    ...data.events
      .filter(event => event.status !== 'cancelled')
      .flatMap(event => [
        { url: `${siteUrl}/events/${encodeURIComponent(event.id)}/`, lastmod: event.last_verified },
        { url: `${siteUrl}/th/events/${encodeURIComponent(event.id)}/`, lastmod: event.last_verified }
      ])
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(page => `  <url>\n    <loc>${escapeHtml(page.url)}</loc>${page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ''}\n  </url>`).join('\n')}\n</urlset>\n`;
}

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

const raw = await readFile(dataPath, 'utf8');
const data = JSON.parse(raw);
const thaiRaw = await readFile(thaiDataPath, 'utf8');
const thaiData = JSON.parse(thaiRaw);

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
  if (!idPattern.test(event.id)) throw new Error(`Invalid event id: ${event.id}`);
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

if (thaiData.updated_at !== data.updated_at) {
  throw new Error('data/events-th.json updated_at must match data/events.json');
}
if (!Array.isArray(thaiData.translations) || thaiData.translations.length !== data.events.length) {
  throw new Error('Thai translations must contain exactly one entry for every event');
}
const thaiTranslations = new Map();
for (const [index, translation] of thaiData.translations.entries()) {
  for (const field of ['id', 'name', 'loc', 'desc']) {
    if (typeof translation[field] !== 'string' || translation[field].trim() === '') {
      throw new Error(`translations[${index}].${field} must be a non-empty string`);
    }
  }
  if (!ids.has(translation.id)) throw new Error(`Thai translation has unknown event id: ${translation.id}`);
  if (thaiTranslations.has(translation.id)) throw new Error(`Duplicate Thai translation id: ${translation.id}`);
  if (!/[ก-๙]/u.test(`${translation.name} ${translation.loc} ${translation.desc}`)) {
    throw new Error(`Thai translation contains no Thai text: ${translation.id}`);
  }
  thaiTranslations.set(translation.id, translation);
}
for (const id of ids) {
  if (!thaiTranslations.has(id)) throw new Error(`Missing Thai translation for event: ${id}`);
}
const localizedThaiEvents = data.events.map(event => ({ ...event, ...thaiTranslations.get(event.id) }));

const html = await readFile(htmlPath, 'utf8');
const thaiHtml = await readFile(thaiHtmlPath, 'utf8');
const start = '/* EVENTS_FALLBACK_START */';
const end = '/* EVENTS_FALLBACK_END */';
const startAt = html.indexOf(start);
const endAt = html.indexOf(end);
if (startAt < 0 || endAt < startAt) throw new Error('Event fallback markers are missing from index.html');
const thaiStartAt = thaiHtml.indexOf(start);
const thaiEndAt = thaiHtml.indexOf(end);
if (thaiStartAt < 0 || thaiEndAt < thaiStartAt) throw new Error('Event fallback markers are missing from th/index.html');

const embedded = JSON.stringify(data.events, null, 2);
const synced = `${html.slice(0, startAt + start.length)}${embedded}${html.slice(endAt)}`;
const thaiEmbedded = JSON.stringify(localizedThaiEvents, null, 2);
const thaiSynced = `${thaiHtml.slice(0, thaiStartAt + start.length)}${thaiEmbedded}${thaiHtml.slice(thaiEndAt)}`;
const generated = [
  { path: sitemapPath, content: sitemap(data), label: 'sitemap.xml' },
  { path: robotsPath, content: robots, label: 'robots.txt' },
  ...data.events.map(event => ({
    path: resolve(eventsPath, event.id, 'index.html'),
    content: eventPage(event),
    label: `events/${event.id}/index.html`
  })),
  ...localizedThaiEvents.map(event => ({
    path: resolve(thaiEventsPath, event.id, 'index.html'),
    content: thaiEventPage(event),
    label: `th/events/${event.id}/index.html`
  }))
];

if (checkOnly) {
  const stale = [];
  if (synced !== html) {
    stale.push('index.html fallback');
  }
  if (thaiSynced !== thaiHtml) stale.push('th/index.html fallback');
  for (const output of generated) {
    const current = await readFile(output.path, 'utf8').catch(error => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (current !== output.content) stale.push(output.label);
  }
  if (stale.length) {
    console.error(`Generated files are missing or stale:\n- ${stale.join('\n- ')}\nRun: node scripts/sync-events.mjs`);
    process.exitCode = 1;
  } else console.log(`Validated ${data.events.length} bilingual events; homepages, event pages, sitemap, and robots.txt are in sync.`);
} else {
  await writeFile(htmlPath, synced);
  await writeFile(thaiHtmlPath, thaiSynced);
  for (const output of generated) {
    await mkdir(resolve(output.path, '..'), { recursive: true });
    await writeFile(output.path, output.content);
  }
  console.log(`Validated and synced ${data.events.length} bilingual events plus homepages, event pages, sitemap, and robots.txt.`);
}
