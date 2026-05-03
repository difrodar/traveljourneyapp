# Codex Custom Instructions – TripTales / Travel Event Planner

Diese Datei definiert die verbindlichen Arbeitsregeln für Codex bei der Planung, Umsetzung und Dokumentation des Prototyping-Projekts **TripTales – Travel Event Planner & Journey Memory App**.

Codex soll diese Datei bei allen Planungs-, Entwicklungs-, Refactoring- und Dokumentationsaufgaben berücksichtigen.

---

## 1. Projektkontext

Das Projekt ist ein Einzelprojekt im Modul **Prototyping**. Ziel ist ein funktionsfähiger, interaktiver Web-App-Prototyp mit **SvelteKit**.

Die Anwendung kombiniert:

- Eventplanung
- Freundeseinladung
- Location-Verwaltung
- Journey-/Travel-Memory-Funktion
- Bewertung vergangener Events
- einfache visuelle Übersicht über besuchte Orte

Die App soll besonders für Studierende im Ausland, Reisende und junge Erwachsene geeignet sein, die während eines Aufenthalts viele Aktivitäten planen und später als Erinnerungen wieder ansehen möchten.

---

## 2. Übergeordnetes Ziel

Codex soll nicht nur Code schreiben, sondern das Projekt methodisch, nachvollziehbar und dokumentationsorientiert unterstützen.

Wichtig ist:

- stabiler MVP vor Zusatzfeatures
- saubere SvelteKit-Struktur
- echte Interaktivität
- mehrere Pages und Workflows
- Datenbank-/Storage-Anbindung
- CRUD-Funktionalität
- verständliche UI
- laufende Dokumentation in `README.md`
- transparente KI-Deklaration
- prüfungstaugliche Projektstruktur

---

## 3. Verbindliche technische Vorgaben

### Erlaubt und gewünscht

- SvelteKit
- TypeScript, sofern sinnvoll und stabil umsetzbar
- HTML, CSS und JavaScript/TypeScript
- klar strukturierte Komponenten
- einfache, robuste Datenbank- oder Storage-Lösung
- serverseitige Actions oder API-Routen, wenn sinnvoll
- Validierung von Formulareingaben
- sprechende Dateinamen
- saubere Ordnerstruktur
- verständliche Kommentare bei komplexeren Stellen
- realistische Seed-Daten
- Deployment-fähige Umsetzung

### Nicht erlaubt oder nicht gewünscht

- keine rein statische App
- keine App ohne Datenbank-/Storage-Anbindung
- keine Ein-Seiten-Demo ohne echte Workflows
- keine unnötig komplexe Architektur
- kein Overengineering
- keine experimentellen Libraries ohne klaren Nutzen
- keine ungetesteten Grossumbauten ohne vorherigen Plan
- keine unübersichtlichen Monster-Komponenten
- keine hart codierten Fake-Daten als einzige Datenquelle
- keine fremden Bilder, Icons oder Assets ohne Lizenzklärung
- keine Funktionen, die den MVP destabilisieren

---

## 4. Arbeitsweise von Codex

### Codex soll immer zuerst planen

Vor grösseren Änderungen soll Codex zuerst erklären:

1. Was geändert werden soll
2. Warum es geändert werden soll
3. Welche Dateien betroffen sind
4. Welche Risiken bestehen
5. Wie die Änderung getestet werden kann

Erst danach soll implementiert werden.

### Codex soll iterativ arbeiten

Codex soll das Projekt in kleinen, nachvollziehbaren Schritten umsetzen:

- Projektsetup
- Grundlayout
- Navigation
- Datenmodell
- erste CRUD-Funktion
- Event-Erstellung
- Event-Liste
- Event-Details
- Journey-Funktion
- Map-/Pinpoint-Ansicht
- Validierung
- Styling
- Dokumentation
- Evaluation-Vorbereitung
- Erweiterungen

### Codex soll keine grossen Sprünge machen

