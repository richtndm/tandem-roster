# Tandem roster stats data

This repository holds two data files. `data.json` holds the numbers shown on the Tandem Management Co. roster stats page: streaming and
social stats for the 24 roster artists (from Chartmetric) and their upcoming shows (from Bandsintown).
The page reads this file each time it opens.

- `data.json` is rewritten every morning by a scheduled Claude task. Don't edit it by hand; changes are overwritten.
- `scripts/build-data.js` turns the Chartmetric answer and the show list into `data.json`.
- `plot-in-you.json` holds the streaming and social stats shown on the public The Plot In You stats
  page. It is rewritten every Tuesday morning by a scheduled Claude task, which also adds one point to
  its `history` for the trend charts.
- `scripts/build-plot-in-you.js` builds `plot-in-you.json` from the same Chartmetric answer.

Everything in this repository is public. Nothing private (sales, contracts, contact details) belongs here.
