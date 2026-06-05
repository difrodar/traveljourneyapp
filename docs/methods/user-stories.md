# User Stories (INVEST) — TripTales

Diese User Stories formulieren die zentralen Workflows von TripTales **wertorientiert und testbar** nach dem INVEST-Prinzip (Independent, Negotiable, Valuable, Estimable, Small, Testable). Sie sind an die beiden priorisierten Personas geknüpft — **Dario** (Primary) und **Marco** (Secondary), siehe [`../personas.md`](../personas.md) — und verweisen jeweils auf die umgesetzte Funktion in der [README](../../README.md).

> **Transparenzhinweis (analog README §5):** Diese Stories wurden bewusst aus den **bereits umgesetzten** Features abgeleitet und gegen Projektende konsolidiert. Sie dienen als nachvollziehbare, testbare Anforderungsschicht zwischen Personas/HMW-Fragen ([`hmw-fragen.md`](hmw-fragen.md)) und der gebauten App — nicht als nachträglich erfundene Roadmap. Jede Story beschreibt Verhalten, das in der aktuellen Version live verifizierbar ist.

## Warum INVEST hier passt

| Kriterium | Umsetzung in dieser Sammlung |
|---|---|
| **I**ndependent | Jede Story adressiert einen eigenständigen Workflow (Event, Memory, Idea, Trip, Sharing …) und lässt sich einzeln demonstrieren. |
| **N**egotiable | Die Story beschreibt das *Was/Wozu*, nicht die UI-Details — Letztere wurden im Usability-Test verhandelt (siehe Issue-Bezüge). |
| **V**aluable | Jede Story endet mit einem konkreten Nutzen für Dario oder Marco, nicht mit einer technischen Aufgabe. |
| **E**stimable | Der Scope ist klein genug, um in einem Schritt umsetz- und testbar zu sein. |
| **S**mall | Eine Story = ein Workflow-Schritt; grössere Themen sind in mehrere Stories zerlegt. |
| **T**estable | Die Akzeptanzkriterien sind als überprüfbare Bedingungen formuliert (live nachstellbar). |

---

## Epic 1 — Zugang & private Daten

### US-01 · Account-Zugang
**Als** Studierender vor dem Auslandssemester (Dario) **möchte ich** mich registrieren und einloggen, **damit** meine Pläne und Erinnerungen privat und nur mir zugeordnet bleiben.
- **Akzeptanzkriterien:**
  - Registrierung mit Username (3–32 Zeichen) und Passwort (≥ 8 Zeichen) legt einen Account an.
  - Nach Login sehe ich ausschliesslich meine eigenen Events, Ideas, Memories, Orte und Trips.
  - Ohne gültige Session werde ich von geschützten Seiten auf `/login` umgeleitet.
- **Persona:** Dario · **Feature:** README §4.5, §3.4.2 (Auth)

---

## Epic 2 — Planen

### US-02 · Event erfassen
**Als** Dario **möchte ich** ein Event mit Titel, Kategorie, Datum, Ort und Beschreibung anlegen, **damit** alle Details einer Aktivität an einem Ort statt über mehrere Apps verstreut liegen.
- **Akzeptanzkriterien:**
  - Pflichtfelder Titel, Kategorie und Datum werden bei Fehlen **feldnah** moniert; Eingaben bleiben erhalten.
  - Ein über die City-Combobox gewählter Ort speichert echte Koordinaten für die Karte.
  - Nach dem Speichern lande ich auf der Event-Detailseite.
- **Persona:** Dario · **Feature:** README §2, §3.4

### US-03 · Event aus dem Kalender heraus anlegen
**Als** Dario **möchte ich** direkt aus einem Kalendertag ein Event starten, **damit** ich das Datum nicht erneut eingeben muss.
- **Akzeptanzkriterien:**
  - Ein Klick auf „+ Add event" an einem Tag öffnet das Formular mit vorbelegtem Datum.
- **Persona:** Dario · **Feature:** README §3.5 (ISSUE-02)

