# Tandem roster stats data

`data.json` holds the numbers shown on the Tandem Management Co. roster stats page: streaming and
social stats for the 24 roster artists (from Chartmetric) and their upcoming shows (from Bandsintown).
The page reads this file each time it opens.

- `data.json` is rewritten every morning by a scheduled Claude task. Don't edit it by hand; changes are overwritten.
- `scripts/build-data.js` turns the Chartmetric answer and the show list into `data.json`.

Everything in this repository is public. Nothing private (sales, contracts, contact details) belongs here.
