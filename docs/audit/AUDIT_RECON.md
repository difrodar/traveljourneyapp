# AUDIT_RECON.md — Phase 1 Reconnaissance

> **STATUS (Stand 2026-05-30): abgeschlossen.** Rein faktische Bestandsaufnahme bei Commit `661bf86` als Grundlage der Phasen 2/3. Die daraus abgeleiteten Befunde sind in `AUDIT_BUGS.md` und `AUDIT_DEADCODE.md` dokumentiert und inzwischen behoben bzw. bewusst für den Prototyp-Scope zurückgestellt. Dokument als Beleg der abgeschlossenen internen Code-Review-Phase erhalten (siehe README §5).

**Datum:** 2026-05-10
**Branch:** main @ `661bf86` (HEAD bei Audit-Start)
**Working tree:** clean (vor Phase-1-Output-Erstellung)
**Auditor:** Claude Code (Senior Svelte Auditor Auftrag)
**Status:** rein faktisch, keine Bewertung. Bewertung erfolgt in Phase 2 / 3.

---

## 1. Projektkonfiguration

### 1.1 Stack & Versionen
Quelle: [package.json](../../package.json), [svelte.config.js](../../svelte.config.js), [jsconfig.json](../../jsconfig.json), [vite.config.js](../../vite.config.js).

| Komponente | Version |
|---|---|
| SvelteKit | `^2.57.0` |
| Svelte | `^5.55.2` |
| Vite | `^8.0.7` |
| `@sveltejs/vite-plugin-svelte` | `^7.0.0` |
| `@sveltejs/adapter-netlify` | `^6.0.4` |
| `@sveltejs/adapter-auto` | `^7.0.1` (devDep, nicht aktiv genutzt) |
| TypeScript | `^6.0.3` (devDep, nur als Tooling — kein `.ts` im Projekt) |
| `@types/node` | `^25.6.1` |
| MongoDB Node Driver | `^7.2.0` |
| Leaflet | `^1.9.4` |
| `leaflet.markercluster` | `^1.5.3` |

Module-Type: ESM (`"type": "module"` in package.json).

### 1.2 Svelte-Konfiguration
Aus [svelte.config.js](../../svelte.config.js):
- **Runes-Modus erzwungen** für alles ausserhalb `node_modules` via `compilerOptions.runes` (Funktion).
- **Adapter:** `adapter-netlify` (aktiv).
- **Kit-Optionen:** keine zusätzlichen (alle Defaults).

### 1.3 JS-/TS-Konfiguration
Aus [jsconfig.json](../../jsconfig.json):
- Erbt von `.svelte-kit/tsconfig.json` (generiert).
- `allowJs: true`, `checkJs: false` → Type-Checking auf `.js`-Dateien ist abgeschaltet.
- `moduleResolution: "bundler"`.

→ **Konsequenz:** `tsc --noEmit` würde keine relevanten Fehler in den `.js`-Dateien produzieren.

### 1.4 Vite-Konfiguration
[vite.config.js](../../vite.config.js) — minimal:
```js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
export default defineConfig({ plugins: [sveltekit()] });
```
Keine Aliase, keine Plugins ausser SvelteKit, keine Test-Konfiguration.

### 1.5 Node-Engine
Nicht in `package.json` deklariert (kein `engines`-Feld). [CLAUDE.md](../../CLAUDE.md) nennt **Node 18+**.

---

## 2. Inventar

### 2.1 Datei-Counts

