# photo-to-pattern

Knitting pattern generator: turns an image, logo or text into a colour stitch chart.
Runs entirely in the browser; no backend.

## Test locally

```sh
npm install
npm test              # core unit tests
npx serve .           # then open http://localhost:3000/frontend/
```

Serve the repo root, not `frontend/`: the frontend imports `../core/*.js`.
Locally the banner shows no "Last update" date, because `frontend/version.js` is committed empty.

To see the page as deployed, with the date, build and run the image:

```sh
docker build -t knitting-pattern .
docker run --rm -p 8080:8080 knitting-pattern   # open http://localhost:8080/
```

## Deploy

The `Dockerfile` copies `frontend/` and `core/` into a Caddy image and writes the build date
into `frontend/version.js`. The banner's "Last update" therefore updates on every image build;
no manual edit is needed. Do not edit `version.js` by hand.

1. Commit and push.
2. Build the image on (or for) the Pi: `docker build -t knitting-pattern .`
3. Restart the container with the new image (via the setup in pi-infra).

Docker reuses cached layers: if nothing in `frontend/` or `core/` changed, the date stays at the
last real change. Use `docker build --no-cache …` to force today's date.

Feedback address, future URL and app name are set in `frontend/config.js`.
