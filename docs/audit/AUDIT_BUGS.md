# AUDIT_BUGS.md — Phase 2 Bug-Audit

**Datum:** 2026-05-10
**Branch:** main @ `661bf86` (HEAD bei Audit-Start)
**Scope:** alle `src/**/*.svelte`, `src/**/*.js`, `scripts/smoke.js`, Auth, Hooks, Form-Actions
**Methodik:** systematischer Grep-Pass (Patterns) + manuelles Lesen kritischer Module + Cross-Reference mit CLAUDE.md hard rules.
**Status der Bewertung:** jede gemeldete Stelle ist mit `VERIFIZIERT` oder `VERMUTUNG` markiert. Vermutungen haben eine konkrete Begründung, warum keine Verifikation möglich war.

---

## Zusammenfassung — Kategorien-Statistik

| Schweregrad | Anzahl |
|---|---:|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 5 |
| LOW | 7 |
| NIT / INFO | 5 |

**Wichtig:** Diese Statistik bedeutet nicht, dass das Projekt fehlerfrei ist — sie reflektiert nur, was beim manuellen Audit ohne `svelte-check`-Lauf gefunden wurde. Phase 2 wurde **ohne** statische Analyse-Tools durchgeführt (siehe Anhang A).

---

## MEDIUM

### [MEDIUM] B-01 — `bind:this` ohne `$state()` (3 Stellen)