| Typ | Anzahl | Anmerkung |
|---|---:|---|
| `.svelte` gesamt | 30 | |
| → Komponenten in `src/lib/components/` | 17 | reusable UI |
| → SvelteKit `+page.svelte` | 12 | Routen-Views |
| → SvelteKit `+layout.svelte` | 1 | [src/routes/+layout.svelte](../../src/routes/+layout.svelte) |
| `.js` gesamt | 32 | |
| → SvelteKit `+page.server.js` | 12 | Server-Loads / Form-Actions |
| → SvelteKit `+server.js` | 2 | [logout/+server.js](../../src/routes/logout/+server.js), [events/[id]/ics/+server.js](../../src/routes/events/[id]/ics/+server.js) |
| → SvelteKit `+layout.server.js` | 1 | [src/routes/+layout.server.js](../../src/routes/+layout.server.js) |
| → Hooks | 1 | [src/hooks.server.js](../../src/hooks.server.js) — keine `hooks.client.js` |
| → `src/lib/` (excl. components) | 4 | `cities.js`, `constants.js`, `media.js`, `index.js` |
| → `src/lib/server/` Top-Level | 3 | `auth.js`, `db.js`, `repository.js` (Barrel) |
| → `src/lib/server/repositories/` | 7 | `events.js`, `ideas.js`, `journey.js`, `seed.js`, `shared.js`, `shares.js`, `trips.js` |
| → `src/lib/utils/` | 2 | `event-format.js`, `filter-persistence.svelte.js` |
| `scripts/` | 9 | Migrations + Seed + Smoke (siehe 3.2) |
| Test-Dateien (`*.test.*` / `*.spec.*`) | 0 | keine Unit-Tests im Projekt; einzige Treffer in `node_modules/devalue/` (nicht relevant) |

### 2.2 Routen-Inventar
Aus `src/routes/`:

| Route | Page | Server-Load / Action | Hinweis |
|---|---|---|---|
| `/` | `+page.svelte` | `+page.server.js` | Dashboard |
| `/login` | `+page.svelte` | `+page.server.js` | öffentlich |
| `/logout` | — | `+server.js` | POST endpoint |
| `/profile` | `+page.svelte` | `+page.server.js` | enthält Avatar-Upload-Action (neu in `661bf86`) |
| `/events` | `+page.svelte` | `+page.server.js` | Liste/Filter |
| `/events/new` | `+page.svelte` | `+page.server.js` | Erstellung |
| `/events/[id]` | `+page.svelte` | `+page.server.js` | Detail/Edit/Memory |
| `/events/[id]/ics` | — | `+server.js` | Calendar-Export |
| `/journey` | `+page.svelte` | `+page.server.js` | Timeline + Share-Erstellung |
| `/map` | `+page.svelte` | `+page.server.js` | Kartenansicht |
| `/ideas` | `+page.svelte` | `+page.server.js` | Travel Ideas |
| `/share/[hash]` | `+page.svelte` | `+page.server.js` | öffentlich (kein Auth) |
| `/trips` | `+page.svelte` | `+page.server.js` | Trip-Liste |
| `/trips/[id]` | `+page.svelte` | `+page.server.js` | Trip-Detail |

### 2.3 `src/lib/`-Struktur

```
src/lib/
├── assets/
│   └── favicon.svg
├── cities.js                     # Stadt-Liste für CityCombobox
├── components/                   # 17 reusable .svelte
├── constants.js                  # Kategorien, Upload-Limits, MIME-Allowlist
├── index.js                      # leerer Stub (SvelteKit-Template-Default)
├── media.js                      # Media-Katalog für Fallback-Bilder
├── server/
│   ├── auth.js                   # Auth, Session, Avatar-Mutations
│   ├── db.js                     # MongoDB-Client
│   ├── repositories/
│   │   ├── events.js             # 473 Zeilen
│   │   ├── ideas.js
│   │   ├── journey.js
│   │   ├── seed.js
│   │   ├── shared.js             # 320 Zeilen — gemeinsame Helfer
│   │   ├── shares.js             # öffentliche Read-Only-Shares
│   │   └── trips.js
│   └── repository.js             # Barrel — re-exports
└── utils/
    ├── event-format.js           # buildGallery, formatEventDate, buildShareText
    └── filter-persistence.svelte.js  # runes-fähiger State-Helper
```

### 2.4 Komponenten-Liste mit Zeilen-Counts (LOC inkl. CSS)

| Komponente | LOC |
|---|---:|
| Avatar.svelte | 60 |
| CityCombobox.svelte | 148 |
| DashboardStats.svelte | 68 |
| DeleteRecurringDialog.svelte | 114 |
| EventCard.svelte | 205 |
| EventForm.svelte | **432** |
| EventMapPanel.svelte | 180 |
| FriendPicker.svelte | 99 |
| JourneyCard.svelte | 235 |
| LeafletMapView.svelte | 278 |
| LocationPinGrid.svelte | 279 |
| MemoryForm.svelte | 212 |
| Navigation.svelte | 139 |
| NotificationBell.svelte | 264 |
| PlaceholderIcon.svelte | 19 |
| SharePreview.svelte | 260 |
| TravelIdeaCard.svelte | 64 |
| `+page.svelte` (root/Dashboard) | **565** |

