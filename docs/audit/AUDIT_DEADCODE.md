# AUDIT_DEADCODE.md — Phase 3 Dead-Code-Audit

> **STATUS (Stand 2026-05-30): abgeschlossen.** Historischer Audit-Stand bei Commit `661bf86`. Die identifizierten Dead-Code-Funde (D-01 bis D-04, u. a. `DashboardStats.svelte` sowie die ungenutzten Exporte `categoryMediaKeys`/`requireUser`) wurden entfernt; es verbleibt nur der harmlose SvelteKit-Konventions-Stub `src/lib/index.js` (D-05, optional löschbar). Dokument als Beleg der abgeschlossenen internen Code-Review-Phase erhalten (siehe README §5).

**Datum:** 2026-05-10
**Branch:** main @ `661bf86` (HEAD bei Audit-Start)
**Methodik:** systematischer `Grep`-Pass über `src/`, `scripts/`, `static/` für jede exportierte Funktion / Konstante / Komponente. Belegkette pro Eintrag.
**Falsche-Positive-Filter:** SvelteKit-Routendateien (`+page`, `+layout`, `+server`, `+error`), `static/`, `app.html`, `hooks.server.js`, Migrations-/Cleanup-Skripte unter `scripts/` mit npm-Script-Eintrag — werden **nicht** als Dead Code gemeldet, auch wenn keine Imports gefunden werden.

---

## Zusammenfassung — Konfidenz-Statistik

| Konfidenz | Anzahl |
|---|---:|
| 🟢 SICHER LÖSCHBAR | 4 |
| 🟡 WAHRSCHEINLICH LÖSCHBAR | 1 |
| 🔴 NICHT EIGENMÄCHTIG LÖSCHEN | 0 — alle suspekten Stellen geprüft, jede hat einen verifizierten Konsument |

**Befund:** Sehr saubere Codebasis. Keine `// TODO: remove`-Marker, keine `if (false)`-Branches, keine `.bak`/`.old`/`-copy`-Dateien, keine `@deprecated`-Annotationen, keine `console.log`-Reste, keine kommentierten Code-Blöcke. Migrations- und Cleanup-Skripte sind bewusst behalten und über npm-Scripts erreichbar.

---

## 🟢 SICHER LÖSCHBAR

### D-01 — Komponente `DashboardStats.svelte` ist nicht importiert

**Datei:** [src/lib/components/DashboardStats.svelte](../../src/lib/components/DashboardStats.svelte) (68 Zeilen, davon ~50 CSS)

**Belegkette:**
```
rg "DashboardStats" → 3 Treffer:
  • README.md:98          (Doku-Erwähnung in Komponentenliste — überholt)
  • docs/audit/AUDIT_RECON.md:136  (eigenes Inventar dieses Audits)
  • docs/legacy/codex_custom_instructions.md:256  (archiviert)
```

**Code-Referenzen:** **0** in `src/`, `scripts/`, `static/`. Kein `import DashboardStats`, kein `<DashboardStats />`, kein dynamischer Import.

**Gefahr-Faktor:** Keine. Komponente lebt rein als isolierte Datei.

