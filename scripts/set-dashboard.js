#!/usr/bin/env node
// Updates only the "shows" or "video" part of dashboards/<slug>.json. Public information only.
// usage: node scripts/set-dashboard.js <slug> --shows <file>   ([{"day","city","venue"}] from public listings)
//        node scripts/set-dashboard.js <slug> --video <YouTube id or link> "<title>"
//        node scripts/set-dashboard.js <slug> --no-video
const fs = require('fs'), path = require('path');
const [slug, flag, a, b] = process.argv.slice(2);
const file = path.join(__dirname, '..', 'dashboards', slug + '.json');
const fail = (m) => { console.error('NOT WRITTEN: ' + m); process.exit(1); };
if (!fs.existsSync(file)) fail('no dashboard ' + slug);
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
if (flag === '--shows') {
  const s = JSON.parse(fs.readFileSync(a, 'utf8'));
  if (!Array.isArray(s)) fail('shows file is not a list');
  d.shows = s.filter((x) => x && /^\d{4}-\d\d-\d\d$/.test(x.day) && x.city).map((x) => ({ day: x.day, city: String(x.city), venue: String(x.venue || '') })).sort((p, q) => (p.day < q.day ? -1 : 1));
} else if (flag === '--video') {
  const m = String(a).match(/(?:v=|youtu\.be\/|embed\/|^)([\w-]{11})(?:[?&#]|$)/);
  if (!m || !b) fail('need a YouTube link and a title');
  d.site.video = { id: m[1], title: b };
} else if (flag === '--no-video') { d.site.video = null; } else fail('unknown option');
fs.writeFileSync(file, JSON.stringify(d, null, 1) + '\n');
console.log(JSON.stringify({ ok: true, slug, shows: d.shows.length, video: d.site.video && d.site.video.title }));