### 2.5 Server-Module mit Zeilen-Counts

| Modul | LOC |
|---|---:|
| auth.js | 194 |
| db.js | 34 |
| repository.js (Barrel) | 37 |
| repositories/events.js | **473** |
| repositories/ideas.js | 102 |
| repositories/journey.js | 227 |
| repositories/seed.js | 271 |
| repositories/shared.js | 320 |
| repositories/shares.js | 165 |
| repositories/trips.js | 151 |

### 2.6 Build-Artefakte im Repo
Geprüft via `.gitignore` und Filesystem:
- `.svelte-kit/`, `build/`, `dist/`, `.netlify/`, `.vercel/`, `node_modules/` → **alle gitignored** ([.gitignore](../../.gitignore)).
- `static/` enthält nur `robots.txt`.
- `.env.example` ist explizit getrackt; `.env` und `.env.*` sind ignoriert.
- Keine `.bak` / `.old` / `_unused` / `*-copy` -Dateien im Repo gefunden.

### 2.7 Asset-Inventar
- `static/robots.txt`
- `src/lib/assets/favicon.svg` (einziges Asset im `lib/`-Tree)

---

## 3. Tooling-Status

### 3.1 Statische Checker — Verfügbarkeit

| Tool | In `package.json`? | In `node_modules/` installiert? | Konfiguriert? |
|---|---|---|---|
| `svelte-check` | nein | nein | — |
| ESLint | nein | nein (kein `.eslintrc*` im Repo) | nein |
| Prettier | nein | nein (kein `.prettier*` im Repo) | nein |
| `tsc` (über `typescript`-Dep) | ja | ja | wirkungslos für `.js` wegen `checkJs: false` |
| Test-Runner (vitest / jest / playwright) | nein | nein | nein |

Belegkette:
- `Glob ".eslintrc*"` → 0 Treffer in Repo (nur `node_modules/set-cookie-parser/dist/.eslintrc.cjs`).
- `Glob ".prettier*"` → 0 Treffer.
- `Glob "node_modules/svelte-check/package.json"` → 0 Treffer.

→ **Pro Auftrag** (*"NICHT ausführen, falls Netzwerk/Install nötig"*): `npx svelte-check`, `npx eslint`, `npx tsc --noEmit` werden in Phase 2 **nicht ausgeführt**, der Status wird im Phase-2-Anhang dokumentiert.

### 3.2 npm-Scripts

| Script | Zweck (laut [package.json](../../package.json) + [CLAUDE.md](../../CLAUDE.md)) |
|---|---|
| `dev` | `vite dev` — lokaler Server `http://localhost:5173` |
| `build` | `vite build` — Produktions-Build (catches Svelte- + Import-Errors) |
| `preview` | `vite preview` |
| `prepare` | `svelte-kit sync || echo ''` — generiert `.svelte-kit/tsconfig.json` |
| `seed` | `node scripts/seed.js` — Demo-Daten |
| `upsert:samples` | `node scripts/upsert-sample-events.js` |
| `normalize:idea-media` | konvertierte Reiseideen normalisieren |
| `normalize:city-coordinates` | fehlende Koordinaten ergänzen |
| `normalize:multi-image` | Single-Image → `images[]`-Migration |
| `migrate:trips` | Trips-Indexe anlegen |
| `cleanup:legacy-friends` | alte Freitext-Friends entfernen |
| `cleanup:journey-ratings` | nicht mehr genutzte Ratings entfernen |
| `smoke` | End-to-End-Smoke gegen lokalen Dev (26 Steps nach `661bf86`) |

### 3.3 Tests
Einzige Test-Infrastruktur: [scripts/smoke.js](../../scripts/smoke.js) — Node-Skript, ruft Form-Actions per `fetch` gegen den Dev-Server. **Kein Unit-Test-Runner.** Kein `*.test.*` / `*.spec.*` im Projekt.

