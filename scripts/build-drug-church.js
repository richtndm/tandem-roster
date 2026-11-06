#!/usr/bin/env node
// Builds drug-church.json, the stats file behind the Drug Church dashboard. Public streaming and social numbers only.
// usage: node scripts/build-drug-church.js <chartmetric batch result file> [extras json file]
require('./artist-page.js')({ id: '555867', name: "Drug Church", file: 'drug-church.json' });
