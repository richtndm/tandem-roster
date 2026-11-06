#!/usr/bin/env node
// Builds intervals.json, the stats file behind the Intervals dashboard. Public streaming and social numbers only.
// usage: node scripts/build-intervals.js <chartmetric batch result file> [extras json file]
require('./artist-page.js')({ id: '66624', name: "Intervals", file: 'intervals.json' });
