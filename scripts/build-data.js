#!/usr/bin/env node
// Builds data.json, the file the Tandem roster stats page reads each time it opens.
//
// usage: node scripts/build-data.js <chartmetric batch result file> [shows json file]
//
//  - <chartmetric batch result file>: the saved answer of Chartmetric's batch stat-movements
//    call (operation get_cm_stats_movements_batch) for the 24 roster artists.
//  - [shows json file]: optional array of {event_id, artist_id, day, city, venue} read from
//    Bandsintown. When it is left out, the shows already in data.json are kept.
//
// The script refuses to overwrite data.json when the new numbers look broken.
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'data.json');
const ROSTER = [99040, 107586, 29919, 208422, 1780, 59542, 1710599, 470827, 555867, 66624, 484706, 155926,
  273408, 572295, 216347, 1460954, 8475583, 59508, 385700, 145507, 9920273, 866342, 10907298, 9455958].map(String);
const METRICS = ['sp_monthly_listeners', 'sp_followers', 'ins_followers', 'tiktok_followers', 'ycs_subscribers'];

const [statsFile, showsFile] = process.argv.slice(2);
if (!statsFile) { console.error('usage: node scripts/build-data.js <chartmetric batch result file> [shows json file]'); process.exit(2); }
const fail = (msg) => { console.error('NOT WRITTEN: ' + msg); process.exit(1); };

// The Chartmetric answer is {operation, ..., data: {<artist id>: {...}}}; accept it wrapped or bare.
const dig = (x) => {
  if (typeof x === 'string') { const i = x.indexOf('{'); if (i < 0) return null; try { x = JSON.parse(x.slice(i)); } catch (e) { return null; } }
  if (Array.isArray(x)) { for (const it of x) { const r = dig(it && it.text !== undefined ? it.text : it); if (r) return r; } return null; }
  if (x && typeof x === 'object') {
    if (x.operation && 'data' in x) return x.data;
    for (const k of ['structuredContent', 'result', 'content', 'output']) if (k in x) { const r = dig(x[k]); if (r) return r; }
    if (ROSTER.some((id) => id in x)) return x;
  }
  return null;
};
const stats = dig(fs.readFileSync(statsFile, 'utf8'));
if (!stats || typeof stats !== 'object') fail('could not find artist stats in ' + statsFile);

const cell = (a, period, k) => { const p = a[period] || {}; return (p.growths && p.growths[k]) || (p.declines && p.declines[k]) || null; };
const roster = ROSTER.filter((id) => stats[id]).map((id) => {
  const a = stats[id];
  const row = { id, name: a.artistInfo ? a.artistInfo.name : id };
  for (const k of METRICS) {
    const any = cell(a, 'weekly_diff', k) || cell(a, 'monthly_diff', k) || cell(a, 'bimonthly_diff', k);
    const month = cell(a, 'monthly_diff', k);
    row[k] = any ? any.latestValue : null;            // null: Chartmetric reported no movement in two months
    row[k + '_30d'] = any ? (month ? month.change : 0) : null;
  }
  const mp = cell(a, 'monthly_diff_percent', 'sp_monthly_listeners');
  row.sp_monthly_listeners_30d_pct = row.sp_monthly_listeners == null ? null : mp ? mp.change : 0;
  return row;
});
const missing = ROSTER.filter((id) => !stats[id]);
if (roster.length < 20) fail('only ' + roster.length + ' of 24 artists came back from Chartmetric');
if (roster.filter((r) => r.sp_monthly_listeners > 0).length < 20) fail('most artists have no Spotify listener number');

let previous = null;
try { previous = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) { /* first build */ }

let shows, showsUpdated;
if (showsFile) {
  shows = JSON.parse(fs.readFileSync(showsFile, 'utf8'));
  if (!Array.isArray(shows)) fail('shows file is not a list');
  shows = shows.filter((s) => s && /^\d{4}-\d\d-\d\d$/.test(String(s.day)) && ROSTER.includes(String(s.artist_id)))
    .map((s) => ({ event_id: String(s.event_id), artist_id: String(s.artist_id), day: String(s.day), city: String(s.city || ''), venue: String(s.venue || '') }));
  showsUpdated = process.env.SHOWS_UPDATED || new Date().toISOString();
} else {
  shows = previous && Array.isArray(previous.shows) ? previous.shows : [];
  showsUpdated = previous ? previous.showsUpdated || null : null;
}

const data = { generated: new Date().toISOString(), showsUpdated, roster, shows };
fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
console.log(JSON.stringify({ ok: true, artists: roster.length, missingArtists: missing, shows: shows.length, showsUpdated,
  totalMonthlyListeners: roster.reduce((s, r) => s + (r.sp_monthly_listeners || 0), 0) }));