**Status:** VERIFIZIERT
**Dateien:**
- [src/routes/events/+page.svelte:6](../../src/routes/events/+page.svelte#L6) — `let filterForm;`
- [src/routes/journey/+page.svelte:7](../../src/routes/journey/+page.svelte#L7) — `let filterForm;`
- [src/routes/map/+page.svelte:6](../../src/routes/map/+page.svelte#L6) — `let filterForm;`

**Problem:** Im Svelte-5-runes-Modus muss eine via `bind:this` gebundene Variable als `$state()` deklariert sein, sonst wird Reaktivität nicht korrekt aufgebaut. Der Compiler emittiert die Warnung `panelRef` is updated, but is not declared with $state(...) (selbe Klasse wie der Fund den ich beim Schreiben von `NotificationBell` gefixt habe — siehe Build-Log Phase 4 von `661bf86`).

Aktuell verwenden die drei Routes `filterForm` ausschliesslich in einer Event-Handler-Funktion (`filterForm?.requestSubmit()`), nicht in `$derived`/`$effect`/Template — daher gibt es **keine sichtbare Funktionseinbusse**. Aber:
- der Compiler warnt beim Build,
- jeder zukünftige Refactor, der `filterForm` in einem reaktiven Kontext verwendet, würde stillschweigend brechen,
- es widerspricht der "Runes only"-Regel aus CLAUDE.md.

**Repro:** `npm run build` → Console zeigt `Warning: ... is not declared with $state(...)`.

**Fix-Vorschlag:** `let filterForm = $state();` in allen drei Dateien. Identische Lösung wie in [NotificationBell.svelte:7-8](../../src/lib/components/NotificationBell.svelte#L7-L8).

---

### [MEDIUM] B-02 — A11y: `DeleteRecurringDialog` ohne Escape-Key und Focus-Management

**Status:** VERIFIZIERT
**Datei:** [src/lib/components/DeleteRecurringDialog.svelte:11-42](../../src/lib/components/DeleteRecurringDialog.svelte#L11-L42)

**Problem:** Der Dialog hat `role="dialog"` und `aria-modal="true"`, aber:
1. **Keine Escape-Behandlung** — User kann ESC drücken, der Dialog schliesst nicht. WAI-ARIA Authoring Practices verlangen das für `aria-modal=true`.
2. **Kein Focus-Trap** — Tab-Navigation kann den Dialog verlassen.
3. **Kein Focus-Restore** — beim Öffnen wird Focus nicht in den Dialog verschoben, beim Schliessen nicht zurückgesetzt.

Die einzige Schliess-Möglichkeit ist Click auf Backdrop oder den "Cancel"-Button. Tastatur-Nutzer:innen haben keinen Weg ausser Tabbing zum Cancel-Button.

**Repro:** `/events/[id]` mit Recurrence-Event öffnen, "Delete event or series" klicken, ESC drücken — Dialog bleibt offen.

**Fix-Vorschlag:** `$effect` mit `keydown`-Listener auf `document` solange `open` true (analog NotificationBell-Pattern), Focus auf ersten Radio-Button beim Öffnen, Focus zurück auf Trigger beim Schliessen. Optional Focus-Trap via tabbable-Liste.

---

### [MEDIUM] B-03 — `searchTimer` ohne `$state()` (Konsistenz mit B-01)

**Status:** VERIFIZIERT
**Dateien:**
- [src/routes/events/+page.svelte:7](../../src/routes/events/+page.svelte#L7)
- [src/routes/journey/+page.svelte:8](../../src/routes/journey/+page.svelte#L8)

**Problem:** `let searchTimer;` ohne `$state`. Wird nur in `setTimeout`/`clearTimeout` benutzt — **kein** funktionaler Bug, aber dieselbe runes-Verletzung wie B-01. Der Compiler gibt wahrscheinlich keine Warnung, weil die Variable nicht reaktiv konsumiert wird.

**Schweregrad** trotzdem MEDIUM, weil:
- konsistent mit B-01 zu fixen ist,
- bei zukünftiger Verwendung in `$effect`-Cleanup (z. B. Component-Unmount-Cleanup) silently broken wäre.

**Repro:** Code-Review.

**Fix-Vorschlag:** Eigentlich ist das ein anderer Befund — Timer-IDs brauchen kein `$state`, weil sie nicht reaktiv sind. Korrekter Fix: explizite Cleanup-Funktion via `onDestroy` oder `$effect`-Return, nicht `$state`. Beispiel:
```js
let searchTimer = 0;
$effect(() => () => clearTimeout(searchTimer));
```
Aktuell gibt es **keinen Cleanup beim Component-Unmount** — wenn der User während des 350-ms-Debounce zu einer anderen Route navigiert, feuert `submitFilters` nach Unmount und versucht ein detached Form-Element zu submitten (silent no-op via `?.requestSubmit()`). LOW Auswirkung, aber richtige Lösung.

---

### [MEDIUM] B-04 — Server-side Validation lückenhaft in `validateEventForm`

**Status:** VERIFIZIERT
**Datei:** [src/lib/server/repositories/events.js:168-200](../../src/lib/server/repositories/events.js#L168-L200)

**Problem:** Die Funktion validiert nur:
- Pflichtfelder (title, date, time, locationName, category)
- `repeatFrequency` gegen Whitelist
- `repeatCount` numerisch & 1..52

**Nicht validiert (Server-side):**
- **Datums-Format**: `clean(form.get("date"))` wird ungeprüft als String gespeichert. Ein manipuliertes Form mit `date="abc"` würde "abc" in `events.date` schreiben. Filter und Sort über `localeCompare` behandeln das ungewollt.
- **Time-Format**: dito für `time`.
- **`status`-Whitelist**: `eventPayloadFromForm` ([events.js:265](../../src/lib/server/repositories/events.js#L265)) erzwingt zwar `"completed"`/`"planned"`, das ist OK.
- **`category`-Whitelist**: keine Prüfung gegen `categories` aus `constants.js`.
- **`lat`/`lng`-Ranges**: -90..90 / -180..180 nicht geprüft (defaultCoordinates fängt invalide Werte teilweise ab, aber nicht systematisch).

Browser-side Forms (`<input type="date">`, `<select>`) reduzieren das Risiko in der Praxis. Aber bei direkten POST-Requests an Form-Actions (Smoke-Test, Curl, Postman) gibt es keinen Schutz.

**Repro:** `curl -X POST /events/new?/create -F "title=Bad" -F "date=abc" -F "time=99:99" ...` — würde durchgelassen, korrumpiert dann Filter/Sort.

**Fix-Vorschlag:** `validateEventForm` um Format-Regex erweitern (`^\d{4}-\d{2}-\d{2}$`, `^\d{2}:\d{2}$`), `category`-Whitelist gegen `categories` aus `constants.js` prüfen. Lat/Lng nur durch numeric-coercion-Bereich.

---

### [MEDIUM] B-05 — Cross-User-Datalöschung beim Event-Delete

**Status:** VERIFIZIERT
**Datei:** [src/lib/server/repositories/events.js:331-333](../../src/lib/server/repositories/events.js#L331-L333) (`deleteEvent`)

**Problem:**
```js
await collections.journeyEntries.deleteMany({ eventId });
```
löscht **alle** Journey-Einträge zu diesem Event, nicht nur die des Owners. Wenn User A ein Event löscht, an dem User B als invited-User eine eigene Memory gespeichert hat (`completeEventFromForm` legt B's `journeyEntries`-Doc mit `userId: B, eventId: X` an), wird B's Memory ebenfalls gelöscht.

Das verletzt CLAUDE.md hard rule *"Every repository query scopes by userId"*. Der `deleteMany` hat keinen `userId`-Filter.

**Bewertung:** Semantisch nachvollziehbar (Event ist weg, dangling Memories sind orphans), aber die Konsequenz ist nicht offensichtlich für den Owner und nicht kommuniziert für den Invitee. Kein Smoke-Test deckt diesen Pfad ab.

**Repro:** Owner A invitet B; Event findet statt; A markiert als `completed`; B speichert eigene Memory; A löscht Event → B's Memory weg, B sieht das in `/journey` ohne Vorwarnung.

**Fix-Vorschlag (mehrere Optionen):**
1. **Strikt**: `journeyEntries.deleteMany({ eventId, userId: ownerId })` — B's Memory bleibt als Orphan, hängt aber an gelöschtem Event-ID.
2. **Pragmatisch (aktuell)**: Keine Änderung, aber explizit dokumentieren in CLAUDE.md / README, dass Event-Delete fremde Memories mitlöscht.
3. **UX-bewusst**: Vor Delete prüfen ob `journeyEntries.countDocuments({ eventId, userId: { $ne: ownerId } }) > 0` und Owner explizit warnen.

Empfehlung: **(2)** als kurzfristig, **(3)** als sauber.

---

## LOW

### [LOW] B-06 — Race Condition in `CityCombobox` `onblur`-Schliessen

**Status:** VERIFIZIERT (per Code-Review verifiziert; konkrete Reproduzierbarkeit auf langsamen Geräten VERMUTUNG)
**Datei:** [src/lib/components/CityCombobox.svelte:62](../../src/lib/components/CityCombobox.svelte#L62)

**Problem:**
```svelte
onblur={() => setTimeout(() => (open = false), 140)}
```
Bei sehr langsamen Geräten oder Touch-Verzögerung kann das 140-ms-Timeout **vor** dem `onclick` der Menü-Option feuern. Wenn `open = false` zuerst läuft, unmountet das Menü, der Click wird gegen ein detachedes Element gesendet und `chooseCity` wird nie aufgerufen.

**Repro (VERMUTUNG):** auf einem langsamen Mobil-Browser oder mit DevTools "CPU 6× slowdown" testen, schnell auf eine Stadt-Option tippen.

**Verifizierung warum nicht 100%:** Auf Desktop mit normaler Geschwindigkeit ist das Timing zuverlässig (Click vor 140 ms). Manuelle Reproduktion auf langsamem Gerät war im Audit nicht möglich.

**Fix-Vorschlag:** Statt `onblur+setTimeout`, in den Menü-Buttons `onmousedown="event.preventDefault()"` setzen (verhindert blur), oder Selection via `pointerdown` statt `click`.

---

### [LOW] B-07 — Kein Cleanup für `searchTimer` bei Component-Unmount

**Status:** VERIFIZIERT
**Dateien:** events/+page.svelte, journey/+page.svelte (Zeilen wie in B-03)

**Problem:** Wenn der User während des Debounce (350 ms) zur nächsten Route navigiert, feuert `submitFilters()` nach Unmount. `filterForm` ist dann nicht mehr im DOM. `filterForm?.requestSubmit()` gibt undefined-call-no-op (kein Crash dank optional chaining). **Keine sichtbaren Effekte.** Aber best-practice: explizit cancel.

Siehe auch B-03 (verwandt, identischer Fix).

**Fix-Vorschlag:** `$effect(() => () => clearTimeout(searchTimer));` in beiden Routes.

---

### [LOW] B-08 — Login ohne Rate-Limit / Brute-Force-Schutz

**Status:** VERIFIZIERT
**Datei:** [src/routes/login/+page.server.js:15-21](../../src/routes/login/+page.server.js#L15-L21), [auth.js:133-140](../../src/lib/server/auth.js#L133-L140)

**Problem:** `login` action akzeptiert beliebig viele Versuche pro IP/Account. Default-Accounts (`difrodar/difrodar`, `dummy/dummy`) sind dokumentiert in CLAUDE.md und im Smoke-Test sichtbar. Brute-Force gegen diese ist trivial.

**Bewertung:** Für Prototyp-Demo dokumentiert akzeptabel. Vor Produktion zwingend zu fixen.

**Fix-Vorschlag:** `failedLoginAttempts` Collection mit `userId` + `attemptedAt` + IP, ab 5 Failures/15min sperren. Alternativ: SvelteKit-Adapter-Layer Rate-Limit (Netlify Edge Functions o. ä.).

---

### [LOW] B-09 — MIME-Type-Validation nur per `file.type` (browser-reported)

**Status:** VERIFIZIERT
**Dateien:**
- [src/lib/server/auth.js:84-89](../../src/lib/server/auth.js#L84-L89) (Avatar)
- [src/lib/server/repositories/shared.js:275-282](../../src/lib/server/repositories/shared.js#L275-L282) (Event-/Memory-Bilder)

**Problem:** `file.type` ist die vom Browser/Client gemeldete MIME — nicht vertrauenswürdig. Ein Angreifer kann arbiträre Binärdaten als `image/png` deklarieren.

**Auswirkung:**
- Kein RCE-Risiko (Daten werden als base64-Data-URL inline gespeichert, niemals ausgeführt).
- Kein XSS (Browser rendert `<img src="data:image/png;base64,...">` und scheitert silent bei invaliden Daten).
- **DB-Bloat / Daten-Integrität**: Nutzlose Binärdaten würden gespeichert.

**Bewertung:** LOW weil nicht ausnutzbar; aber best-practice ist Magic-Byte-Verifizierung (Binär-Header prüfen).

**Fix-Vorschlag:** Erste 8 Bytes lesen und gegen Signaturen für PNG/JPG/WebP prüfen. Z. B. Library `file-type` (eine Dep, OK weil security-relevant). Oder einfacher: Inline-Check der bekannten Magic-Bytes:
- PNG: `89 50 4E 47 0D 0A 1A 0A`
- JPEG: `FF D8 FF`
- WebP: `52 49 46 46 ?? ?? ?? ?? 57 45 42 50`

---

### [LOW] B-10 — `events.js:283-298` Recurrence: Bilder werden N-fach gespeichert

**Status:** VERIFIZIERT
**Datei:** [src/lib/server/repositories/events.js:281-298](../../src/lib/server/repositories/events.js#L281-L298)

**Problem:** Beim Erzeugen einer Recurrence (count=14) wird `imageFields` einmal aus dem Form geparst und dann `Array.from({length: 14})` mit dem identischen `imageFields` gefüllt. Das Resultat: 14 events × bis zu 5 Bilder × bis zu 2 MB = bis zu **140 MB DB-Volumen** für eine einzige Wochenserie mit Bildern.

Der CLAUDE.md hard limit für ein Doc ist 16 MB BSON. Pro Doc bleibt das im Limit (5 × 2 MB = 10 MB), aber die Gesamt-DB-Belastung ist hoch.

**Auswirkung:** DB-Bloat. Jede Bearbeitung des Bildes muss in 14 Docs propagieren.

**Repro:** Wöchentliche Lecture-Serie für 14 Wochen anlegen mit 3 Cover-Fotos → DB sieht 14 Kopien.

**Fix-Vorschlag:** Bilder in einer separaten Collection (`mediaAssets`) speichern und per `mediaAssetIds: [...]` referenzieren. Oder: Bilder nur am ersten Event-Doc speichern, andere referenzieren via `recurrenceGroupId`.

**Bewertung:** Architektur-Refactor, nicht trivial. Für Prototyp akzeptabel; flag für Skalierung.

---

### [LOW] B-11 — ICS-Export hardcodiert auf 2 h Dauer

**Status:** VERIFIZIERT
**Datei:** [src/routes/events/[id]/ics/+server.js:26](../../src/routes/events/[id]/ics/+server.js#L26)

**Problem:** `dtEnd = toDateTimeStamp(event.date, event.time, 2)` setzt die Event-Dauer fix auf 2 Stunden. TripTales speichert keine Endzeit, deswegen ist das ein bewusster Default.

**Auswirkung:** Kalender-Apps zeigen jeden Event als 2-h-Block, auch wenn es ein All-Day-Event oder ein 8-h-Workshop sein sollte.

**Fix-Vorschlag:** Event-Schema um optionales `endTime` oder `durationMinutes` erweitern. Aufwand: M. Für Prototyp NIT.

---

### [LOW] B-12 — Avatar inline-Daten-URL in jeder Layout-Response

**Status:** VERIFIZIERT (von mir selbst beim Schreiben in 661bf86 dokumentiert)
**Datei:** [src/routes/+layout.server.js](../../src/routes/+layout.server.js), [src/lib/server/auth.js:18-20](../../src/lib/server/auth.js#L18-L20)

**Problem:** `publicUser()` liefert `avatarUrl` als komplette base64-Data-URL (bis zu ~1.3 MB nach Encoding) bei jeder authentifizierten Page-Response. Auch wenn der Avatar gecached ist im Browser, der HTML-/JSON-Payload trägt ihn jedes Mal.

**Auswirkung:** Vergrösserung jeder authed Layout-Response um den Avatar-Volumen. Spürbar bei langsamer Bandbreite / mobile.

**Fix-Vorschlag:** Avatar via separaten Endpoint `/avatar/[userId].png` mit `Cache-Control: public, max-age=...` und `ETag`. SvelteKit `+server.js` Route, auf `users.avatarUrl` getriggert.

**Aufwand:** M. Bewertung: für Prototyp NIT, dokumentiert. Vor produktiver Nutzung sinnvoll.

---

## NIT / INFO

### [NIT] B-13 — Default-Accounts haben triviale Passwörter

**Status:** VERIFIZIERT
**Datei:** [src/lib/server/auth.js:62-63](../../src/lib/server/auth.js#L62-L63)

```js
const difrodar = await ensureUser("difrodar", "difrodar");
await ensureUser("dummy", "dummy");
```

**Bewertung:** Dokumentiertes Prototyp-Verhalten in [README §3.4.2](../../README.md). Im Smoke-Test wird `dummy/dummy` benutzt. Vor Produktion: zwingend zu wechseln. Im Audit-Kontext: kein Bug, aber notiert.

---

### [NIT] B-14 — Inkonsistente userId→ObjectId-Konvertierung in `auth.js`

**Status:** VERIFIZIERT
**Datei:** [src/lib/server/auth.js:94, 103, 148, 163](../../src/lib/server/auth.js)

**Problem:** Auth-Funktionen verwenden `ObjectId.isValid(userId) ? new ObjectId(userId) : userId`, während Repositories `userOid()` aus [shared.js:46-52](../../src/lib/server/repositories/shared.js#L46-L52) verwenden. `userOid` ist robuster (handles `{id}`, `{_id}`, throws bei Invalid).

**Auswirkung:** Reine Inkonsistenz, kein funktionaler Unterschied bei aktuellem Aufruf-Pattern.

**Fix-Vorschlag:** `auth.js` darf `userOid` aus `shared.js` importieren — wäre aber ein cross-module-Import (auth → repositories/shared). Cleaner: lokal in auth.js eine kleine `userOid`-Variante. Niedrige Priorität.

---

### [NIT] B-15 — `convertIdeaToEvent` nutzt UTC-Datum für "in 7 Tagen"

**Status:** VERIFIZIERT
**Datei:** [src/lib/server/repositories/ideas.js:61](../../src/lib/server/repositories/ideas.js#L61)

```js
form.set("date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
```

**Problem:** `.toISOString().slice(0, 10)` gibt UTC-Datum, nicht Server-Lokalzeit. Wenn der Server in UTC läuft (typisch für Netlify), passt es. Wenn ein User um 23:00 lokal MEZ konvertiert, sieht er als "+7 Tage" möglicherweise einen Tag mehr als erwartet (wegen UTC-Tag-Roll).

**Auswirkung:** Off-by-one im "in 7 Tagen" Default.

**Fix-Vorschlag:** Akzeptabel für Prototyp. Cleaner: dieselbe `todayString()`-Helper aus events.js verwenden.

---

### [NIT] B-16 — Smoke-Test deckt UI-Verhalten der Notification-Bell und Share-Toggle nicht ab

**Status:** VERIFIZIERT
**Datei:** [scripts/smoke.js](../../scripts/smoke.js)

**Problem:** Smoke-Test prüft nur Marker-Strings (`data-notification-bell`, `Preview format`) im HTML. Folgendes wird NICHT getestet:
- Bell-Badge-Count bei tatsächlichen Invitations
- Bell-Dropdown-A11y (Tab/Arrow-Keys)
- Format-Toggle-Wechsel (Postcard/Story/Square)
- Web-Share API / Clipboard-Fallback
- Avatar-Letter-Variant Rendering (Smoke testet nur `avatar-image` mit Upload)

Ohne Browser-Test (Playwright o. ä.) ist das nicht trivial nachzubauen. **Coverage-Notiz, kein Bug.**

**Fix-Vorschlag:** Wenn Test-Coverage erweitert werden soll: Playwright minimal-Setup für 3-5 Smoke-Klicks. Aufwand: M. Für Prototyp dokumentiert akzeptabel.

---

### [NIT] B-17 — `default country = "USA"` in mehreren Modulen

**Status:** VERIFIZIERT
**Dateien:**
- [src/lib/server/repositories/events.js:227](../../src/lib/server/repositories/events.js#L227) (`saveLocationFromForm`)
- [src/lib/server/repositories/ideas.js:33, 66](../../src/lib/server/repositories/ideas.js)
- [src/lib/components/CityCombobox.svelte:6](../../src/lib/components/CityCombobox.svelte#L6) (default prop)

**Problem:** Hardcodiertes `"USA"` als Default-Country wird an mehreren Stellen wiederholt. Wenn der Default geändert werden soll, müssen 3+ Stellen aktualisiert werden.

**Bewertung:** Dokumentiert in CLAUDE.md (San Diego context). Code-Health-NIT, kein Bug.

**Fix-Vorschlag:** `DEFAULT_COUNTRY = "USA"` in `constants.js` exportieren.

---

## Verifizierte Nicht-Befunde (kein Bug)

Damit der Report transparent ist, hier eine Liste, was geprüft und **nicht** als Bug eingestuft wurde:

| Pattern | Treffer | Bewertung |
|---|---|---|
| `$:` Reactivity (verboten in runes) | 0 | ✅ |
| `on:click`-style legacy syntax | 0 | ✅ |
| `{@html ...}` (XSS-Risiko) | 0 | ✅ |
| `JSON.parse` ohne try/catch | 0 | ✅ |
| `onMount(async ...)` mit Return | 0 | ✅ |
| `console.log/error/warn` in Production | 0 | ✅ |
| Hardcodierte API-Keys / Tokens | 0 | ✅ Nur legitime password-/token-Variablen in auth.js |
| Server-only-Imports in Client-Code | 0 | ✅ Alle `$lib/server/...` nur in `+page.server.js`, `+server.js`, `+layout.server.js`, `hooks.server.js` |
| Repository.js Re-Export-Konsistenz | OK | ✅ Alle 35 exportierten Funktionen aus Subrepositories sind via Barrel re-exportiert oder direkt importiert |
| `userId`-Scope in Repository-Queries | OK (mit B-05-Ausnahme) | ✅ Alle Queries scopen ausser dem dokumentierten Cross-User-Cleanup in `deleteEvent` |
| Public Share Whitelist | OK | ✅ `publicEventShape` in [shares.js:101](../../src/lib/server/repositories/shares.js#L101) ist explizite Allowlist |
| `escapeHtml` in `LeafletMapView.popupHtml` | OK | ✅ alle dynamischen Werte escaped |
| Form-Action-Failure-Recovery | OK | ✅ `fail(400, {...})` mit `values`-Restore |
| `bind:this` in EventMapPanel + LeafletMapView + NotificationBell | OK | ✅ Alle drei mit `let foo = $state()` |
| `bind:value` und `bind:group` in Forms | OK | ✅ Alle gebundenen Variablen mit `$state` deklariert |
| `setTimeout`/`addEventListener` Cleanup in NotificationBell | OK | ✅ `$effect` registriert auf `document` mit Cleanup-Return |

---

## Anhang A — Statische Analyse (nicht ausgeführt)

Per Audit-Auftrag wurde **keine** Tool-Installation durchgeführt. Folgende Tools wären sinnvoll, sind aber nicht installiert:

| Tool | Status | Würde finden |
|---|---|---|
| `svelte-check` | nicht installiert | Runes-Verstösse (B-01, B-03), bind-Probleme, Reactivity-Lecks, A11y-Warnings |
| `eslint-plugin-svelte` | nicht installiert | Style-Konsistenz, ungenutzte Imports/Vars, equality-Operatoren |
| `tsc --noEmit` | wirkungslos | wegen `checkJs: false` in [jsconfig.json](../../jsconfig.json) |
| Playwright / Vitest | nicht installiert | Browser-Verhalten, Unit-Tests für Helper |

**Empfehlung:** `npm install -D svelte-check` als devDep ergänzen und einen `check`-Script `svelte-check --tsconfig jsconfig.json` einrichten. Würde die meisten MEDIUM-Befunde automatisch flaggen.

---

## Ende Phase 2

Phase 3 (Dead-Code-Audit) startet erst nach expliziter Freigabe und produziert `docs/audit/AUDIT_DEADCODE.md`.
