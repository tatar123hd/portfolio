# Yossapat Charoensakkajorn: portfolio

A one-page portfolio (`index.html`) and a browser demo of the training and project planner (`planner.html`). Plain HTML, CSS and JavaScript modules. No framework and no build step, so Vercel serves the files as they are.

## Run it locally

Node is installed through winget and is not on PATH. In Git Bash, first run:

```bash
export PATH="/c/Users/Yossapat/AppData/Local/Microsoft/WinGet/Packages/OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe/node-v24.18.0-win-x64:$PATH"
```

Then:

```bash
node tools/serve.mjs          # http://localhost:5173 (also serves /planner)
npm --prefix tools install    # once, for the image tool and tests
npm --prefix tools test       # logic, data, image and copy checks
```

## Edit the words

All page text is in `index.html` and `planner.html`. The tests in `tests/copy-rules.test.mjs` keep a few rules: no em dashes, no exclamation marks, no phone number in the page, and every agreed link present. Run the tests after editing.

## Update the research log

The Monday research log on the home page is generated from the research system's spreadsheet:

```bash
node tools/build-research-log.mjs "Multi-Asset Recommendation System/track-record.csv"
```

It keeps only the calls and their reasoning. Decisions, prices, FX rates and holdings are left out.

## Replace or add photos

Source photos sit in the repo root and are not committed. `tools/optimize-images.mjs` resizes them to WebP at 800 and 1600 px, strips all metadata (including location), rebuilds `og.jpg` and copies the CV:

```bash
node tools/optimize-images.mjs
```

## Layout

```
index.html, planner.html        pages
assets/css/                     site.css (tokens, page), planner.css (demo)
assets/js/lib/                  pure logic: dates, ranges, clashes, sessions, storage, tuning
assets/js/data/                 research log (generated) and planner sample data (made up)
assets/js/ui/                   mini planner, research log, ranat, motion, timeline, edit panel
assets/img/                     optimised photos
tools/                          local server, image and data scripts (not deployed)
tests/                          node:test suites (not deployed)
```

## Deploy

The repo is connected to Vercel as a static project (framework preset "Other", no build command). Every push to `main` deploys. `vercel.json` turns on clean URLs (`/planner`) and long caching for images.
