# Resilient Mesh — Offline-First P2P Emergency Communication

> Zero-cost · Zero-backend · Serverless PWA for peer-to-peer disaster communication.
> Works **100% offline**: messages and distress alerts are stored locally in IndexedDB and the app shell + map tiles are cached by a Service Worker.

**Live demo:** https://Flynntaggart26.github.io/resilient-mesh/

![Status](https://img.shields.io/badge/offline--first-PWA-red) ![Backend](https://img.shields.io/badge/backend-none-success) ![Storage](https://img.shields.io/badge/storage-IndexedDB-blue) ![License](https://img.shields.io/badge/license-MIT-slate)

---

## Why this exists

When earthquakes, floods, or conflicts take down cell towers, centralized chat apps die with them. **Resilient Mesh** is designed for that moment:

- 📴 **Offline-first** — installable PWA, usable with zero connectivity after first load.
- 🗄️ **Local-first data** — every message and alert persists in IndexedDB (Dexie.js) before any network is involved.
- 📡 **P2P by design** — WebRTC DataChannels (PeerJS, Phase 2) sync devices directly, no server in the middle.
- 🗺️ **Offline maps** — Leaflet tiles cached via Workbox `CacheFirst` so navigation and distress pins keep working.
- 💸 **Zero cost** — no Express, AWS, Firebase, or Supabase. Static hosting (GitHub Pages) only.

## Features (Phase 1 — foundation)

| Area | Status | Details |
|---|---|---|
| PWA shell | ✅ | `vite-plugin-pwa` + Workbox, auto-updating Service Worker, installable manifest |
| Messages | ✅ | `messages` table (`sender`, `content`, `timestamp`, `status`), reactive list, offline composer |
| Emergency alerts | ✅ | `emergency_alerts` table (`lat`, `lon`, `distress_type`, `timestamp`), GPS + manual entry |
| Local profile | ✅ | `profiles` table — stable device identity without any login server |
| Offline map | ✅ | Leaflet + cached OSM tiles, alerts plotted as markers |
| Mesh networking | 🔲 | Phase 2 — PeerJS/WebRTC DataChannels, `queued` → `sent` sync |

## Tech stack

- **React 19 + Vite** — UI and build
- **Tailwind CSS v4** — styling
- **Dexie.js + dexie-react-hooks** — IndexedDB schema + reactive queries
- **Leaflet** — offline-capable maps
- **vite-plugin-pwa (Workbox)** — Service Worker caching, incl. map-tile `CacheFirst` runtime cache
- **GitHub Pages + Actions** — free static hosting / CI deploy

No backend. No cloud database. No API keys.

## Quickstart

```bash
# Requirements: Node 18+
npm install
npm run dev      # local dev (PWA enabled, test offline in DevTools → Application)
npm run build    # production build → dist/
npm run preview  # serve the production build locally
npm run lint     # oxlint
```

Open once **while online** so the Service Worker precaches the shell and map tiles — then disconnect and everything keeps working.

## How offline works

1. **App shell** — Workbox precaches all built JS/CSS/HTML/icons on first visit.
2. **Map tiles** — OpenStreetMap tiles are cached `CacheFirst` (500 entries, 30 days). Pan over your area once while online to prime the cache.
3. **Data** — every write goes to IndexedDB first. Connectivity badges are informational only; saves never fail offline.
4. **Sync (Phase 2)** — PeerJS DataChannels will relay queued rows device-to-device and flip `status` to `sent`/`delivered`.

## Project structure

```
src/
├── App.jsx                    # Phase 1 shell + layout
├── main.jsx                   # SW registration + React root
├── db/database.js             # Dexie schema + saveMessage/saveAlert/saveLocalProfile
├── components/
│   ├── Layout/Header.jsx      # Title + online/offline badge
│   ├── Chat/                  # MessageList (liveQuery) + MessageComposer (local write)
│   ├── Alerts/                # AlertForm (GPS/manual) + AlertList
│   ├── Map/OfflineMap.jsx     # Leaflet + IndexedDB markers
│   └── Mesh/MeshStatusCard.jsx# Phase 2 placeholder (PeerJS)
├── hooks/useOnlineStatus.js   # navigator.onLine tracker
└── utils/id.js                # serverless peer-id (crypto.randomUUID → localStorage)
```

## IndexedDB schema (v1)

```js
// database: resilient-mesh-db
messages:         '++id, sender, timestamp, status'          // content stored, not indexed
emergency_alerts: '++id, distress_type, timestamp, latitude, longitude'
profiles:         '++id, &peerId, displayName'
```

Inspect it live: DevTools → Application → Storage → IndexedDB → `resilient-mesh-db`.

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml` (build → upload artifact → `actions/deploy-pages`). No server, no secrets — static files only.

## Roadmap

- [x] **Phase 1** — PWA foundation + IndexedDB schema (this release)
- [ ] **Phase 2** — PeerJS/WebRTC DataChannels, peer discovery via QR/manual ID, mesh relay, message status sync
- [ ] **Phase 3** — full offline map regions (pre-bundled tiles), alert clustering, battery-efficient background sync

## Contributing

PRs welcome. Keep the constraints: **no backend, no paid services, offline-first always**. Run `npm run build && npm run lint` before opening a PR.

## License

MIT — use it freely in real emergencies.
