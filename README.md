<p align="center"><img src="docs/banner.svg" alt="Sol — a brighter little weather ritual" width="100%" /></p>

# Sol ☀️

A small weather app for curious days. An animated sun, drifting clouds, and a city search make checking the weather feel a little less routine. Built with React and Vite, served by a small Node server.

## Start with Docker

Prerequisite: **Docker with Compose v2**. Use Bash/WSL for the helper script.

```bash
git clone --depth 1 https://github.com/josesustaita/Sol.git
cd Sol
./scripts/bootstrap.sh
```

Open **http://localhost:8082**. The script checks Docker, copies `.env.example` to `.env` if needed, builds and tests the app, and waits for a healthy server. First run needs internet to download dependencies and Docker images. Existing `.env` settings are preserved.

**No key required:** the app starts with clearly labeled sample weather for **Immokalee, London, and Tokyo**. These are illustrative conditions, not current forecasts. Search a sample city and switch between Fahrenheit and Celsius. Unsupported sample cities show a useful message.

## Live weather

Edit the ignored root `.env` file:

```dotenv
WEATHER_API_KEY=your-own-rapidapi-openweather-key
SOL_PORT=8082
```

Use a key with access to RapidAPI's `community-open-weather-map` weather endpoint. Run `./scripts/bootstrap.sh` again to recreate the server with the setting. No rebuild-time key is needed: the server reads the key at runtime and keeps it out of the browser bundle. A provider subscription or quota may apply. The initial card is a labeled sample; submit a city search to fetch live conditions. Provider outages and unknown cities show an error while retaining the previous result.

The previous source contained an embedded provider credential. It has been removed from the current source; its owner should revoke/rotate it because Git history still contains it.

## Everyday commands

```bash
./scripts/bootstrap.sh doctor   # Docker + Compose configuration
./scripts/bootstrap.sh logs     # follow server logs; Ctrl+C stops following
./scripts/bootstrap.sh test     # build tests + start and wait for health
./scripts/bootstrap.sh down     # stop/remove this project's containers
SOL_PORT=8092 ./scripts/bootstrap.sh  # use a different local port
```

The web service binds to loopback. Stop it with `down`; generated images remain cached. There are no database volumes or user accounts.

## Local development

Use **Node 22.12+** (Docker uses Node 22).

```bash
cd sol
npm ci
npm test
npm run build
npm start
```

The production server listens on http://localhost:3000. For hot reload, leave it running and run `npm run dev` in another terminal from `sol/`. Vite proxies `/api` to port 3000. For live local development, export your key privately into the server process environment; the root `.env` is consumed by Compose, not automatically by `npm start`.

## Project map

- `sol/src/App.jsx` — search form, request cancellation, and weather display.
- `sol/src/App.css` — responsive styling and decorative sun/cloud motion.
- `sol/weather.mjs` — input checks, sample conversion, provider timeout, and response normalization.
- `sol/server.mjs` — static assets, `/api/weather`, and `/healthz`.
- `sol/test/` — sample/live weather, validation, and upstream-error tests without network calls.
- `docs/banner.svg` — animated local README artwork.

`GET /api/weather?city=London&units=metric` returns normalized conditions (`name`, `country`, `temp`, `feels`, `humidity`, `low`, `high`, `description`, `sample`). Units are `metric` or `imperial`. Invalid queries return 400, unknown cities 404, and upstream failures 502. Provider requests have an eight-second timeout.

## Motion & accessibility

The form has visible labels, keyboard controls, and live error/loading feedback. Weather remains readable while requests run. Decorative motion respects `prefers-reduced-motion`; no essential information depends on animation.

## Troubleshooting

- **Docker unavailable:** start Docker Desktop/Engine and run `doctor`.
- **Port occupied:** change `SOL_PORT` in `.env` and rerun the bootstrap.
- **Still seeing samples:** set `WEATHER_API_KEY`, recreate the container, and submit a city search.
- **Live lookup fails:** check the provider key, endpoint access, and remaining quota. The app does not replace failed live requests with invented data.

Contributions: run `npm test` and `npm run build` from `sol/`, then include what changed and how you checked it. Licensed under [MIT](LICENSE).