**Vermutete Geschichte:** Vor Bewertungsraster-/UX-Audit wurden die Dashboard-Stats vermutlich auf `/profile` migriert ([profile/+page.svelte:49-57](../../src/routes/profile/+page.svelte#L49-L57) zeigt eine eigene `stats-grid`-Implementierung), und die alte `DashboardStats.svelte` wurde nie entfernt.

**Empfehlung:**
1. `rm src/lib/components/DashboardStats.svelte`
2. README.md:98 Komponentenliste anpassen (Eintrag entfernen).

---

### D-02 — Export `categoryMediaKeys` in `media.js` hat keinen Konsument

**Datei:** [src/lib/media.js:212](../../src/lib/media.js#L212)
```js
export const categoryMediaKeys = Object.keys(categoryMedia);
```

**Belegkette:**
```
rg "categoryMediaKeys" → 1 Treffer (nur die Definition selbst).
0 Treffer in: src/, scripts/, static/.
```

**Gefahr-Faktor:** Keine. Konstante ist eine reine Helper-Liste, niemand liest sie.

**Empfehlung:** `export `-Keyword entfernen, optional die Konstante komplett löschen wenn auch intern unbenutzt (intern ist sie ebenfalls unbenutzt — `Object.keys(categoryMedia)` wird nirgends verwendet).

---

### D-03 — Export `requireUser` in `auth.js` hat keinen Konsument

**Datei:** [src/lib/server/auth.js:191-194](../../src/lib/server/auth.js#L191-L194)
```js
export function requireUser(locals) {
    if (!locals.user) throw redirect(303, "/login");
    return locals.user;
}
```

**Belegkette:**
```
rg "requireUser" → 1 Treffer (nur die Definition selbst).
0 Treffer in: src/, scripts/.
```

**Gefahr-Faktor:** Keine. Auth-Redirect läuft global im `handle()`-Hook ([hooks.server.js:13-15](../../src/hooks.server.js#L13-L15)) — alle nicht-öffentlichen Routen werden dort schon redirectet, bevor ein Server-Load oder eine Form-Action `requireUser` aufrufen könnten. Die Funktion ist eine Redundanz aus einer früheren Auth-Architektur.

**Empfehlung:** Funktion komplett löschen (4 Zeilen + leere Zeile davor).

---

### D-04 — Export `eventMedia` in `media.js` ist nur intern referenziert

**Datei:** [src/lib/media.js:214-224](../../src/lib/media.js#L214-L224)

**Belegkette:**
```
rg "eventMedia\b" → 2 Treffer:
  • media.js:214  (Definition mit `export`)
  • media.js:258  (interne Verwendung in resolveEventMedia)
```

0 externe Konsumenten in `src/`, `scripts/`. Das `export`-Keyword ist redundant.

**Gefahr-Faktor:** Keine — die Konstante bleibt, nur das `export` fällt weg.

**Empfehlung:** `export const eventMedia` → `const eventMedia` (Keyword `export` entfernen).

---

## 🟡 WAHRSCHEINLICH LÖSCHBAR

### D-05 — `src/lib/index.js` ist ein leerer SvelteKit-Template-Stub

**Datei:** [src/lib/index.js](../../src/lib/index.js)
```js
// place files you want to import through the `$lib` alias in this folder.
```

**Belegkette:**
```
rg '\$lib['"]' src → 0 Treffer (kein Code macht `import "..."` from `$lib` selbst — alle imports gehen via Subpfad wie `$lib/components/...`, `$lib/utils/...`, `$lib/server/...`).
```

**Gefahr-Faktor:**
- ❓ SvelteKit-Konvention: Das Template legt `src/lib/index.js` automatisch an. Es ist **nicht** Pflicht für SvelteKit, dass diese Datei existiert — `$lib` ist nur ein Path-Alias auf `src/lib/`. Trotzdem könnte ein zukünftiger `svelte-kit sync` oder `prepare`-Hook den File neu erzeugen.
- ❓ Stylistische Wahl: viele SvelteKit-Repos behalten den Stub als "place to register lib root exports later".

**Verifikation des Risikos**:
- Manueller Test: `rm src/lib/index.js && npm run build` würde zeigen ob es bricht. Wurde im Audit **nicht** ausgeführt (read-only).
- Aus der Beobachtung anderer SvelteKit-2.x-Projekte: Löschen ist sicher.

**Empfehlung:** Niedrigste Priorität. Wenn Aufräumung gewünscht, vor Delete einmal `npm run build && npm run smoke` als Sanity-Check, dann löschen. Wenn behalten als Convention-Marker — auch OK.

---

## Geprüft, NICHT als Dead Code eingestuft

Damit der Report transparent ist, hier die Stellen, die ich aktiv untersucht und mit Verwendung verifiziert habe (also **keine** Dead-Code-Befunde):

### Komponenten (alle 17 in `src/lib/components/` ausser DashboardStats)

| Komponente | Erste verifizierte Verwendung |
|---|---|
| Avatar | [Navigation.svelte:34](../../src/lib/components/Navigation.svelte#L34), [profile/+page.svelte:44](../../src/routes/profile/+page.svelte#L44) |
| CityCombobox | [EventForm.svelte:255](../../src/lib/components/EventForm.svelte#L255), [ideas/+page.svelte:36](../../src/routes/ideas/+page.svelte#L36) |
| DeleteRecurringDialog | [events/[id]/+page.svelte:58](../../src/routes/events/%5Bid%5D/+page.svelte#L58) |
| EventCard | [events/+page.svelte:87](../../src/routes/events/+page.svelte#L87) |
| EventForm | [events/[id]/+page.svelte:208](../../src/routes/events/%5Bid%5D/+page.svelte#L208), [events/new/+page.svelte:20](../../src/routes/events/new/+page.svelte#L20) |
| EventMapPanel | [events/[id]/+page.svelte:199](../../src/routes/events/%5Bid%5D/+page.svelte#L199) |
| FriendPicker | [EventForm.svelte:314](../../src/lib/components/EventForm.svelte#L314) |
| JourneyCard | [+page.svelte:154](../../src/routes/+page.svelte#L154), [journey/+page.svelte:201](../../src/routes/journey/+page.svelte#L201) |
| LeafletMapView | [map/+page.svelte:83](../../src/routes/map/+page.svelte#L83), [trips/[id]/+page.svelte:91](../../src/routes/trips/%5Bid%5D/+page.svelte#L91) |
| LocationPinGrid | [LeafletMapView.svelte:139](../../src/lib/components/LeafletMapView.svelte#L139) |
| MemoryForm | [events/[id]/+page.svelte:215](../../src/routes/events/%5Bid%5D/+page.svelte#L215) |
| Navigation | [+layout.svelte:20](../../src/routes/+layout.svelte#L20) |
| NotificationBell | [Navigation.svelte:31](../../src/lib/components/Navigation.svelte#L31) |
| PlaceholderIcon | EventCard, EventMapPanel, JourneyCard, LocationPinGrid, SharePreview, share/[hash]/+page.svelte, events/[id]/+page.svelte (7 Konsumenten) |
| SharePreview | [events/[id]/+page.svelte:231](../../src/routes/events/%5Bid%5D/+page.svelte#L231) |
| TravelIdeaCard | [ideas/+page.svelte:64](../../src/routes/ideas/+page.svelte#L64) |

### Konstanten (`src/lib/constants.js`)

| Export | Konsument |
|---|---|
| `categories` | [EventForm.svelte:135](../../src/lib/components/EventForm.svelte#L135), [ideas/+page.server.js:2](../../src/routes/ideas/+page.server.js#L2) |
| `repeatFrequencies` | [EventForm.svelte:179](../../src/lib/components/EventForm.svelte#L179) — Array `{value, label}` (NICHT verwechseln mit `repeatFrequencies` Set in shared.js, separater Export) |
| `priorities` | [ideas/+page.server.js:2](../../src/routes/ideas/+page.server.js#L2), [ideas/+page.svelte:48](../../src/routes/ideas/+page.svelte#L48) |
| `statusLabels` | [EventCard.svelte:7](../../src/lib/components/EventCard.svelte#L7) |
| `UPLOAD_MAX_BYTES` | EventForm, MemoryForm |
| `UPLOAD_MAX_IMAGES` | EventForm, MemoryForm |
| `UPLOAD_MAX_TOTAL_BYTES` | EventForm, MemoryForm |
| `UPLOAD_ALLOWED_MIME_TYPES` | EventForm, MemoryForm |

### Media (`src/lib/media.js`)

| Export | Konsument |
|---|---|
| `locationMedia` | media.js intern + ideas.js |
| `categoryMedia` | media.js intern + login/+page.svelte:5 |
| `categoryMediaKeys` | **❌ siehe D-02** |
| `eventMedia` | nur media.js intern → **❌ siehe D-04** (Export-Keyword überflüssig) |
| `resolveLocationMedia` | seed.js, ideas.js |
| `resolveEventMedia` | media.js intern (nicht extern) — aber `storedEventMedia` ruft es auf, also der Konsument ist `storedEventMedia`, der extern verwendet wird. Indirekt erreichbar ✓ |
| `storedLocationMedia` | events.js |
| `storedEventMedia` | events.js |

### Cities (`src/lib/cities.js`)

| Export | Konsument |
|---|---|
| `worldCities` | cities.js intern (`searchCities`, `findCityCoordinates`) |
| `cityLabel` | CityCombobox + cities.js intern |
| `searchCities` | CityCombobox |
| `findCityCoordinates` | scripts/normalize-city-coordinates.js, repositories/ideas.js, repositories/shared.js |

### Utils

| Export | Konsument |
|---|---|
| `rememberFilters` | events/+page.svelte, journey/+page.svelte, map/+page.svelte |
| `clearRememberedFilters` | events/+page.svelte, journey/+page.svelte, map/+page.svelte |
| `formatEventDate` | events/[id]/+page.svelte (via `buildGallery`-Datei) |
| `buildGallery` | events/[id]/+page.svelte |
| `buildShareText` | SharePreview.svelte |

### Auth (`src/lib/server/auth.js`)

| Export | Konsument |
|---|---|
| `ensureAuthSetup` | hooks.server.js |
| `updateUserAvatar` | profile/+page.server.js |
| `removeUserAvatar` | profile/+page.server.js |
| `signup` | login/+page.server.js |
| `login` | login/+page.server.js |
| `createSession` | login/+page.server.js |
| `getUserFromSession` | hooks.server.js |
| `deleteSession` | logout/+server.js |
| `setSessionCookie` | login/+page.server.js |
| `clearSessionCookie` | logout/+server.js |
| `getSessionCookie` | hooks.server.js, logout/+server.js |
| `requireUser` | **❌ siehe D-03** |

### Server-Repositories

Alle 36 exportierten Funktionen aus `repositories/{events,ideas,journey,seed,shared,shares,trips}.js` sind via `repository.js`-Barrel re-exportiert (siehe Phase 2 Verifikation) und in mindestens einem `+page.server.js`/`+server.js`/Schwester-Repository konsumiert. Der Barrel erschwert die Auto-Detection — aber jeder einzelne wurde manuell verifiziert.

### Skripte (`scripts/`)

Alle 9 Skripte sind in [package.json:scripts](../../package.json) registriert:

| Skript | npm-Script | Status |
|---|---|---|
| seed.js | `npm run seed` | aktiv genutzt |
| upsert-sample-events.js | `npm run upsert:samples` | aktiv genutzt |
| normalize-converted-idea-media.js | `npm run normalize:idea-media` | one-time-Migration; bewusst behalten als idempotent |
| normalize-city-coordinates.js | `npm run normalize:city-coordinates` | dito |
| normalize-multi-image.js | `npm run normalize:multi-image` | dito |
| migrate-trips.js | `npm run migrate:trips` | dito |
| cleanup-legacy-friends.js | `npm run cleanup:legacy-friends` | dito |
| cleanup-journey-ratings.js | `npm run cleanup:journey-ratings` | dito |
| smoke.js | `npm run smoke` | aktiv genutzt |

→ **Keiner ist Dead Code.** Auch wenn z. B. `migrate-trips.js` nach erfolgreichem Lauf nie wieder gebraucht wird, sind solche Skripte als Audit-Trail und für Re-Deploys auf neue Mongo-Instanzen sinnvoll.

### Assets (`static/`, `src/lib/assets/`)

| Asset | Konsument |
|---|---|
| `static/robots.txt` | runtime-served via SvelteKit, kein Code-Import nötig ✓ |
| `src/lib/assets/favicon.svg` | [+layout.svelte:2](../../src/routes/+layout.svelte#L2) ✓ |

→ **Keine ungenutzten Assets.**

### Legacy-Schema-Cleanup (kein Dead Code)

Die folgenden Stellen sind **kein** Dead Code, sondern bewusste Migrations-Hilfen für Mongo-Dokumente, die das alte Schema noch tragen können:

- [events.js:315](../../src/lib/server/repositories/events.js#L315) — `$unset: { friendIds, imageUrl, imageAlt, ... }` bei jedem Event-Update entfernt das alte (vor-Multi-Image- + vor-Friends-Refactor) Schema, falls es noch im Doc steckt.
- [events.js:393](../../src/lib/server/repositories/events.js#L393) — `$unset: { imageUrl, imageAlt }` bei Memory-Save für gleiche Migration.

Dokumentiert werden sollte das (ist es teilweise in CLAUDE.md). Code bleibt bestehen.

---

## Bemerkungen zum Code-Hygiene-Stand

- **Keine `// TODO: remove`-Marker**, keine `// deprecated`-Kommentare, keine `// HACK:`/`// FIXME:`-Reste in `src/`. ✓
- **Keine `if (false)`-Branches**, keine ESLint-Disable-Direktiven, keine `@ts-ignore`. ✓
- **Keine `.bak`/`.old`/`*-copy`/`*_unused`-Dateien** im Repo. ✓
- **Keine `console.log`/`console.error`** in `src/`. ✓ (in Phase 2 verifiziert)

---

## Empfohlene Aktionen (Phase-4-Vorschlag)

Wenn der Benutzer die 🟢-Befunde freigibt, schlage ich folgende **vier separate Commits** vor (per CLAUDE.md *"ein Fix pro Commit-würdiger Einheit"*):

1. **D-01**: `chore: remove unused DashboardStats component` — `git rm src/lib/components/DashboardStats.svelte` + README §3.4.2 Komponentenliste anpassen.
2. **D-02 + D-04 zusammen**: `chore: remove unused exports from media.js` — beide betreffen dieselbe Datei und sind triviale Mikroänderungen, sinnvoll bündeln.
3. **D-03**: `chore: remove unused requireUser helper from auth.js`.
4. **D-05** *optional*: nur wenn Sanity-Check `npm run build && npm run smoke` nach Delete grün ist.

Nach jedem Commit:
- `npm run build` → muss clean bleiben
- `npm run smoke` → muss grün bleiben
- Kurze Changelog-Notiz im Commit-Body.

---

## Ende Phase 3

Drei Berichte stehen jetzt:
- [docs/audit/AUDIT_RECON.md](AUDIT_RECON.md)
- [docs/audit/AUDIT_BUGS.md](AUDIT_BUGS.md)
- [docs/audit/AUDIT_DEADCODE.md](AUDIT_DEADCODE.md)

Phase 4 (Fixes) startet erst nach **expliziter Freigabe und einer konkreten Bug-/Deadcode-ID-Liste** vom Benutzer.