---

## 4. Einstiegspunkte und SSR-Boundary

### 4.1 Einstiegspunkte
- **HTML-Shell:** [src/app.html](../../src/app.html) — minimales SvelteKit-Template, `data-sveltekit-preload-data="hover"` aktiviert.
- **Globaler CSS-Einstieg:** [src/app.css](../../src/app.css) (importiert in [+layout.svelte](../../src/routes/+layout.svelte)).
- **Hook (server-only):** [src/hooks.server.js](../../src/hooks.server.js) — Auth-Setup + Session-Ladung + Auth-Redirect für nicht-`/login`/-`/share/*`-Routen.
- **Layout-Server-Load:** [src/routes/+layout.server.js](../../src/routes/+layout.server.js) — liefert `user` + `notifications` an alle Seiten.
- **Layout-View:** [src/routes/+layout.svelte](../../src/routes/+layout.svelte) — versteckt Navigation auf `/login`, `/share/*` und Event-Detail-Routen.
- Keine `hooks.client.js`.

### 4.2 SSR-Boundary
Der Server-only-Bereich ist konventionell angelegt:
- `src/lib/server/**` — alle Module, die Mongo / Auth anfassen.
- Per CLAUDE.md hard rule: **`$lib/server/**` darf nicht aus `.svelte` oder Client-`.js` importiert werden.** SvelteKit erzwingt das beim Build (Phase 2 verifiziert das via `npm run build`).

### 4.3 Authentifizierungs-Flow
Aus [hooks.server.js](../../src/hooks.server.js) + [auth.js](../../src/lib/server/auth.js):
1. `ensureAuthSetup()` (idempotent, nur beim ersten Request) erzeugt Indexe + Default-Accounts (`difrodar`, `dummy`).
2. Session-Cookie `triptales_session` (HttpOnly, SameSite=lax, secure in prod).
3. Tokens werden mit SHA-256 gehasht in DB abgelegt; Passwörter mit `scrypt` + Salt.
4. `event.locals.user` ist entweder `null` oder `{ id, username, avatarUrl }` (avatarUrl ist neu seit `661bf86`).
5. Routen ausser `/login` und `/share/*` redirecten Anonyme nach `/login?redirectTo=…`.
6. `/login` redirectet eingeloggte User auf `redirectTo` oder `/`.

---

## 5. Konventionen aus CLAUDE.md (relevant für Phase 2)

Aus [CLAUDE.md](../../CLAUDE.md) — werden in Phase 2 als Bug-Filter benutzt:
- Runes-Modus pflicht (kein `let foo` für State, kein `$:`).
- `bind:this` muss `let ref = $state()` sein (Svelte-5-Falle).
- Jede Repository-Query muss nach `userId` filtern (Ausnahme: shares.js für Public).
- Image-Uploads: 2 MB / Bild, max 5 / Doc, 9 MB total — Server-Truth in [shared.js](../../src/lib/server/repositories/shared.js).
- Avatar-Uploads: 1 MB Cap, JPG/PNG/WebP — Server-Truth in [auth.js](../../src/lib/server/auth.js) (neu).
- Dokument-Limit: 16 MB BSON — relevant für Avatar-Inline-Daten in `users.avatarUrl`.

---

## 6. Repository-Status zum Audit-Start

```
On branch main
HEAD: 661bf86 feat: notification bell, share-preview formats, profile avatar
Working tree: clean (vor Erzeugung dieses Reports)
```

Letzte Commits (siehe `git log -5`):
```
661bf86 feat: notification bell, share-preview formats, profile avatar
85aab0e QoL improvements and quickfixes from UX audit
cb47e0c Added Bewertungsraster
4c116fe Addition to previous commit (Change of ai-assistant)
d04ad8e Change of primary ai-assistant form codex to claude code
```

---

## 7. Ende Phase 1

**Keine Bewertungen, keine Empfehlungen.** Diese Datei ist ein reines Inventar.

Phase 2 (Bug-Audit) startet erst nach expliziter Freigabe und produziert `docs/audit/AUDIT_BUGS.md`.