Nicht mehrere Hauptbereiche gleichzeitig umbauen. Jede Änderung soll logisch abgeschlossen und dokumentierbar sein.

---

## 5. Dokumentationsregeln

Die Datei `README.md` ist die offizielle Projektdokumentation.

Sie basiert auf `VORLAGE_README.md`.

### Strikte Regel

Die Kapitelstruktur der Vorlage darf nicht verändert werden.

### Codex soll dokumentieren

Codex soll alle relevanten Tätigkeiten passend in der README.md festhalten:

- Ausgangslage
- Lösungsidee
- Zielgruppe
- Annahmen
- Abgrenzung
- methodisches Vorgehen
- Skizzen/Varianten als Platzhalter
- Entscheidungsbegründungen
- User Journey
- Mockup-Platzhalter
- Designentscheidungen
- Technologie-Stack
- Komponentenstruktur
- Datenmodell
- Schnittstellen
- Deployment-Platzhalter
- Evaluation-Plan
- Testaufgaben
- Findings und Verbesserungen
- Erweiterungen
- Projektorganisation
- KI-Deklaration
- Quellen und Assets

### Codex soll nicht dokumentieren

- keine erfundenen Evaluationsergebnisse
- keine erfundenen Testpersonen
- keine erfundenen Deployment-URLs
- keine erfundenen Figma-Links
- keine falschen Angaben zu verwendeten Tools
- keine unklaren Aussagen wie „wurde getestet“, wenn kein Test stattgefunden hat

Platzhalter sind erlaubt und gewünscht, wenn Inhalte später ergänzt werden müssen.

---

## 6. Anforderungen an den MVP

Der MVP muss mindestens folgende Funktionen enthalten:

### Dashboard

- zeigt kommende Events
- zeigt vergangene Journey-Einträge oder Highlights
- zeigt einfache Kennzahlen
- bietet Schnellzugriff auf Event-Erstellung

### Event-Erstellung

- Formular für neues Event
- Titel
- Datum
- Uhrzeit
- Location
- Kategorie
- Beschreibung
- eingeladene Freunde
- Speichern in Datenbank/Storage

### Event-Liste

- lädt Events aus Datenbank/Storage
- zeigt Events übersichtlich an
- ermöglicht einfache Sortierung oder Filterung
- unterscheidet geplante und vergangene Events

### Event-Detailseite

- zeigt Eventinformationen
- erlaubt Bearbeitung
- erlaubt Statusänderung von `planned` zu `completed`
- erlaubt Ergänzung von Rating und Erinnerungstext

### Journey / Timeline

- zeigt vergangene Events chronologisch
- zeigt Rating, Erinnerungstext, Kategorie und Location
- dient als digitales Reisetagebuch

### Map-/Pinpoint-Ansicht

- zeigt gespeicherte Orte visuell oder als prototypische Pinpoint-Karten
- echte Kartenintegration ist optional
- eine stabile vereinfachte Lösung ist besser als eine instabile externe Kartenintegration

---

## 7. Gewünschte Pages und Routen

Codex soll mindestens folgende Routen planen und umsetzen:

```text
/
/events
/events/new
/events/[id]
/journey
/map
```

Optional:

```text
/ideas
/profile
/settings
```

Optionale Seiten dürfen erst umgesetzt werden, wenn der MVP stabil funktioniert.

---

## 8. Gewünschte Komponentenstruktur

Codex soll wiederverwendbare Komponenten erstellen, z. B.:

```text
src/lib/components/Navigation.svelte
src/lib/components/EventCard.svelte
src/lib/components/EventForm.svelte
src/lib/components/FriendPicker.svelte
src/lib/components/RatingInput.svelte
src/lib/components/JourneyCard.svelte
src/lib/components/DashboardStats.svelte
src/lib/components/MapPinCard.svelte
```

Codex soll grosse Komponenten vermeiden und Logik sinnvoll auslagern.

---

## 9. Datenmodell

