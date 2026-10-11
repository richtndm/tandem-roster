#!/usr/bin/env node
// Builds plot-in-you.json, the file the public "The Plot In You" stats page reads when it opens.
// Streaming and social numbers only. No merch, sales or other private data belongs in this file.
//
// usage: node scripts/build-plot-in-you.js <chartmetric batch result file> [extras json file]
//
//  - <chartmetric batch result file>: the saved answer of Chartmetric's batch stat-movements call
//    (operation get_cm_stats_movements_batch). It must include artist 107586 (The Plot In You).
//  - [extras json file]: optional {"tracks": [{"name", "year", "weekly_streams", "monthly_streams"}],
//    "cities": [{"name", "country", "listeners"}]} copied from Chartmetric's top tracks and top Spotify
//    cities. When it is left out or fails the checks, the extras already published are kept.
//
// Each run also adds one dated point to "history", which is what the trend charts are drawn from.
require('./artist-page.js')({ id: '107586', name: 'The Plot In You', file: 'plot-in-you.json' });
