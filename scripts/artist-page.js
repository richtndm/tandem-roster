// Shared builder for the public single-artist stats pages (plot-in-you.json, four-year-strong.json).
// Streaming and social numbers only. No merch, sales or other private data belongs in these files.
// Called by the thin build-<artist>.js scripts next to it; see those for usage.
const fs = require('fs');
const path = require('path');

module.exports = function buildArtistPage({ id: ID, name: NAME, file: FILE }) {

const TREND = ['sp_monthly_listeners', 'sp_followers', 'ins_followers', 'tiktok_followers', 'ycs_subscribers'];
const OUT = path.join(__dirname, '..', FILE);
const [statsFile, extrasFile] = process.argv.slice(2);
if (!statsFile) { console.error('usage: node scripts/' + path.basename(process.argv[1]) + ' <chartmetric batch result file> [extras json file]'); process.exit(2); }
const fail = (msg) => { console.error('NOT WRITTEN: ' + msg); process.exit(1); };

const dig = (x) => {
  if (typeof x === 'string') { const i = x.indexOf('{'); if (i < 0) return null; try { x = JSON.parse(x.slice(i)); } catch (e) { return null; } }
  if (Array.isArray(x)) { for (const it of x) { const r = dig(it && it.text !== undefined ? it.text : it); if (r) return r; } return null; }
  if (x && typeof x === 'object') {
    if (x.operation && 'data' in x) return x.data;
    for (const k of ['structuredContent', 'result', 'content', 'output']) if (k in x) { const r = dig(x[k]); if (r) return r; }
    if (ID in x) return x;
  }
  return null;
};
const all = dig(fs.readFileSync(statsFile, 'utf8'));
const a = all && all[ID];
if (!a) fail('artist ' + ID + ' is not in ' + statsFile);

// Every metric Chartmetric reported movement for, with its latest value and 7-, 30- and 60-day changes.
const PERIODS = [['weekly_diff', 'd7'], ['monthly_diff', 'd30'], ['bimonthly_diff', 'd60']];
const metrics = {};
for (const [period, short] of PERIODS) {
  for (const suffix of ['', '_percent']) {
    const block = a[period + suffix] || {};
    for (const side of ['growths', 'declines']) {
      for (const [k, v] of Object.entries(block[side] || {})) {
        if (!v || typeof v.latestValue !== 'number') continue;
        const m = metrics[k] || (metrics[k] = { value: v.latestValue, d7: 0, d7pct: 0, d30: 0, d30pct: 0, d60: 0, d60pct: 0 });
        m.value = v.latestValue;
        if (typeof v.change === 'number') m[short + (suffix ? 'pct' : '')] = v.change;
      }
    }
  }
}
const n = Object.keys(metrics).length;
if (n < 15) fail('only ' + n + ' metrics came back for ' + NAME);
for (const k of ['sp_monthly_listeners', 'sp_followers', 'ins_followers']) if (!metrics[k] || !(metrics[k].value > 1000)) fail('missing or implausible ' + k);

let previous = null;
try { previous = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) { /* first build */ }

// One point per run date for the trend charts (same-day reruns replace the point).
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
const point = { day: today };
for (const k of TREND) point[k] = metrics[k] ? metrics[k].value : null;
const history = (previous && Array.isArray(previous.history) ? previous.history : []).filter((h) => h && h.day && h.day !== today);
history.push(point);
history.sort((x, y) => (x.day < y.day ? -1 : 1));

// Optional extras: top tracks and top cities, checked before they replace what is published.
let extras = previous && previous.extras ? previous.extras : null, extrasNote = 'kept previous';
if (extrasFile) {
  try {
    const e = JSON.parse(fs.readFileSync(extrasFile, 'utf8'));
    const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
    const tracks = (e.tracks || []).filter((t) => t && typeof t.name === 'string' && t.name.trim() && int(t.weekly_streams, 100, 5e8))
      .map((t) => ({ name: t.name.trim().slice(0, 80), year: int(t.year, 1990, 2100) ? t.year : null, weekly_streams: t.weekly_streams, monthly_streams: int(t.monthly_streams, 100, 2e9) ? t.monthly_streams : null }))
      .sort((x, y) => y.weekly_streams - x.weekly_streams).slice(0, 10);
    const cities = (e.cities || []).filter((c) => c && typeof c.name === 'string' && c.name.trim() && int(c.listeners, 100, 5e7))
      .map((c) => ({ name: c.name.trim().slice(0, 60), country: String(c.country || '').toUpperCase().slice(0, 2), listeners: c.listeners }))
      .sort((x, y) => y.listeners - x.listeners).slice(0, 10);
    if (tracks.length >= 3 && cities.length >= 3) { extras = { updated: today, tracks, cities }; extrasNote = 'updated'; }
    else extrasNote = 'rejected (needs at least 3 valid tracks and 3 valid cities); kept previous';
  } catch (err) { extrasNote = 'unreadable (' + err.message + '); kept previous'; }
}

// Optional tour map: tours/<same file name> lists announced shows (city, date, map coordinates; no venues).
// It is copied in on every build, so the map survives the weekly rewrite. No file means no "tour" field.
let tour = null, tourNote = 'none';
const TOUR = path.join(__dirname, '..', 'tours', FILE);
if (fs.existsSync(TOUR)) {
  try {
    const t = JSON.parse(fs.readFileSync(TOUR, 'utf8'));
    const num = (v, lo, hi) => typeof v === 'number' && isFinite(v) && v >= lo && v <= hi;
    const str = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
    const shows = (t.shows || []).filter((s) => s && /^\d{4}-\d\d-\d\d$/.test(s.day) && str(s.city, 60) && num(s.lat, -90, 90) && num(s.lng, -180, 180))
      .map((s) => ({ day: s.day, city: str(s.city, 60), region: str(s.region, 20), country: String(s.country || '').toUpperCase().slice(0, 2), lat: s.lat, lng: s.lng, leg: str(s.leg, 40) }))
      .sort((x, y) => (x.day < y.day ? -1 : 1));
    if (shows.length) { tour = { title: str(t.title, 60), shows }; tourNote = shows.length + ' shows'; }
    else tourNote = 'no valid shows in tours/' + FILE + '; left out';
  } catch (err) { tourNote = 'unreadable tours/' + FILE + ' (' + err.message + '); left out'; }
}

const data = { generated: new Date().toISOString(), artist: { id: ID, name: NAME }, metrics, history: history.slice(-160), extras };
if (tour) data.tour = tour;
fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
console.log(JSON.stringify({ ok: true, metrics: n, monthlyListeners: metrics.sp_monthly_listeners.value, historyPoints: data.history.length, extras: extrasNote, tour: tourNote }));
};