### US-04 · Optionale Endzeit
**Als** Dario **möchte ich** zusätzlich zur Startzeit eine Endzeit angeben können, **damit** die Dauer einer Aktivität korrekt sichtbar und im Kalenderexport hinterlegt ist.
- **Akzeptanzkriterien:**
  - Die Endzeit ist optional; ist sie gesetzt, zeigt das Detail die Spanne `HH:MM–HH:MM`.
  - Der `.ics`-Export nutzt die echte Endzeit für `DTEND`.
- **Persona:** Dario · **Feature:** README §3.5.1 (ISSUE-05)

### US-05 · Wiederkehrende Termine
**Als** Marco mit regelmässigen Terminen (Yoga, Bouldern) **möchte ich** eine Serie über mehrere Termine anlegen, **damit** ich nicht jede Woche dasselbe Event manuell erfassen muss.
- **Akzeptanzkriterien:**
  - Frequenz (`daily`/`weekly`/`monthly`) und Anzahl (bis 52) erzeugen verknüpfte Einzeltermine.
  - Kalender, Liste und Map zeigen jeden Termin; die Journey bündelt Memories derselben Serie.
- **Persona:** Marco · **Feature:** README §4.9

### US-06 · Erinnerung pro Event
**Als** Dario **möchte ich** pro Event eine Vorlaufzeit für eine Erinnerung wählen, **damit** ich eine geplante Aktivität nicht verpasse.
- **Akzeptanzkriterien:**
  - Auswahl aus Presets (keine, 1 h, 3 h, 12 h, 1 Tag, 1 Woche vorher); Default „No reminder".
  - Im Vorlauffenster erscheint das Event in der Notification-Glocke unter „Reminders due" mit Countdown.
- **Persona:** Dario · **Feature:** README §4.12 (ISSUE-06)

---

## Epic 3 — Ideen sammeln & überführen

### US-07 · Idee ohne Datum sichern
**Als** Marco **möchte ich** einen spontanen Tipp ohne Datum als Idee speichern, **damit** er nicht verloren geht, bevor er konkret wird.
- **Akzeptanzkriterien:**
  - Eine Idee mit Titel, Ort, Kategorie und Priorität lässt sich ohne Datum anlegen.
  - „Save as idea" ist auch aus dem Event-Erfassungsflow erreichbar.
- **Persona:** Marco · **Feature:** README §4.1 (ISSUE-10)

### US-08 · Idee in Event umwandeln (mit Review)
**Als** Marco **möchte ich** eine Idee in ein Event überführen und die übernommenen Werte vorher prüfen, **damit** kein Event mit unerwarteten Standardwerten entsteht.
- **Akzeptanzkriterien:**
  - „Convert to event" öffnet das vorbefüllte Formular; Datum/Zeit bleiben leer und müssen gewählt werden.
  - „Cancel — back to ideas" lässt die Idee unverändert; erst erfolgreiches Speichern markiert sie als konvertiert.
- **Persona:** Marco · **Feature:** README §4.1, §3.5.1 (ISSUE-11)

---

## Epic 4 — Erleben & Erinnern

### US-09 · Erinnerung mit Foto festhalten
**Als** Dario **möchte ich** nach einer Aktivität einen Erinnerungstext und Fotos speichern, **damit** das Erlebnis Teil meiner Journey wird.
- **Akzeptanzkriterien:**
  - Im Bereich „After the event" lassen sich Text und bis zu fünf Bilder ergänzen.
  - Speichern setzt den Status auf „Completed" und legt die Memory in einem Schritt an.
- **Persona:** Dario · **Feature:** README §3.4, §4.6

### US-10 · Journey-Rückblick
**Als** Dario **möchte ich** meine abgeschlossenen Erlebnisse als Zeitleiste sehen, **damit** ich das Semester später als zusammenhängenden Rückblick erleben kann.
- **Akzeptanzkriterien:**
  - Memories erscheinen nach Monat **oder** nach Trip gruppiert (Umschalter).
  - Such-, Kategorie- und Datumsfilter wirken identisch zur Event-Liste.
