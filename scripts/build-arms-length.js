#!/usr/bin/env node
// Builds arms-length.json, the stats file behind the Arm's Length dashboard. Public streaming and social numbers only.
// usage: node scripts/build-arms-length.js <chartmetric batch result file> [extras json file]
require('./artist-page.js')({ id: '1710599', name: "Arm's Length", file: 'arms-length.json' });