Codex soll ein einfaches, stabiles Datenmodell verwenden.

### Event

```ts
type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  locationName: string;
  category: string;
  description: string;
  status: 'planned' | 'completed';
  invitedFriends: string[];
  rating?: number;
  memoryText?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Location

```ts
type Location = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
};
```

### Friend

```ts
type Friend = {
  id: string;
  name: string;
  invitationStatus?: 'invited' | 'accepted' | 'declined' | 'maybe';
};
```

### JourneyEntry

```ts
type JourneyEntry = {
  id: string;
  eventId: string;
  rating: number;
  memoryText: string;
  imageUrl?: string;
  createdAt: string;
};
```

Das Datenmodell darf vereinfacht werden, wenn dies für einen stabilen Prototyp sinnvoll ist.

---

## 10. UI- und UX-Regeln

### Gewünscht

- klare Navigation
- verständliche Labels
- konsistente Buttons
- mobile-freundliches Layout
- sinnvolle Abstände
- lesbare Typografie
- klare visuelle Hierarchie
- Feedback nach Speichern/Bearbeiten
- Fehlermeldungen bei ungültigen Eingaben
- Empty States
- Loading States, falls Daten asynchron geladen werden

### Nicht gewünscht

- überladene Screens
- unklare Icons ohne Label
- zu viele Farben ohne System
- versteckte Hauptfunktionen
- Formulare ohne Validierung
- fehlendes Nutzerfeedback
- inkonsistente Button-Texte
- rein dekorative Features ohne Nutzen

---

## 11. Methodik und Artefakte

Codex soll das Projekt entlang dieser Phasen unterstützen:

### Understand & Define

- Problemraum beschreiben
- Zielgruppe definieren
- Proto-Persona erstellen
- Bedürfnisse und Pain Points erfassen
- Ziele und Annahmen dokumentieren

### Sketch

- mehrere Lösungsvarianten beschreiben
- Unterschiede dokumentieren
- Platzhalter für Skizzen/Screenshots setzen

### Decide

- gewählte Variante begründen
- Entscheidungskriterien dokumentieren
- User Journey definieren
- Mockup-Platzhalter setzen

### Prototype

- Design und technische Umsetzung trennen
- Informationsarchitektur dokumentieren
- UI-Entscheidungen begründen
- Komponenten und Datenfluss beschreiben

### Validate

- Evaluation planen
- Testaufgaben formulieren
- Beobachtungskriterien definieren
- Kennzahlen vorschlagen
- Verbesserungsvorschläge dokumentieren

Codex darf keine Evaluationsergebnisse erfinden.

---

## 12. Evaluation

Codex soll bei der Evaluation unterstützen durch:

- Testskript
- Testaufgaben
- Beobachtungsbogen
- Auswertungsvorlage
- Priorisierung abgeleiteter Verbesserungen

Beispielhafte Testaufgaben:

1. Erstelle ein neues Event für einen Strandtag in San Diego.
2. Lade zwei Freunde zum Event ein.
3. Bearbeite das Event und ändere die Kategorie.
4. Markiere das Event als erlebt.
5. Ergänze ein Rating und einen Erinnerungstext.
6. Finde das Event in der Journey-Ansicht wieder.
7. Suche den Ort in der Map-/Pinpoint-Ansicht.

---

## 13. Erweiterungen

Erweiterungen sind erlaubt, aber erst nach stabilem MVP.

### Mögliche Erweiterungen

- Reiseideen-Seite
- Travel Idea in Event umwandeln
- dynamische Hintergründe nach Kategorie oder Location
- Insta-Preview
- Share-Funktion als Prototyp
- Filter nach Zeitraum, Kategorie oder Rating
- bessere Map-Visualisierung
- verbesserte Projektorganisation mit Issues

### Regel

Jede Erweiterung muss dokumentiert werden:

- Beschreibung & Nutzen
- Wo umgesetzt
- Referenz zur App oder Screenshot
- Ob aus Evaluation abgeleitet
- Abgrenzung zum Mindestumfang

---

## 14. KI-Deklaration

Codex soll den eigenen Einsatz transparent dokumentieren.

### Zu dokumentieren

- Tool: Codex
- Zweck: Planung, Codevorschläge, Refactoring, Dokumentation, Testideen
- Umfang: Welche Teile wurden KI-unterstützt erstellt?
- Eigenleistung: Was wurde geprüft, angepasst und entschieden?
- Prompt-Vorgehen: Wie wurde Codex eingesetzt?
- Qualitätssicherung: Wie wurden Vorschläge überprüft?

### Nicht erlaubt

- KI-Einsatz verschweigen
- KI-generierte Inhalte als vollständig eigenständig ausgeben
- unüberprüfte Codex-Antworten als korrekt deklarieren
- Quellen oder Lizenzen erfinden

---

## 15. Git- und Projektorganisation

### Gewünscht

- sprechende Commits
- kleine, nachvollziehbare Änderungen
- sinnvolle Branches
- Issue-Liste oder Taskliste
- saubere Ordnerstruktur
- README laufend aktuell halten

### Beispiel-Branches

```text
feature/project-setup
feature/event-crud
feature/journey-timeline
feature/map-view
feature/evaluation-docs
feature/readme-documentation
```

### Beispiel-Commits

```text
chore: initialize SvelteKit project
feat: add event creation form
feat: implement event list and detail page
feat: add journey timeline for completed events
docs: update README with prototype architecture
docs: add evaluation test script
fix: improve form validation feedback
```

---

## 16. Qualitätssicherung

Codex soll nach Änderungen prüfen:

- Läuft die App lokal?
- Gibt es TypeScript- oder Build-Fehler?
- Funktionieren die zentralen Workflows?
- Sind Formularvalidierungen vorhanden?
- Werden Daten korrekt gespeichert und geladen?
- Ist die README.md aktualisiert?
- Sind neue Features dokumentiert?
- Wurde nichts erfunden?
- Sind rechtliche Rahmenbedingungen beachtet?

---

## 17. Prioritäten

Codex soll immer nach dieser Reihenfolge priorisieren:

1. Bestehensrelevante Mindestanforderungen
2. Stabilität
3. Verständliche Workflows
4. Dokumentation
5. Usability
6. Saubere Code-Struktur
7. Evaluation
8. Erweiterungen
9. optische Verfeinerung

---

## 18. Nicht verhandelbare Regeln

- Keine Änderung der README-Kapitelstruktur.
- Kein Code ohne vorherige Planung bei grösseren Änderungen.
- Keine erfundenen Projektergebnisse.
- Keine instabilen Zusatzfeatures auf Kosten des MVP.
- Keine rein statische Umsetzung.
- Keine fehlende KI-Deklaration.
- Keine unrechtmässigen Assets.
- Keine undokumentierten Hauptentscheidungen.
- Keine unnötig komplexe technische Lösung.

---

## 19. Erwartetes Verhalten bei Unsicherheit

Wenn Codex unsicher ist, soll Codex:

1. die Unsicherheit klar benennen
2. eine sichere Minimalvariante vorschlagen
3. keine erfundenen Annahmen treffen
4. bei wichtigen Projektentscheidungen nachfragen
5. bei technischen Optionen Vor- und Nachteile nennen

---

## 20. Kurzfassung für Codex

Arbeite prüfungsorientiert, methodisch und dokumentationsgetrieben.

Baue zuerst einen stabilen SvelteKit-MVP mit mehreren Pages, Navigation, Datenbank-/Storage-Anbindung und CRUD-Workflows für Events und Journey-Einträge.

Halte die README.md gemäss Vorlage laufend aktuell, ohne die Kapitelstruktur zu verändern.

Setze Erweiterungen erst um, wenn der Mindestumfang stabil erfüllt ist.

Erfinde keine Evaluationsergebnisse, URLs, Quellen oder Artefakte.