- **Persona:** Dario · **Feature:** README §3.4, §4.10

### US-11 · Orte auf der Karte
**Als** Dario **möchte ich** meine Orte auf einer Karte sehen, **damit** ich ein visuelles Souvenir meiner besuchten Plätze habe.
- **Akzeptanzkriterien:**
  - Orte mit Koordinaten erscheinen als Pins, gruppiert nach Land → Stadt → Ort; dichte Pins clustern.
  - Filter für Status, Kategorie und Zeitraum wirken gleichzeitig auf Karte und Liste.
- **Persona:** Dario · **Feature:** README §4.2

---

## Epic 5 — Soziales & Teilen

### US-12 · Freunde zu einem Event einladen
**Als** Dario **möchte ich** echte TripTales-Accounts zu einem Event einladen, **damit** die Abstimmung nachvollziehbar in der App statt im Gruppenchat passiert.
- **Akzeptanzkriterien:**
  - Nur existierende Accounts sind einladbar; Eingeladene sehen das Event mit Status „invited".
  - Eingeladene können auf der Detailseite annehmen oder ablehnen; der Einladende erhält Status-Feedback.
- **Persona:** Dario · **Feature:** README §4.8 (ISSUE-12)

### US-13 · Mehrtägige Reise gruppieren
**Als** Marco **möchte ich** mehrere Aktivitäten zu einem Trip zusammenfassen, **damit** eine mehrtägige Reise als geschlossene Einheit statt verstreut erscheint.
- **Akzeptanzkriterien:**
  - Events lassen sich optional einem Trip zuordnen; Events ohne Trip bleiben unverändert.
  - Die Trip-Detailseite zeigt Datumsbereich, Statistik, Mini-Map und die zugeordneten Events.
- **Persona:** Marco · **Feature:** README §4.10

### US-14 · Reise ohne Account-Zwang teilen
**Als** Dario **möchte ich** eine abgeschlossene Reise als schreibgeschützten Link teilen, **damit** Familie und Freunde sie ohne eigenen Account ansehen können.
- **Akzeptanzkriterien:**
  - Beim Erstellen wähle ich Scope (ganze Journey oder ein Trip) und Ablauf (1/7/14/30 Tage oder nie); eine Vorschau zeigt Inhalt, Empfänger und konkretes Ablaufdatum.
  - Der öffentliche Link enthält keine Owner-/Friend-/Invitation-Daten und ist sofort widerrufbar.
- **Persona:** Dario · **Feature:** README §4.3 (ISSUE-14/15/16/17)

---

## Epic 6 — Komfort

### US-15 · Dark Mode
**Als** Dario **möchte ich** zwischen hellem und dunklem Modus umschalten, **damit** die App auch in dunkler Umgebung gut lesbar bleibt; die Wahl soll gerätübergreifend erhalten bleiben.
- **Akzeptanzkriterien:**
  - Der Toggle wechselt das Theme ohne Reload; die Wahl wird pro Account gespeichert.
  - Auch die Kartenkacheln wechseln auf einen dunklen Layer.
- **Persona:** Dario · **Feature:** README §4.11

---

## Persona → Story-Abdeckung

| Persona | Stories | Schwerpunkt |
|---|---|---|
| **Dario** (Primary, MVP-Treiber) | US-01, US-02, US-03, US-04, US-06, US-09, US-10, US-11, US-12, US-14, US-15 | Planen, Erleben, Erinnern, privates Konto, visuelles Souvenir |
| **Marco** (Secondary, Erweiterungs-Treiber) | US-05, US-07, US-08, US-13 | Wiederkehrende Termine, spontane Ideen, mehrtägige Reisen |

Diese Verteilung spiegelt die Persona-Logik aus [`../personas.md`](../personas.md): Dario definiert den Kern, Marco motiviert die Erweiterungen (§4.1, §4.9, §4.10).
