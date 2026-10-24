# Tandem roster stats data

This repository holds four data files. `data.json` holds the numbers shown on the Tandem Management Co. roster stats page: streaming and
social stats for the 24 roster artists (from Chartmetric) and their upcoming shows (from Bandsintown).
The page reads this file each time it opens.

- `data.json` is rewritten every morning by a scheduled Claude task. Don't edit it by hand; changes are overwritten.
- `scripts/build-data.js` turns the Chartmetric answer and the show list into `data.json`.
- `plot-in-you.json` holds the streaming and social stats shown on the public The Plot In You stats
  page. It is rewritten every Tuesday morning by a scheduled Claude task, which also adds one point to
  its `history` for the trend charts.
- `scripts/build-plot-in-you.js` builds `plot-in-you.json` from the same Chartmetric answer.
- `four-year-strong.json` holds the same streaming and social stats for the public Four Year Strong
  stats page. It is rewritten every Monday morning by a scheduled Claude task.
- `scripts/build-four-year-strong.js` builds `four-year-strong.json`.
- `we-came-as-romans.json` holds the same stats for the public We Came As Romans stats page. It is
  rewritten every Tuesday morning by a scheduled Claude task, using `scripts/build-we-came-as-romans.js`.
- `save-us.json` holds the same stats for the public Save Us stats page. It is rewritten every Monday
  morning by a scheduled Claude task, using `scripts/build-save-us.js`.
- `like-moths-to-flames.json` holds the same stats for the public Like Moths To Flames stats page. It is
  rewritten every Monday morning by a scheduled Claude task, using `scripts/build-like-moths-to-flames.js`.
- `pages/` holds the page code for stats pages that load it from here instead of pasting it whole into
  Squarespace (the Squarespace block is then two lines). Served through jsDelivr.
- `scripts/artist-page.js` is the shared code behind the single-artist build scripts.
- `tours/plot-in-you.json` lists The Plot In You's announced 2027 shows (date, city, map coordinates; no
  venues) for the tour map. Each weekly build copies it into `plot-in-you.json` as `tour`; edit this file
  to change the dates. Any artist can get one by adding `tours/<its json file name>`.

Everything in this repository is public. Nothing private (sales, contracts, contact details) belongs here.
