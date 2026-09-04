# Proink Companion

A companion PWA for [Proink OS](https://github.com/thepropm/proink-os), the custom firmware for the Xteink X4 Pro e-reader. Runs entirely in the browser — no backend of its own — and talks straight to your device over the local network.

Live at: https://thepropm.github.io/proink-companion/

## What it does

- **Dashboard** — device status, live "now reading" progress, firmware update check
- **Files** — browse, upload, download, delete, and organize the SD card
- **Settings** — edit every device setting (WiFi, reading defaults, home theme, sleep screen, button mapping, KOReader sync) without going through the device's own UI
- **Stats** — reading stats and the on-device crash log

More is planned: OPDS/WebDAV catalog browsing and an in-browser EPUB prep/optimizer (see the firmware repo's roadmap).

## Connecting to a device

The device has no auth and no discovery service (yet) — enter its IP address manually on the Connect screen. It's shown on-device under Settings → WiFi; if the device hasn't joined a network yet, connect to its `Proink-…` hotspot and use `192.168.4.1`.

Cross-origin requests from this app to the device only work because the firmware allow-lists this app's origin (`https://thepropm.github.io`) plus `localhost` for local development — see `WebFileServer.cpp`'s CORS handling in the firmware repo.

## Development

```bash
npm install
npm run dev
```

Point Connect at a real device's IP on your LAN — `localhost` origins are allow-listed by the firmware for exactly this.

```bash
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

Deploys automatically to GitHub Pages on push to `main` (`.github/workflows/deploy.yml`).
