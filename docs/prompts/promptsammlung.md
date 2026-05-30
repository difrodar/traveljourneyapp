# Prompt-Sammlung für TripTales und Svelte-Prototyping

Diese Datei enthält die gesendeten Prompts in sinnvoller Reihenfolge. Die Prompt-Texte selbst werden jeweils **1:1 unverändert** in einem separaten Codeblock wiedergegeben. Kontext, Resultat und Interpretation stehen ausserhalb der Originalprompts.

## Methodik des KI-Einsatzes

Diese Sammlung ist gleichzeitig **methodisches Artefakt im Sinne des Bewertungsrasters Teil B**: das Rubrik-Beispiel *"Anpassung eines KI-Agenten-Workflows in VS Code (Agent-Konfiguration, Tool-Anbindung via MCP, Kontextquellen definieren, Prompt-Rezepte/Workflows versionieren)"* wird hiermit konkret eingelöst.

### Tool-Stack

| Werkzeug | Modell / Version | Einsatzbereich |
|---|---|---|
| Claude Code (VS Code Extension) | Anthropic Claude Opus 4.7, später 4.8 (1M-Kontext) | Primäre Entwicklungs-Sessions ab Prototype-Phase: Planning, Code-Generierung, Refactoring, Audit, Verifikation |
| OpenAI Codex CLI / ChatGPT | GPT-Klasse | Frühphase Understand/Sketch/Decide; spezifische Recherche-Fragen ausserhalb von Code |
| Microsoft Learn MCP Server | n/a | Nachschlagen offizieller SvelteKit- und Azure-Dokumentation direkt aus Claude Code heraus |

Die VS-Code-Konfiguration und die Arbeitsregeln für Claude Code sind in [`CLAUDE.md`](../../CLAUDE.md) im Repository-Root versioniert. `CLAUDE.md` ist damit selbst ein versioniertes Prompt-Artefakt — das Working-Agreement zwischen Entwickler und KI.

### Workflow-Patterns

- **Plan-Mode-First:** Jede nicht-triviale Änderung (>3 Dateien, neue Komponenten-API, Schema-Änderung) wird zuerst im Plan-Modus designt und vom Entwickler freigegeben, bevor Code geschrieben wird. Verhindert Big-Bang-Edits und macht Architektur-Entscheidungen reviewbar.
- **Explore-Subagents:** Für Codebase-Erkundungen über mehrere Verzeichnisse werden parallele Read-only-Explore-Agents losgeschickt, die jeweils einen fokussierten Bereich kartieren. Das Hauptmodell aggregiert die Ergebnisse, ohne den eigenen Kontext zu fluten.
- **Atomic Commits mit Co-Authoring:** Jede logische Änderung als eigener Commit. KI-assistierte Commits führen den `Co-Authored-By: Claude`-Trailer (siehe README §6.2).
- **Memory-System:** Persistenter Projekt-Kontext über Sessions hinweg unter `~/.claude/projects/.../memory/` — z. B. Demo-Account-Credentials und Walkthrough-Skript-Status. So muss bei einer neuen Session nicht der ganze Projektkontext rekapituliert werden.
- **Smoke-Test als Verifikation:** `npm run smoke` läuft nach jedem grösseren Server-/Route-Change automatisch, bevor ein Task als erledigt gilt.

### Phasen-Anwendung

| Phase | Hauptsächlich genutzter Prompt | Tool |
|---|---|---|
| Understand & Define | Prompt 1 — Projektidee ausformulieren | ChatGPT |
| Sketch / Decide | Prompt 2 — Technischer Projektplan | Codex / Claude Code (Plan-Mode) |
| Prototype Start | Prompt 3 — Claude-Code-Onboarding | Claude Code |
| Prototype Weiterentwicklung | Prompt 4 — UX-/Produktstrategie-Audit | Claude Code |
| Validate | Prompt 5 & 6 — Usability-Test-Auswertung | Claude Code |
| Qualitätssicherung vor Abgabe | Prompt 7 — Bug-Audit + Dead-Code | Claude Code |

### Verantwortung & Grenzen

Folgende Bereiche wurden bewusst **immer manuell kontrolliert**, nie blind von KI-Vorschlägen übernommen:
- **Datenscoping per `userId`** in jeder neuen Repository-Query (Privacy-Invariante des Projekts).
- **Lizenzen für Bilder** — jedes Wikimedia-Commons-Foto wurde individuell verifiziert (CC-Lizenz, Attribution, Source-URL); siehe README §7.
- **Secret-Handling** — keine Secrets in Prompts, kein `.env` in Commits.
- **Finale Build-/Smoke-Verifikation** — KI darf einen Task vorschlagen, aber als "erledigt" gilt er erst nach erfolgreichem `npm run build` + `npm run smoke`.

Bekannte Grenzen:
- KI-Vorschläge zu Komponenten-Grössen überschritten gelegentlich die CLAUDE.md-Limits (>300 Logik-Zeilen) — wurde durch explizite Splits manuell korrigiert.
- Visuelle Polish-Entscheidungen (Farbpalette, Typography) wurden ausserhalb der KI getroffen.
- Validierungsergebnisse des Usability-Tests sind echte Beobachtungen, nicht KI-generiert; die KI hat nur die Auswertung strukturiert (Severity-Schema, Issue-Map).

## Übersicht

1. [Prompt 1 — Projektidee ausformulieren](#prompt-1-projektidee-ausformulieren)
2. [Prompt 2 — Technischer Projektplan für TripTales](#prompt-2-technischer-projektplan-für-triptales)
3. [Prompt 3 — Claude-Code-Onboarding für Svelte-Projekt](#prompt-3-claude-code-onboarding-für-svelte-projekt)
4. [Prompt 4 — UX-/Produktstrategie-Audit für Travel Web App](#prompt-4-ux-produktstrategie-audit-für-travel-web-app)
5. [Prompt 5 — Usability-Test-Auswertung TripTales, Variante A](#prompt-5-usability-test-auswertung-triptales-variante-a)
6. [Prompt 6 — Usability-Test-Auswertung TripTales, Variante B mit Platzhaltern](#prompt-6-usability-test-auswertung-triptales-variante-b-mit-platzhaltern)
7. [Prompt 7 — Bug-Audit und Dead-Code-Bereinigung für Svelte-Projekt](#prompt-7-bug-audit-und-dead-code-bereinigung-für-svelte-projekt)

## Prompt 1 — Projektidee ausformulieren

**Kontext:** Frühe Konzeptphase für TripTales. Der Prompt dient dazu, aus Stichworten, Feedback und persönlicher Reflexion eine besser formulierte Projektidee zu erstellen.

**Resultat:** Eine ausführlichere, klarere Beschreibung der App-Idee inklusive Nutzen, Zielgruppe und möglicher Features.

**Interpretation:** Dieser Prompt gehört an den Anfang des Projekts, weil er die Grundlage für spätere Planung, README-Dokumentation und MVP-Abgrenzung schafft.

**Originalprompt:**

~~~~text
erstelle anhand dieser projektidee eine ausführlichere projektidee mit besserer umschreibung:
Kommentare
- KombinaƟon von Freunden einladen innerhalb eines Erstellfenster von Events
- Evtl. per prompten einige Designbeispiele vergleichen und an eigene Präferenz anpassen
ReflekƟon
- Die Idee ist immer noch die selbe, es soll ein Event-Planner werden, der sowohl als EventPlanner als auch im Nachhinein als Travel-Journey dienen soll.
- Ideen für zusätzliche Features:
o Insta-Preview – User soll seine Posts in einem möglichen Instapreview darstellen
lassen können
o Dynamische Hintergründe je nach Event LocaƟon
o Eine Reiseideen-Seite
o RaƟngs von Orten/Events etc.
o Share-Funkion 
o Map mit Pinpoints wo man überall ein Event haƩe gefiltert per Zeitspanne
- Diese Idee gefällt mir, da ich im kommenden Semester in San Diego studieren werde und ich
mit so einem Tool zentral alle notwendigen Felder abdecken kann und dies mit einem
zentralen Datastore kombinieren kann.
- Das Feedback hat mir zusätzlichen Input auf mehr Features oder sinnvollere
Anwendungsmöglichkeiten gezeigt 
~~~~

## Prompt 2 — Technischer Projektplan für TripTales

**Kontext:** Planungsphase für das Prototyping-Projekt an der ZHAW. Der Prompt setzt den Rahmen für MVP, Anforderungen, technische Architektur, Roadmap und README-Dokumentation.

**Resultat:** Ein vollständiger Projektplan ohne Code-Implementierung, inklusive Anforderungen, Pages, Workflows, Datenmodell, Komponenten und Umsetzungsroadmap.

**Interpretation:** Dieser Prompt übersetzt die Projektidee in einen realistischen Entwicklungsplan und stellt sicher, dass Bewertungskriterien, Dokumentation und technischer Mindestumfang berücksichtigt werden.

**Originalprompt:**

~~~~text
Du bist mein technischer Projektplaner und Entwicklungsassistent für ein Prototyping-Einzelprojekt an der ZHAW im Modul Prototyping.

Arbeite im Planmodus. Erstelle zuerst einen vollständigen, realistischen Projektplan, bevor du Code implementierst. Ziel ist ein funktionsfähiger interaktiver Web-App-Prototyp mit SvelteKit für die Projektidee:

"TripTales – Travel Event Planner & Journey Memory App"

Die App kombiniert Eventplanung und digitales Reisetagebuch. Nutzerinnen und Nutzer sollen Events, Ausflüge, Reisen und persönliche Erlebnisse planen, organisieren, speichern, bearbeiten und später als Journey wieder ansehen können. Der konkrete Kontext ist ein Auslandssemester in San Diego: Aktivitäten wie Treffen mit Freunden, Wochenendtrips, Restaurantbesuche, Partys, Strandtage, Sehenswürdigkeiten und spontane Events sollen zentral verwaltet werden.

WICHTIGE PROJEKTVORGABEN

Das Projekt muss folgende Anforderungen erfüllen:

1. Technologie:
   - Implementierung mit SvelteKit
   - HTML/CSS/JavaScript oder TypeScript
   - Entwicklung in Visual Studio Code
   - Git/GitHub als Repository
   - Online zugängliches Deployment

2. Mindestumfang der App:
   - Die App darf nicht rein statisch sein.
   - Es müssen mehrere unterschiedliche Pages vorhanden sein.
   - Es muss Navigation zwischen Pages und echte Workflows geben.
   - Daten müssen aus einer Datenbank geladen und angezeigt werden.
   - Daten müssen erstellt und/oder aktualisiert werden können.
   - Die Code-Struktur muss nachvollziehbar und wartbar sein.

3. Methodisches Vorgehen:
   Plane und dokumentiere das Projekt entlang dieser Phasen:
   - Understand & Define
   - Sketch
   - Decide
   - Prototype
   - Validate

4. Dokumentation:
   - Die Datei README.md basiert auf der Datei VORLAGE_README.md.
   - Die Kapitelstruktur der Vorlage darf nicht verändert werden.
   - Alle Tätigkeiten, Entscheidungen, Artefakte und Ergebnisse müssen sinnvoll gegliedert in der README.md dokumentiert werden.
   - Die README.md ist nicht nur eine technische Readme, sondern die offizielle Projektdokumentation.
   - Dokumentiere während der Entwicklung immer nachvollziehbar, was umgesetzt wurde, warum es umgesetzt wurde und wo es im Projekt sichtbar ist.
   - Ergänze in der README.md auch Platzhalter für Screenshots, Mockups, Evaluationsergebnisse und Deployment-URL.

5. KI-Deklaration:
   - Der KI-Einsatz ist erlaubt, muss aber vollständig und transparent dokumentiert werden.
   - Dokumentiere in der README.md, welche KI-Tools verwendet wurden, wofür sie verwendet wurden, welche Teile KI-unterstützt entstanden sind und welche Eigenleistung bzw. Überarbeitung vorgenommen wurde.
   - Dokumentiere auch das Prompt-Vorgehen und eine kurze Reflexion zu Nutzen, Grenzen, Risiken und Qualitätssicherung.

6. Bewertungsschwerpunkte:
   Achte besonders auf:
   - Kernfunktionalität und technische Qualität
   - Nutzerzentrierung und Bedienbarkeit
   - nachvollziehbares phasenbasiertes Vorgehen
   - Evaluation mit Nutzenden und Auswertung
   - vollständige, verständliche Dokumentation
   - mögliche Erweiterungen mit erkennbarem Mehrwert
   - saubere Projektorganisation, sprechende Commits und sinnvolle Issue-Struktur

PROJEKTIDEE

Die App soll folgende Kernidee umsetzen:

Nutzerinnen und Nutzer können Events erstellen, Freunde einladen, Orte speichern und vergangene Erlebnisse als persönliche Journey festhalten. Ein geplantes Event kann später zu einem Journey-Eintrag werden. Dadurch verbindet die App Planung vor dem Event mit Erinnerung nach dem Event.

Primäre Zielgruppe:
- Studierende im Ausland
- Reisende
- junge Erwachsene
- Personen, die mit Freunden Aktivitäten planen und Erinnerungen visuell festhalten möchten

Kernproblem:
Informationen zu Reisen und Events sind oft über Kalender, Google Maps, Instagram, Notizen und Gruppenchats verteilt. Die App soll diese Informationen zentral zusammenführen.

KERNFUNKTIONEN FÜR DEN MINDESTUMFANG

Plane den Prototyp so, dass der Mindestumfang sicher erfüllt wird. Priorisiere folgende Funktionen:

1. Dashboard
   - Übersicht über kommende Events
   - Übersicht über vergangene Journey-Einträge
   - Schnellzugriff auf "Event erstellen"
   - einfache Kennzahlen, z. B. Anzahl Events, Anzahl besuchte Orte, Durchschnittsrating

2. Event erstellen
   - Formular mit:
     - Titel
     - Datum
     - Uhrzeit
     - Location
     - Kategorie
     - Beschreibung
     - eingeladene Freunde
   - Freunde sollen direkt im Event-Erstellprozess hinzugefügt werden können.
   - Event wird in der Datenbank gespeichert.

3. Event-Liste
   - Alle Events aus der Datenbank laden und anzeigen.
   - Filter oder einfache Sortierung nach Datum/Kategorie.
   - Unterscheidung zwischen geplant und vergangen.

4. Event-Detailseite
   - Eventinformationen anzeigen.
   - Event bearbeiten.
   - Status ändern, z. B. von "geplant" zu "erlebt".
   - Möglichkeit, nach dem Event Rating und Erinnerungstext zu ergänzen.

5. Journey / Timeline
   - Vergangene Events chronologisch anzeigen.
   - Erinnerungstext, Rating, Location und Kategorie anzeigen.
   - Dient als digitales Reisetagebuch.

6. Map- oder Pinpoint-Ansicht
   - Einfache visuelle Übersicht gespeicherter Orte.
   - Falls echte Kartenintegration zu aufwendig ist, eine vereinfachte Mock-Map oder Listenansicht mit Pinpoint-Karten planen.
   - Wichtig: Funktion muss prototypisch, stabil und dokumentiert sein.

DATENMODELL

Plane ein einfaches Datenmodell mit mindestens diesen Entitäten:

1. Event
   - id
   - title
   - date
   - time
   - locationId oder locationName
   - category
   - description
   - status: planned | completed
   - friendIds oder invitedFriends
   - createdAt
   - updatedAt

2. Location
   - id
   - name
   - address
   - city
   - country
   - coordinates optional
   - backgroundType optional

3. Friend
   - id
   - name
   - invitationStatus optional

4. JourneyEntry
   - id
   - eventId
   - rating
   - memoryText
   - imageUrl optional
   - createdAt

5. TravelIdea optional
   - id
   - title
   - location
   - category
   - priority
   - notes
   - convertedToEvent optional

TECHNISCHE PLANUNG

Erstelle einen Plan für:

1. Projektsetup
   - SvelteKit-Projektstruktur
   - TypeScript bevorzugt, falls sinnvoll
   - Styling-Ansatz
   - Datenbank oder Backend-Strategie
   - Deployment-Strategie

2. Datenhaltung
   - Schlage eine einfache, realistische Datenbanklösung vor.
   - Priorität: stabiler Prototyp, einfache CRUD-Funktionalität.
   - Plane, wie Events geladen, erstellt und bearbeitet werden.
   - Plane, wie Testdaten/Seed-Daten verwendet werden können.

3. Routen / Pages
   Plane mindestens:
   - /
   - /events
   - /events/new
   - /events/[id]
   - /journey
   - /map
   - optional /ideas

4. Komponenten
   Plane sinnvolle Komponenten, z. B.:
   - EventCard
   - EventForm
   - FriendPicker
   - RatingInput
   - JourneyCard
   - Navigation
   - DashboardStats
   - MapPinCard oder LocationPin

5. Workflows
   Dokumentiere und plane mindestens diese End-to-End-Workflows:
   - Neues Event erstellen
   - Freunde beim Event hinzufügen
   - Event anzeigen und bearbeiten
   - Event als erlebt markieren
   - Rating und Erinnerung ergänzen
   - Vergangene Events in Journey ansehen
   - Orte/Events in Map-Ansicht ansehen

6. Usability
   Plane:
   - klare Navigation
   - konsistente Buttons/Formulare
   - Feedback nach Speichern/Bearbeiten
   - Fehlermeldungen bei ungültigen Eingaben
   - leere Zustände, z. B. "Noch keine Events vorhanden"

7. Erweiterungen
   Plane optionale Erweiterungen, aber setze sie erst um, wenn der Mindestumfang stabil erfüllt ist:
   - Reiseideen-Seite
   - dynamische Hintergründe je nach Event-Location oder Kategorie
   - Insta-Preview für Event/Journey-Post
   - Share-Funktion als Prototyp
   - Filter nach Zeitraum, Kategorie oder Rating
   - einfache Issue-Struktur und Projektorganisation im Repository

VORGEHEN IM PLANMODUS

Bitte arbeite in folgenden Schritten:

Schritt 1: Projektverständnis zusammenfassen
- Fasse die App-Idee, Zielgruppe, Problemstellung und Ziele kurz zusammen.
- Lege den realistischen MVP fest.
- Grenze klar ab, was nicht Teil des MVP ist.

Schritt 2: Anforderungen ableiten
- Erstelle funktionale Anforderungen.
- Erstelle nicht-funktionale Anforderungen.
- Ordne die Anforderungen nach Must-have, Should-have und Could-have.
- Berücksichtige dabei die Bewertungskriterien des Prototyping-Projekts.

Schritt 3: Informationsarchitektur planen
- Plane Pages, Navigation, zentrale Workflows und User Journey.
- Beschreibe, welche Informationen auf welcher Page angezeigt oder bearbeitet werden.

Schritt 4: Datenmodell und technische Architektur planen
- Plane Datenmodell, Datenfluss, CRUD-Operationen und Ordnerstruktur.
- Entscheide eine geeignete Datenbank-/Storage-Lösung für einen stabilen Prototyp.
- Begründe technische Entscheidungen kurz.

Schritt 5: Umsetzungsplan erstellen
- Erstelle eine priorisierte Taskliste.
- Teile die Aufgaben in sinnvolle Entwicklungsetappen auf.
- Markiere, welche Tasks direkt zum Mindestumfang gehören und welche Erweiterungen sind.
- Schlage sinnvolle Git-Branches, Issues und Commit-Messages vor.

Schritt 6: README.md vorbereiten und pflegen
- Öffne oder erstelle die README.md anhand der Datei VORLAGE_README.md.
- Verändere die Kapitelstruktur nicht.
- Ergänze die Dokumentation laufend in den passenden Kapiteln.
- Verwende Platzhalter, wo Artefakte erst später entstehen, z. B. Figma-Link, Screenshots, Evaluationsergebnisse, Deployment-URL.
- Dokumentiere technische Entscheidungen, Designentscheidungen, Workflows, Datenmodell, Evaluation und KI-Nutzung.

Schritt 7: Erst nach Freigabe implementieren
- Implementiere noch keinen Code, bevor der Projektplan vollständig und logisch ist.
- Warte auf meine Bestätigung, bevor du mit der Umsetzung beginnst.

README-DOKUMENTATION

Die README.md muss nach der Vorlage gegliedert bleiben und mindestens folgende Inhalte enthalten:

1. Ausgangslage
   - Problem
   - Ziele
   - Zielgruppe
   - Stakeholder optional

2. Lösungsidee
   - Kernfunktionalität
   - Annahmen/Hypothesen
   - Abgrenzung

3. Vorgehen & Artefakte
   3.1 Understand & Define
   - Zielgruppenverständnis
   - Problemraumanalyse
   - Persona oder Proto-Persona
   - wesentliche Erkenntnisse

   3.2 Sketch
   - mehrere Varianten der Lösungsidee
   - Unterschiede der Varianten
   - Platzhalter für Skizzen

   3.3 Decide
   - gewählte Variante
   - Entscheidungskriterien
   - User Journey / End-to-End-Ablauf
   - Platzhalter für Mockup/Figma/Screenshots

   3.4 Prototype
   3.4.1 Entwurf / Design
   - Informationsarchitektur
   - UI Design
   - Designentscheidungen

   3.4.2 Umsetzung / Technik
   - Technologie-Stack
   - Tooling
   - Struktur & Komponenten
   - Daten & Schnittstellen
   - Deployment
   - besondere technische Entscheidungen

   3.5 Validate
   - getestete Version
   - Ziele der Prüfung
   - Vorgehen
   - Stichprobe
   - Testaufgaben
   - Kennzahlen & Beobachtungen
   - Resultate
   - abgeleitete Verbesserungen

4. Erweiterungen optional
   - Jede Erweiterung separat dokumentieren:
     - Beschreibung & Nutzen
     - Wo umgesetzt
     - Referenz
     - Aus Evaluation abgeleitet?

5. Projektorganisation optional
   - Repository-Struktur
   - Issue-Management
   - Commit-Praxis

6. KI-Deklaration
   - KI-Tools
   - Zweck & Umfang
   - eigene Leistung
   - Prompt-Vorgehen
   - Reflexion

7. Anhang optional
   - Quellen
   - Testskript
   - Rohdaten/Auswertung

QUALITÄTSREGELN

- Priorisiere einen stabilen, vollständigen MVP vor vielen Zusatzfeatures.
- Jede Funktion soll klar einem Workflow oder einer Anforderung dienen.
- Keine unnötig komplexe Architektur.
- Keine Dummy-App ohne echte Interaktion.
- Keine rein statischen Daten.
- Dokumentiere Entscheidungen direkt in der README.md.
- Verwende klare Dateinamen und sprechende Komponenten.
- Achte auf saubere, verständliche UI.
- Verwende realistische Seed-Daten passend zu San Diego, Reisen und Events.
- Achte auf Urheberrecht: keine ungeprüften fremden Bilder oder Assets ohne Lizenz.
- Falls externe Assets verwendet werden, dokumentiere Quelle und Lizenz im Anhang.
- Plane die Evaluation frühzeitig mit realistischen Testaufgaben.

AUSGABEFORMAT

Gib mir zuerst nur den Plan aus, nicht den Code.

Strukturiere deine Antwort wie folgt:

1. Zusammenfassung des Projektziels
2. MVP-Abgrenzung
3. Anforderungen nach Must-have / Should-have / Could-have
4. Pages und Workflows
5. Datenmodell
6. Technische Architektur
7. Komponentenstruktur
8. Umsetzungsroadmap
9. README-Dokumentationsplan
10. Risiken und Gegenmassnahmen
11. Offene Fragen an mich, falls zwingend nötig

Beginne jetzt mit dem Planmodus.
~~~~

## Prompt 3 — Claude-Code-Onboarding für Svelte-Projekt

**Kontext:** Übergabe eines bestehenden Svelte-Projekts von OpenAI Codex an Claude Code. Der Prompt erzwingt einen Planmodus und fokussiert auf Repository-Verständnis statt sofortiger Änderungen.

**Resultat:** Eine strukturierte Projektaufnahme mit Snapshot, übernommenen Konventionen, offenen Fragen, Entwurf für CLAUDE.md und Bereitschaft für erste Aufgaben.

**Interpretation:** Dieser Prompt ist sinnvoll nach Projektsetup oder bei Toolwechsel, damit ein neuer Coding-Assistent die Projektregeln versteht, bevor Änderungen vorgenommen werden.

**Originalprompt:**

~~~~text
# Role

You are taking over as the primary AI coding assistant for this Svelte
application, replacing OpenAI Codex. Start in **plan mode**. Do not edit,
create, or delete any files until the human has reviewed your plan and
explicitly approved it.

# Phase 1 — Read (plan mode, no edits)

Two files in this repository contain everything you need to onboard:

1. **`README.md`** — project overview, architecture, setup, scripts, intent.
2. **`codex_custom_instructions.md`** — the working agreement the team had
   with the previous assistant. Treat this as authoritative for conventions,
   workflow rules, and house style unless it conflicts with how Claude Code
   operates natively (flag those cases — see Phase 2).

Read both files **in full**. Then, only if the README leaves gaps, also scan:
- `package.json` (scripts, dependencies, package manager)
- `svelte.config.js`, `vite.config.*`, `tsconfig.json`
- `src/` top-level structure (routes, lib, components, stores, hooks)
- Any `AGENTS.md`, `CONTRIBUTING.md`, or `docs/` content

Do not run anything yet. Do not modify anything yet.

# Phase 2 — Report & Plan

Produce a single structured response with these sections:

### 1. Project Snapshot
- Stack (Svelte 3/4/5, runes vs. legacy, SvelteKit?, TS?, adapter, package manager)
- Test/lint/typecheck commands as defined by the project
- State management and data-loading patterns in use

### 2. Conventions Inherited from `codex_custom_instructions.md`
List the rules you will follow, grouped as:
- **Keep as-is** — applies cleanly to Claude Code
- **Translate** — Codex-specific phrasing or tool references that need
  reinterpretation (e.g., references to `apply_patch`, "respond with code
  only", specific Codex tool-call formats). State the Claude Code equivalent.
- **Flag for review** — anything ambiguous, outdated, or that conflicts
  with how Claude Code works best. Do not silently override; surface it.

### 3. Open Questions
Anything genuinely unclear that would affect your first edits. Keep this
short — one focused question per item, not a checklist of nice-to-haves.

### 4. Proposed `CLAUDE.md`
Draft a `CLAUDE.md` for the project root that consolidates:
- Tech stack and commands
- The kept + translated conventions from the Codex doc
- Svelte-specific gotchas relevant to this codebase
- Verification expectations (run `svelte-check`, tests, etc. before declaring done)

Keep it under ~100 lines. Show it as a fenced code block in your plan;
do not write the file yet.

### 5. First-Task Readiness
State explicitly: "Ready for first task — awaiting approval of plan and
`CLAUDE.md` draft, or revisions."

# Phase 3 — Exit Plan Mode (only after human approval)

Once the human approves:
1. Write `CLAUDE.md` to the project root.
2. Decide with the human whether `codex_custom_instructions.md` should be
   deleted, archived (e.g., moved to `docs/legacy/`), or kept in place.
3. Begin accepting tasks.

# Standing Operating Principles (apply once out of plan mode)

**Match the codebase, don't impose preferences.**
Svelte 4 reactive `$:` and stores vs. Svelte 5 runes — never mix paradigms in
one file. Match existing import aliases, naming, and CSS strategy.

**Edits, not rewrites.**
Smallest change that solves the problem. State scope before refactors.

**Verify before declaring done.**
Run typecheck, lint, and relevant tests. For UI changes, name the route and
the interaction to manually verify. No "should work" claims without evidence.

**Svelte-specific care.**
Reactivity bugs first suspect: rune vs. store, reassignment vs. mutation,
`$:` dependency tracking, `bind:` direction. SSR: guard browser APIs with
`browser` from `$app/environment`; secrets only in `+page.server.ts` /
`+server.ts`. Don't suppress a11y warnings without explanation.

**Stay in plan mode** for any change that touches more than ~3 files,
modifies public component APIs, alters route contracts, changes data shapes,
or adds dependencies. Get approval, then execute.

**Avoid:**
- Placeholder TODO stubs presented as completed work
- New dependencies without justification
- Reformatting files you aren't actively editing
- Destructive commands without explicit confirmation

---

Begin Phase 1 now. Read `README.md` and `codex_custom_instructions.md` and
report back per Phase 2. Stay in plan mode. 
~~~~

## Prompt 4 — UX-/Produktstrategie-Audit für Travel Web App

**Kontext:** Strategische UX-Analyse einer Travel-App aus Endnutzerperspektive. Der Prompt kombiniert UX Research, JTBD, CRO, Benchmarking, Accessibility und Mobile-First-Denken.

**Resultat:** Ein priorisierter UX- und Produktstrategie-Report mit Personas, Journey Maps, Feature-Audit, Wettbewerbsvergleich, Verbesserungen, neuen Features und Roadmap.

**Interpretation:** Dieser Prompt eignet sich, um TripTales oder eine vergleichbare Travel-App über den reinen MVP hinaus strategisch weiterzuentwickeln.

**Originalprompt:**

~~~~text
# ROLE
You are a senior product strategist and UX researcher with 10+ years of experience 
analyzing consumer travel platforms (e.g., Booking.com, Airbnb, Kayak, Hopper, 
Google Travel, Skyscanner, TripAdvisor). You combine expertise in:
- Behavioral UX research and jobs-to-be-done (JTBD) frameworks
- Conversion rate optimization (CRO) for travel funnels
- Competitive benchmarking in the OTA/travel-tech space
- Accessibility (WCAG 2.2) and inclusive design
- Mobile-first and cross-device user journeys

# OBJECTIVE
Analyze the travel web app described below from the end-user's perspective, 
identify friction points and opportunities, then deliver actionable improvements 
to existing features and well-justified proposals for new ones.

# INPUT
<app_context>
- App name / URL: [INSERT]
- Primary user segments: [e.g., leisure travelers, business travelers, families, solo backpackers]
- Core value proposition: [INSERT]
- Key existing features: [INSERT — e.g., flight search, hotel booking, itinerary builder]
- Known business goals / KPIs: [e.g., booking conversion, AOV, retention, NPS]
- Platforms supported: [web / iOS / Android / PWA]
- Known competitors: [INSERT]
- Constraints: [budget, tech stack, regulatory (GDPR, DSA), timeline]
</app_context>

<materials_provided>
[Screenshots, user flows, analytics excerpts, reviews, support tickets, etc. — 
or note "none provided; reason from publicly observable behavior and category norms"]
</materials_provided>

# METHODOLOGY — execute in this order

## 1. User & Context Modeling
- Define 3–5 distinct user personas with goals, pain points, and triggering 
  scenarios (the "job" they hire the app to do).
- Map the end-to-end journey for each: dream → research → compare → book → 
  pre-trip → in-trip → post-trip. Flag emotional highs/lows at each stage.

## 2. Heuristic & Experiential Audit (current state)
For each existing feature, evaluate against:
- Nielsen's 10 heuristics + travel-specific heuristics (price transparency, 
  trust signals, cancellation clarity, loading-state honesty)
- Cognitive load and decision-fatigue risks (paradox of choice in search results)
- Trust & safety cues (reviews authenticity, secure payment, refund clarity)
- Accessibility (keyboard nav, color contrast, screen reader, reduced-motion)
- Mobile ergonomics (thumb zones, one-handed use, offline behavior)
- Performance perception (skeleton states, time-to-first-result)

Output a table:
| Feature | What works | Friction / Risk | Severity (1–5) | Evidence/Reasoning |

## 3. Competitive & Trend Benchmark
- Identify 3–5 patterns competitors execute better, with specifics.
- Flag emerging travel-UX trends relevant here (AI trip planning, 
  flexible-date heatmaps, group decision tools, sustainability filters, 
  visual/voice search, dynamic packaging, real-time disruption handling).

## 4. Improvements to Existing Features
For each high-severity issue, propose a concrete fix. Use this format:
- **Issue:** [one sentence]
- **Proposed change:** [specific, implementable]
- **User benefit:** [what changes for the user]
- **Business impact hypothesis:** [metric → expected direction]
- **Effort:** S / M / L
- **Risks / dependencies:** [edge cases, ethical considerations]

## 5. New Feature Proposals
Propose 3–6 net-new features. For each, include:
- Problem it solves (with the persona it serves)
- Description and core interaction
- Why now (market/trend/technical enabler)
- Success metrics (leading + lagging)
- MVP scope vs. v2 scope
- Build-vs-partner consideration

## 6. Prioritization
Plot all recommendations on an Impact × Effort matrix. Then produce a 
sequenced roadmap: Now (0–3 mo) / Next (3–9 mo) / Later (9+ mo).
Justify the ordering — what unlocks what.

## 7. Risks, Ethics & Open Questions
- Privacy, dark-pattern avoidance, fairness in pricing/ranking, 
  inclusive imagery, accessibility regression risk.
- List the top 5 unknowns you'd validate with research before building 
  (and which method: usability test, survey, A/B, log analysis).

# OUTPUT REQUIREMENTS
- Lead with a 5-bullet executive summary (the "so what").
- Use tables where comparison helps; otherwise prose.
- Be specific — name the screen, the element, the copy. Avoid generic advice 
  like "improve onboarding."
- When you make claims, mark them as [observed], [inferred], or [hypothesis] 
  so the team knows what to validate.
- Note assumptions explicitly. If information is missing, state what you'd 
  need and proceed with the most reasonable assumption.
- Keep recommendations technology-aware but not technology-prescriptive 
  unless asked.

# TONE
Direct, evidence-led, charitable to the existing team. Critique features, 
not people. Distinguish strong opinions from speculation.
~~~~

## Prompt 5 — Usability-Test-Auswertung TripTales, Variante A

**Kontext:** Auswertung zweier ausgefüllter Usability-Test-Dokumente für TripTales. Diese Variante endet direkt mit der Ankündigung der Testdokumente.

**Resultat:** Ein vollständiger Usability-Analysebericht mit Vollständigkeitsprüfung, Einzelanalysen, Issue-Liste, Severity-Bewertung, Team-Rückblick, Testreport und nächstem Aktionsplan.

**Interpretation:** Dieser Prompt ist für die Validate-Phase geeignet und unterstützt eine saubere, belegbasierte Auswertung von Usability-Tests.

**Originalprompt:**

~~~~text
Du bist ein erfahrener UX-Researcher, Usability-Testing-Experte und Prompting-Spezialist.

Ich gebe dir zwei ausgefüllte Usability-Test-Dokumente zur Webapp „TripTales“. Beide Tests basieren auf demselben Moderationsbogen mit 8 Aufgaben, Beobachtungsnotizen, Kurzfragen nach jeder Aufgabe, Abschlussinterview und kompakter Auswertungsübersicht.

Deine Aufgabe ist es, die beiden ausgefüllten Testdokumente professionell zu analysieren, fehlende Angaben soweit möglich zu ergänzen, Usability-Probleme systematisch zu identifizieren, ihren Schweregrad zu bewerten und danach das weitere Vorgehen nach UX-Research-Best-Practice zu planen.

Wichtige Regeln:
- Erfinde keine Beobachtungen, Zitate, Zeiten oder Testergebnisse.
- Ergänze nur, was logisch aus vorhandenen Angaben ableitbar ist.
- Wenn Informationen fehlen, markiere sie klar als „nicht dokumentiert“, „unklar“ oder „muss nacherhoben werden“.
- Trenne strikt zwischen Beobachtung, Interpretation, vermuteter Ursache und Empfehlung.
- Analysiere beide Testpersonen zuerst einzeln und führe die Ergebnisse danach zusammen.
- Berücksichtige, dass Usability-Probleme während oder nach dem Test sichtbar werden können: verbal, non-verbal oder durch Beobachtung.
- Achte besonders auf Frustration, Verwirrung, Suchverhalten, falsche Eingaben, Abbrüche, Missverständnisse, fehlende Orientierung, unklare Begriffe, unklare Fehlermeldungen und Datenschutz-/Sharing-Verständnis.
- Priorisiere Probleme nach Auswirkung auf die Zielerreichung.
- Datenschutz-, Sharing- und Zugriffskontrollprobleme sind besonders kritisch zu bewerten.

Definition:
Ein Usability-Problem liegt vor, wenn Aspekte des Systems es Nutzenden mit hinreichender Domänenerfahrung unangenehm, ineffizient, beschwerlich oder unmöglich machen, in einem typischen Anwendungskontext die Ziele zu erreichen, für deren Erreichung das System erstellt wurde.

Schweregrad-Skala:
0 = Kein Problem  
1 = Kosmetisches Problem: nur beheben, wenn sonst keine Arbeit im Projekt anfällt  
2 = Kleines Problem: mit tiefer Priorität angehen  
3 = Grosses Problem: sollte behoben werden, hohe Priorität  
4 = Usability-Katastrophe: muss zwingend behoben werden, andernfalls ist ein Release nicht möglich  

Berücksichtige beim Schweregrad:
- Wie häufig tritt das Problem auf?
- Wie schwierig ist es für die Testperson, das Problem zu überwinden?
- Kann die Testperson das Problem selbst beheben?
- Führt das Problem zum Abbruch?
- Verhindert das Problem ein zentrales Ziel?
- Betrifft das Problem Datenschutz, Teilen oder Zugriffskontrolle?
- Ist das Problem nur störend oder verhindert es die Nutzung?

Analysiere die Dokumente in folgender Struktur:

1. Kurzfazit nach zwei Tests

Fasse kompakt zusammen:
- Gesamteindruck der Bedienbarkeit von TripTales
- wichtigste positive Beobachtungen
- wichtigste Usability-Probleme
- Aufgaben mit hoher Erfolgsquote
- Aufgaben mit vielen Problemen
- ob die zentralen Funktionen grundsätzlich verstanden wurden
- ob weitere Tests nötig sind
- ob vor weiteren Tests zuerst UI-Anpassungen empfohlen werden

2. Vollständigkeitsprüfung beider Testdokumente

Prüfe für Testperson 1 und Testperson 2 getrennt, ob folgende Bereiche vollständig dokumentiert sind:
- Startzeit und Endzeit je Aufgabe
- Erfolg je Aufgabe
- Notizen / Zitate je Aufgabe
- Antworten auf Kurzfragen
- Abschlussinterview
- kompakte Auswertungsübersicht

Erstelle eine Tabelle:

| Bereich | Testperson | Status | Fehlende Information | Empfehlung zur Ergänzung |

Statuswerte:
- vollständig
- teilweise
- fehlt
- unklar

Wenn Angaben fehlen, formuliere konkrete Rückfragen an die Testleitung oder Testperson.

3. Einzelanalyse pro Testperson

Analysiere zuerst Testperson 1 und danach Testperson 2.

Für jede der 8 Aufgaben:
- Ziel der Aufgabe
- dokumentierter Erfolg: Ja / Teilweise / Nein / Unklar
- benötigte Zeit, falls dokumentiert
- beobachtetes Verhalten
- zentrale Probleme
- positive Beobachtungen
- relevante Zitate oder Notizen
- mögliche Ursache
- UX-Implikation
- konkrete Verbesserungsempfehlung
- Schweregrad des Problems

Bewerte insbesondere:
- Konnte die Aufgabe ohne Hilfe abgeschlossen werden?
- War der Einstieg in die Funktion klar?
- Waren Begriffe, Labels oder englische UI-Texte verständlich?
- War nach Aktionen klar, ob etwas gespeichert, geteilt, eingeladen oder abgeschlossen wurde?
- Entsprach das Ergebnis der Erwartung der Testperson?

4. Konsolidierte Aufgabenanalyse über beide Tests

Führe die Ergebnisse beider Testpersonen zusammen.

Erstelle eine Tabelle:

| Aufgabe | Erfolg Testperson 1 | Erfolg Testperson 2 | Gemeinsame Muster | Unterschiede | Hauptproblem | Positiv | Priorität |

Analysiere danach:
- Welche Aufgaben waren für beide einfach?
- Welche Aufgaben waren für beide schwierig?
- Wo unterscheiden sich die Testpersonen stark?
- Welche Probleme traten nur einmal auf?
- Welche Probleme traten mehrfach auf?
- Welche Aufgaben sollten im Produkt zuerst verbessert werden?

5. Identifikation aller Usability-Probleme

Extrahiere alle erkennbaren Usability-Probleme aus beiden Tests.

Ein Usability-Problem kann zum Beispiel sein:
- Begriff wurde falsch verstanden
- Fehlermeldung wurde nicht gesehen
- Daten wurden falsch eingegeben
- Workflow wurde abgebrochen
- Problem konnte nicht korrigiert werden
- wichtige Information konnte nicht gefunden werden
- Navigation war unklar
- Funktion wurde nicht gefunden
- Speicherstatus war unklar
- Datenschutz- oder Sharing-Wirkung wurde falsch verstanden
- Unterschied zwischen Aktivität, Idee, Erinnerung und Trip war unklar

Erstelle eine Tabelle:

| Issue-ID | Usability-Problem | Betroffene Aufgabe(n) | Testperson(en) | Beobachtung / Evidenz | Vermutete Ursache | Auswirkung | Empfehlung |

Issue-IDs im Format:
- ISSUE-01
- ISSUE-02
- ISSUE-03

6. Beschreibung jedes Usability-Problems im Testreport-Format

Beschreibe jedes identifizierte Usability-Problem nach folgendem Schema:

| Attribut | Beschreibung |
|---|---|
| Ort | Wo tritt das Problem auf? |
| Problem | Was genau ist passiert? |
| Ursache | Warum könnte das Problem entstanden sein? |
| Empfehlung | Was sollte verbessert werden? |
| Szenario | In welcher Aufgabe / welchem Szenario trat es auf? |
| Schweregrad | Bewertung von 0 bis 4 |
| Testperson(en) | Welche Testperson(en) waren betroffen? |
| Evidenz | Zitat, Beobachtung oder Notiz |

Wichtig:
- Wenn kein Screenshot vorhanden ist, schreibe „Screenshot nicht vorhanden“.
- Wenn die Ursache nicht sicher ist, schreibe „vermutete Ursache“.
- Wenn keine Empfehlung ableitbar ist, schreibe „Empfehlung im Team diskutieren“.

7. Priorisierte Severity-Tabelle

Erstelle eine priorisierte Liste aller Issues:

| Rang | Issue-ID | Problem | Betroffene Aufgabe(n) | Häufigkeit | Schweregrad | Begründung | Empfohlene Massnahme |

Sortiere die Issues nach:
1. Schweregrad
2. Häufigkeit
3. Einfluss auf zentrale Nutzung
4. Risiko für Datenschutz oder Vertrauen
5. Aufwand der Behebung

8. Issue Map nach zwei Tests

Erstelle eine textuelle Issue Map als Grundlage für ein Team-Board.

Gruppiere die Issues nach Themenbereichen, zum Beispiel:
- Zugang / Login / Registrierung
- Aktivität erfassen
- Wiederholungen / Termine
- Erinnerung / Foto / Tagebuch
- Idee ohne Datum
- Einladen anderer Personen
- Trip-Gruppierung
- Teilen / Datenschutz / Link-Gültigkeit
- Sprache / Begriffe
- Feedback / Systemstatus
- Navigation / Auffindbarkeit

Für jedes Thema:
- zugehörige Issue-IDs
- kurze Beschreibung
- betroffene Testperson(en)
- Priorität
- empfohlene nächste Aktion

Erstelle zusätzlich eine Matrix:

| Issue-ID | Häufigkeit: Einzelfall / Mehrfach beobachtet | Auswirkung: Niedrig / Mittel / Hoch / Kritisch | Einordnung |

9. Rückblick im Team

Bereite einen strukturierten Rückblick für das Projektteam vor.

Der Rückblick soll enthalten:
- Zusammenfassung der Ergebnisse aus beiden Tests
- Welche Probleme waren erwartet?
- Welche Probleme waren überraschend?
- Welche Annahmen über die Nutzerführung wurden bestätigt?
- Welche Annahmen wurden widerlegt?
- Welche Funktionen wurden gut verstanden?
- Welche Funktionen müssen überarbeitet werden?
- Welche offenen Fragen bleiben bestehen?

10. Bewertung der Issues im Team

Bereite eine Tabelle vor, mit der das Team jedes Issue bewerten kann.

Für jedes Issue soll das Team entscheiden können:

Option A: Nichts ändern  
Option B: Archivieren  
Option C: Ändern gemäss bestehender Empfehlung  
Option D: Ändern, aber nicht mit bestehender Empfehlung  
Option E: Weiter untersuchen  

Erstelle dazu eine Tabelle:

| Issue-ID | Problem | Empfehlung aus Analyse | Team-Entscheidung | Begründung | Verantwortlich | Nächster Schritt |

Die Spalten „Team-Entscheidung“, „Begründung“ und „Verantwortlich“ dürfen leer bleiben, falls sie erst im Teammeeting ausgefüllt werden sollen.

11. Finale Priorisierung

Priorisiere alle Issues in folgende Stufen:

- P1: sofort beheben
- P2: kurzfristig beheben
- P3: später verbessern
- P4: beobachten / archivieren

Erstelle eine Tabelle:

| Priorität | Issue-ID | Problem | Warum priorisiert? | Aufwand | Nächste Massnahme |

12. Diskussion alternativer Lösungen

Für alle Issues mit hoher Priorität oder unklarer Lösung:
- Beschreibe mindestens zwei mögliche Lösungsansätze.
- Vergleiche Vor- und Nachteile.
- Gib eine Empfehlung ab.
- Markiere, wenn ein Prototyp oder A/B-Test sinnvoll wäre.

Tabelle:

| Issue-ID | Lösungsansatz 1 | Lösungsansatz 2 | Vorteile | Nachteile | Empfehlung |

13. Testreport für Abgabe oder Dokumentation

Erstelle einen strukturierten Testreport mit folgenden Teilen:

1. Ziel des Tests  
2. Testaufbau  
3. Anzahl Testpersonen  
4. Kurzbeschreibung der Testpersonen, sofern dokumentiert  
5. Aufgaben / Szenarien  
6. Wichtigste Beobachtungen  
7. Usability-Probleme  
8. Schweregradbewertung  
9. Empfehlungen  
10. Limitationen der Tests  
11. Nächste Schritte  

Wichtig:
- Der Testreport soll nachvollziehbar genug sein, damit der Test später wiederholt werden könnte.
- Verwende eine sachliche Sprache.
- Keine unbelegten Behauptungen.
- Fehlende Daten klar kennzeichnen.

14. Konkreter Aktionsplan nach zwei Tests

Plane das weitere Vorgehen nach Best Practice.

Erstelle eine Tabelle:

| Schritt | Ziel | Verantwortlichkeit | Output | Priorität | Zeitpunkt |

Der Aktionsplan soll mindestens enthalten:
- Testergebnisse zusammenführen
- Issue Map erstellen
- Issues im Team bewerten
- Schweregrad final festlegen
- Quick Wins identifizieren
- kritische UX-Probleme beheben
- offene Fragen klären
- UI-Prototyp anpassen
- erneuten Usability-Test planen
- Metriken für nächsten Test definieren

15. Metriken für den nächsten Test

Empfiehl, welche Metriken beim nächsten Usability-Test systematisch erhoben werden sollten:

- Erfolgsquote pro Aufgabe
- Zeit pro Aufgabe
- Anzahl Fehlklicks oder Umwege
- Anzahl Hilfestellungen
- Abbruchrate
- wahrgenommene Schwierigkeit pro Aufgabe
- Verständnis von Begriffen
- Vertrauen in Sharing- und Datenschutzfunktionen
- subjektiver Gesamteindruck
- wichtigste Zitate

16. Management-Zusammenfassung

Erstelle zum Schluss eine Management-Zusammenfassung mit maximal 10 Bulletpoints.

Sie soll direkt in eine Präsentation übernommen werden können und enthalten:
- wichtigste Erkenntnisse
- kritischste Probleme
- wichtigste Empfehlungen
- nächster sinnvoller Schritt

Hier sind die zwei ausgefüllten Testdokumente:
~~~~

## Prompt 6 — Usability-Test-Auswertung TripTales, Variante B mit Platzhaltern

**Kontext:** Auswertung zweier ausgefüllter Usability-Test-Dokumente für TripTales. Diese Variante enthält zusätzlich konkrete Platzhalter für Testdokument 1 und 2.

**Resultat:** Ein vollständiger Usability-Analysebericht auf Basis der eingefügten Testdokumente.

**Interpretation:** Diese Variante ist praktisch, wenn der Prompt als wiederverwendbare Vorlage genutzt werden soll, in die Testdokumente direkt eingefügt werden.

**Originalprompt:**

~~~~text
Du bist ein erfahrener UX-Researcher, Usability-Testing-Experte und Prompting-Spezialist.

Ich gebe dir zwei ausgefüllte Usability-Test-Dokumente zur Webapp „TripTales“. Beide Tests basieren auf demselben Moderationsbogen mit 8 Aufgaben, Beobachtungsnotizen, Kurzfragen nach jeder Aufgabe, Abschlussinterview und kompakter Auswertungsübersicht.

Deine Aufgabe ist es, die beiden ausgefüllten Testdokumente professionell zu analysieren, fehlende Angaben soweit möglich zu ergänzen, Usability-Probleme systematisch zu identifizieren, ihren Schweregrad zu bewerten und danach das weitere Vorgehen nach UX-Research-Best-Practice zu planen.

Wichtige Regeln:
- Erfinde keine Beobachtungen, Zitate, Zeiten oder Testergebnisse.
- Ergänze nur, was logisch aus vorhandenen Angaben ableitbar ist.
- Wenn Informationen fehlen, markiere sie klar als „nicht dokumentiert“, „unklar“ oder „muss nacherhoben werden“.
- Trenne strikt zwischen Beobachtung, Interpretation, vermuteter Ursache und Empfehlung.
- Analysiere beide Testpersonen zuerst einzeln und führe die Ergebnisse danach zusammen.
- Berücksichtige, dass Usability-Probleme während oder nach dem Test sichtbar werden können: verbal, non-verbal oder durch Beobachtung.
- Achte besonders auf Frustration, Verwirrung, Suchverhalten, falsche Eingaben, Abbrüche, Missverständnisse, fehlende Orientierung, unklare Begriffe, unklare Fehlermeldungen und Datenschutz-/Sharing-Verständnis.
- Priorisiere Probleme nach Auswirkung auf die Zielerreichung.
- Datenschutz-, Sharing- und Zugriffskontrollprobleme sind besonders kritisch zu bewerten.

Definition:
Ein Usability-Problem liegt vor, wenn Aspekte des Systems es Nutzenden mit hinreichender Domänenerfahrung unangenehm, ineffizient, beschwerlich oder unmöglich machen, in einem typischen Anwendungskontext die Ziele zu erreichen, für deren Erreichung das System erstellt wurde.

Schweregrad-Skala:
0 = Kein Problem  
1 = Kosmetisches Problem: nur beheben, wenn sonst keine Arbeit im Projekt anfällt  
2 = Kleines Problem: mit tiefer Priorität angehen  
3 = Grosses Problem: sollte behoben werden, hohe Priorität  
4 = Usability-Katastrophe: muss zwingend behoben werden, andernfalls ist ein Release nicht möglich  

Berücksichtige beim Schweregrad:
- Wie häufig tritt das Problem auf?
- Wie schwierig ist es für die Testperson, das Problem zu überwinden?
- Kann die Testperson das Problem selbst beheben?
- Führt das Problem zum Abbruch?
- Verhindert das Problem ein zentrales Ziel?
- Betrifft das Problem Datenschutz, Teilen oder Zugriffskontrolle?
- Ist das Problem nur störend oder verhindert es die Nutzung?

Analysiere die Dokumente in folgender Struktur:

1. Kurzfazit nach zwei Tests

Fasse kompakt zusammen:
- Gesamteindruck der Bedienbarkeit von TripTales
- wichtigste positive Beobachtungen
- wichtigste Usability-Probleme
- Aufgaben mit hoher Erfolgsquote
- Aufgaben mit vielen Problemen
- ob die zentralen Funktionen grundsätzlich verstanden wurden
- ob weitere Tests nötig sind
- ob vor weiteren Tests zuerst UI-Anpassungen empfohlen werden

2. Vollständigkeitsprüfung beider Testdokumente

Prüfe für Testperson 1 und Testperson 2 getrennt, ob folgende Bereiche vollständig dokumentiert sind:
- Startzeit und Endzeit je Aufgabe
- Erfolg je Aufgabe
- Notizen / Zitate je Aufgabe
- Antworten auf Kurzfragen
- Abschlussinterview
- kompakte Auswertungsübersicht

Erstelle eine Tabelle:

| Bereich | Testperson | Status | Fehlende Information | Empfehlung zur Ergänzung |

Statuswerte:
- vollständig
- teilweise
- fehlt
- unklar

Wenn Angaben fehlen, formuliere konkrete Rückfragen an die Testleitung oder Testperson.

3. Einzelanalyse pro Testperson

Analysiere zuerst Testperson 1 und danach Testperson 2.

Für jede der 8 Aufgaben:
- Ziel der Aufgabe
- dokumentierter Erfolg: Ja / Teilweise / Nein / Unklar
- benötigte Zeit, falls dokumentiert
- beobachtetes Verhalten
- zentrale Probleme
- positive Beobachtungen
- relevante Zitate oder Notizen
- mögliche Ursache
- UX-Implikation
- konkrete Verbesserungsempfehlung
- Schweregrad des Problems

Bewerte insbesondere:
- Konnte die Aufgabe ohne Hilfe abgeschlossen werden?
- War der Einstieg in die Funktion klar?
- Waren Begriffe, Labels oder englische UI-Texte verständlich?
- War nach Aktionen klar, ob etwas gespeichert, geteilt, eingeladen oder abgeschlossen wurde?
- Entsprach das Ergebnis der Erwartung der Testperson?

4. Konsolidierte Aufgabenanalyse über beide Tests

Führe die Ergebnisse beider Testpersonen zusammen.

Erstelle eine Tabelle:

| Aufgabe | Erfolg Testperson 1 | Erfolg Testperson 2 | Gemeinsame Muster | Unterschiede | Hauptproblem | Positiv | Priorität |

Analysiere danach:
- Welche Aufgaben waren für beide einfach?
- Welche Aufgaben waren für beide schwierig?
- Wo unterscheiden sich die Testpersonen stark?
- Welche Probleme traten nur einmal auf?
- Welche Probleme traten mehrfach auf?
- Welche Aufgaben sollten im Produkt zuerst verbessert werden?

5. Identifikation aller Usability-Probleme

Extrahiere alle erkennbaren Usability-Probleme aus beiden Tests.

Ein Usability-Problem kann zum Beispiel sein:
- Begriff wurde falsch verstanden
- Fehlermeldung wurde nicht gesehen
- Daten wurden falsch eingegeben
- Workflow wurde abgebrochen
- Problem konnte nicht korrigiert werden
- wichtige Information konnte nicht gefunden werden
- Navigation war unklar
- Funktion wurde nicht gefunden
- Speicherstatus war unklar
- Datenschutz- oder Sharing-Wirkung wurde falsch verstanden
- Unterschied zwischen Aktivität, Idee, Erinnerung und Trip war unklar

Erstelle eine Tabelle:

| Issue-ID | Usability-Problem | Betroffene Aufgabe(n) | Testperson(en) | Beobachtung / Evidenz | Vermutete Ursache | Auswirkung | Empfehlung |

Issue-IDs im Format:
- ISSUE-01
- ISSUE-02
- ISSUE-03

6. Beschreibung jedes Usability-Problems im Testreport-Format

Beschreibe jedes identifizierte Usability-Problem nach folgendem Schema:

| Attribut | Beschreibung |
|---|---|
| Ort | Wo tritt das Problem auf? |
| Problem | Was genau ist passiert? |
| Ursache | Warum könnte das Problem entstanden sein? |
| Empfehlung | Was sollte verbessert werden? |
| Szenario | In welcher Aufgabe / welchem Szenario trat es auf? |
| Schweregrad | Bewertung von 0 bis 4 |
| Testperson(en) | Welche Testperson(en) waren betroffen? |
| Evidenz | Zitat, Beobachtung oder Notiz |

Wichtig:
- Wenn kein Screenshot vorhanden ist, schreibe „Screenshot nicht vorhanden“.
- Wenn die Ursache nicht sicher ist, schreibe „vermutete Ursache“.
- Wenn keine Empfehlung ableitbar ist, schreibe „Empfehlung im Team diskutieren“.

7. Priorisierte Severity-Tabelle

Erstelle eine priorisierte Liste aller Issues:

| Rang | Issue-ID | Problem | Betroffene Aufgabe(n) | Häufigkeit | Schweregrad | Begründung | Empfohlene Massnahme |

Sortiere die Issues nach:
1. Schweregrad
2. Häufigkeit
3. Einfluss auf zentrale Nutzung
4. Risiko für Datenschutz oder Vertrauen
5. Aufwand der Behebung

8. Issue Map nach zwei Tests

Erstelle eine textuelle Issue Map als Grundlage für ein Team-Board.

Gruppiere die Issues nach Themenbereichen, zum Beispiel:
- Zugang / Login / Registrierung
- Aktivität erfassen
- Wiederholungen / Termine
- Erinnerung / Foto / Tagebuch
- Idee ohne Datum
- Einladen anderer Personen
- Trip-Gruppierung
- Teilen / Datenschutz / Link-Gültigkeit
- Sprache / Begriffe
- Feedback / Systemstatus
- Navigation / Auffindbarkeit

Für jedes Thema:
- zugehörige Issue-IDs
- kurze Beschreibung
- betroffene Testperson(en)
- Priorität
- empfohlene nächste Aktion

Erstelle zusätzlich eine Matrix:

| Issue-ID | Häufigkeit: Einzelfall / Mehrfach beobachtet | Auswirkung: Niedrig / Mittel / Hoch / Kritisch | Einordnung |

9. Rückblick im Team

Bereite einen strukturierten Rückblick für das Projektteam vor.

Der Rückblick soll enthalten:
- Zusammenfassung der Ergebnisse aus beiden Tests
- Welche Probleme waren erwartet?
- Welche Probleme waren überraschend?
- Welche Annahmen über die Nutzerführung wurden bestätigt?
- Welche Annahmen wurden widerlegt?
- Welche Funktionen wurden gut verstanden?
- Welche Funktionen müssen überarbeitet werden?
- Welche offenen Fragen bleiben bestehen?

10. Bewertung der Issues im Team

Bereite eine Tabelle vor, mit der das Team jedes Issue bewerten kann.

Für jedes Issue soll das Team entscheiden können:

Option A: Nichts ändern  
Option B: Archivieren  
Option C: Ändern gemäss bestehender Empfehlung  
Option D: Ändern, aber nicht mit bestehender Empfehlung  
Option E: Weiter untersuchen  

Erstelle dazu eine Tabelle:

| Issue-ID | Problem | Empfehlung aus Analyse | Team-Entscheidung | Begründung | Verantwortlich | Nächster Schritt |

Die Spalten „Team-Entscheidung“, „Begründung“ und „Verantwortlich“ dürfen leer bleiben, falls sie erst im Teammeeting ausgefüllt werden sollen.

11. Finale Priorisierung

Priorisiere alle Issues in folgende Stufen:

- P1: sofort beheben
- P2: kurzfristig beheben
- P3: später verbessern
- P4: beobachten / archivieren

Erstelle eine Tabelle:

| Priorität | Issue-ID | Problem | Warum priorisiert? | Aufwand | Nächste Massnahme |

12. Diskussion alternativer Lösungen

Für alle Issues mit hoher Priorität oder unklarer Lösung:
- Beschreibe mindestens zwei mögliche Lösungsansätze.
- Vergleiche Vor- und Nachteile.
- Gib eine Empfehlung ab.
- Markiere, wenn ein Prototyp oder A/B-Test sinnvoll wäre.

Tabelle:

| Issue-ID | Lösungsansatz 1 | Lösungsansatz 2 | Vorteile | Nachteile | Empfehlung |

13. Testreport für Abgabe oder Dokumentation

Erstelle einen strukturierten Testreport mit folgenden Teilen:

1. Ziel des Tests  
2. Testaufbau  
3. Anzahl Testpersonen  
4. Kurzbeschreibung der Testpersonen, sofern dokumentiert  
5. Aufgaben / Szenarien  
6. Wichtigste Beobachtungen  
7. Usability-Probleme  
8. Schweregradbewertung  
9. Empfehlungen  
10. Limitationen der Tests  
11. Nächste Schritte  

Wichtig:
- Der Testreport soll nachvollziehbar genug sein, damit der Test später wiederholt werden könnte.
- Verwende eine sachliche Sprache.
- Keine unbelegten Behauptungen.
- Fehlende Daten klar kennzeichnen.

14. Konkreter Aktionsplan nach zwei Tests

Plane das weitere Vorgehen nach Best Practice.

Erstelle eine Tabelle:

| Schritt | Ziel | Verantwortlichkeit | Output | Priorität | Zeitpunkt |

Der Aktionsplan soll mindestens enthalten:
- Testergebnisse zusammenführen
- Issue Map erstellen
- Issues im Team bewerten
- Schweregrad final festlegen
- Quick Wins identifizieren
- kritische UX-Probleme beheben
- offene Fragen klären
- UI-Prototyp anpassen
- erneuten Usability-Test planen
- Metriken für nächsten Test definieren

15. Metriken für den nächsten Test

Empfiehl, welche Metriken beim nächsten Usability-Test systematisch erhoben werden sollten:

- Erfolgsquote pro Aufgabe
- Zeit pro Aufgabe
- Anzahl Fehlklicks oder Umwege
- Anzahl Hilfestellungen
- Abbruchrate
- wahrgenommene Schwierigkeit pro Aufgabe
- Verständnis von Begriffen
- Vertrauen in Sharing- und Datenschutzfunktionen
- subjektiver Gesamteindruck
- wichtigste Zitate

16. Management-Zusammenfassung

Erstelle zum Schluss eine Management-Zusammenfassung mit maximal 10 Bulletpoints.

Sie soll direkt in eine Präsentation übernommen werden können und enthalten:
- wichtigste Erkenntnisse
- kritischste Probleme
- wichtigste Empfehlungen
- nächster sinnvoller Schritt

Hier sind die zwei ausgefüllten Testdokumente:

[TESTDOKUMENT 1 HIER EINFÜGEN]

[TESTDOKUMENT 2 HIER EINFÜGEN]
~~~~

## Prompt 7 — Bug-Audit und Dead-Code-Bereinigung für Svelte-Projekt

**Kontext:** Qualitätssicherungsphase für ein Svelte-Projekt. Der Prompt verlangt ein mehrphasiges Audit ohne sofortige Änderungen.

**Resultat:** Drei Audit-Berichte zu Projektstruktur, Bugs und Dead Code, bevor nach Freigabe gezielte Fixes umgesetzt werden.

**Interpretation:** Dieser Prompt eignet sich gegen Ende der Entwicklung oder vor Abgabe/Release, um technische Qualität und Wartbarkeit strukturiert zu prüfen.

**Originalprompt:**

~~~~text
# Auftrag: Vollständiger Bug-Audit und Dead-Code-Bereinigung

Du agierst als **Senior Svelte Auditor**. Dein Job ist es, dieses Projekt systematisch auf Bugs zu prüfen und Code-Leichen zu identifizieren — **nicht zu hektisch zu reparieren**. Qualität schlägt Geschwindigkeit. Lieber 30 Minuten gründlich analysieren als 5 Minuten oberflächlich patchen.

## Grundregeln (NICHT verhandelbar)

1. **In Phase 1 und 2 wird NICHTS geändert.** Du erstellst nur Berichte. Erst nach meiner Freigabe wird modifiziert.
2. **Keine Annahmen ohne Beleg.** Wenn du etwas vermutest, verifiziere es per `grep`/`rg`/Lesen der Datei. Markiere Unsicherheiten explizit als `VERMUTUNG` vs. `VERIFIZIERT`.
3. **Kein Halluzinieren von Bugs.** Jeder gemeldete Bug braucht: Datei + Zeilennummer + reproduzierbares Szenario + warum es ein Bug ist.
4. **Kein voreiliges Löschen.** "Sieht ungenutzt aus" ≠ "ist ungenutzt". Svelte hat dynamische Imports, Slot-Props, Stores, `$:`-Reaktivität, `bind:`-Direktiven — viele davon entgehen statischen Linters.
5. **Wenn du etwas nicht weißt, sag es.** Erfinde keine Versionen, Konfigs oder Dateipfade.

---

## Phase 1: Reconnaissance (nur lesen, nichts ändern)

Verschaffe dir einen Überblick. Erstelle am Ende dieser Phase die Datei `AUDIT_RECON.md`.

### 1.1 Projektstruktur
- Lies `package.json`, `svelte.config.js`, `vite.config.*`, `tsconfig.json`, `.eslintrc*`, `.prettierrc*`
- Bestimme: Svelte 3, 4 oder 5? SvelteKit ja/nein? TypeScript ja/nein? Welcher Bundler? Welche Test-Tools?
- Liste alle `dependencies` und `devDependencies` mit Versionen
- Identifiziere die Einstiegspunkte (`src/app.html`, `src/routes/+page.svelte`, `src/main.ts`, etc.)

### 1.2 Inventar
- Zähle: `.svelte`-Dateien, `.ts`/`.js`-Dateien, `+page.svelte`, `+layout.svelte`, `+server.ts`, `*.test.*`
- Gibt es einen `lib/`-Ordner? Stores? Components? Utils?
- Existieren Build-Artefakte im Repo (`dist/`, `build/`, `.svelte-kit/`), die nicht ins Repo gehören?

### 1.3 Tooling-Check
- Existieren `svelte-check`, `eslint`, `tsc`? Ausgaben sammeln (NICHT ausführen, falls Netzwerk/Install nötig — nur prüfen ob die Tools installiert sind).
- Liste die vorhandenen npm-Scripts.

**Output: `AUDIT_RECON.md`** — kompakt, faktisch, ohne Bewertung.

---

## Phase 2: Bug-Audit (nur lesen, nichts ändern)

Erstelle `AUDIT_BUGS.md` mit folgenden Kategorien. Jeder Fund hat: **Schweregrad (CRITICAL/HIGH/MEDIUM/LOW/NIT)**, Datei:Zeile, Beschreibung, Reproschritte/Beleg, Empfehlung.

### 2.1 Statische Analyse ausführen (lesend)
Führe aus, sofern verfügbar:
- `npx svelte-check --output human` — sammle alle Warnings/Errors
- `npx tsc --noEmit` (falls TS) — Type-Errors
- `npx eslint . --ext .js,.ts,.svelte` — Linting
Kopiere die Ausgaben unverändert in einen Anhang am Ende von `AUDIT_BUGS.md`.

### 2.2 Manuelle Prüfung — Svelte-spezifische Fallen
Suche gezielt nach diesen typischen Fehlerquellen:

- **Reaktivität**: `$:`-Statements, die Variablen nicht korrekt tracken, Mutationen statt Reassignments (`array.push(x)` statt `array = [...array, x]`)
- **Stores**: `$store`-Auto-Subscriptions in Modulen statt Components, vergessene `unsubscribe`, Stores in `onMount` ohne Cleanup
- **Memory Leaks**: `setInterval`/`setTimeout`/`addEventListener` ohne `onDestroy`-Cleanup
- **`bind:`-Probleme**: Two-way bindings auf Props ohne `export let`, Bindings auf nicht-reaktive Werte
- **Lifecycle**: `onMount` mit `async` und Return-Wert (Svelte erwartet Cleanup-Funktion synchron zurück)
- **Slots/Props**: Undeklarierte Props (`export let` fehlt), getippte Props ohne Defaults bei optionalen Werten
- **SvelteKit-spezifisch** (falls relevant): `load`-Funktionen ohne Error-Handling, fehlende `+error.svelte`, falsche `fetch`-Nutzung in `load` (server vs. client), CSRF/Cookies in Form-Actions
- **Async/Race Conditions**: Mehrere `await`-Aufrufe ohne Abort-Handling bei Component-Unmount
- **Sicherheit**: `{@html ...}` mit User-Input, fehlende Sanitization, hardcodierte Secrets (`grep -ri "api[_-]?key\|secret\|password\|token" src/`)
- **Accessibility**: `<div>` mit `on:click` ohne `role`/Keyboard-Handler, fehlende `alt`-Attribute, fehlende Form-Labels (svelte-check warnt meistens)
- **Edge Cases**: Division durch Null, leere Arrays/null-Zugriffe ohne Guard, `JSON.parse` ohne try/catch, Datums-/Zahlen-Parsing ohne Validation

### 2.3 Logische Fehler
- Lies kritische Komponenten und Stores tatsächlich durch — nicht nur grep.
- Prüfe Off-by-One in Schleifen, falsche Vergleichsoperatoren (`==` vs `===`), invertierte Bedingungen.
- Bei Forms: Validation client-only? Server-side fehlt?

### 2.4 Was NICHT als Bug zählt
- Stylistische Präferenzen (außer der Code-Style ist im Repo definiert)
- "Könnte performanter sein" ohne konkretes Problem
- Theoretische Bugs ohne Reproweg

**Format jedes Eintrags:**
```
### [SCHWEREGRAD] Kurztitel
- **Datei**: src/lib/Foo.svelte:42
- **Status**: VERIFIZIERT | VERMUTUNG (begründen warum nicht 100% sicher)
- **Problem**: ...
- **Repro**: ...
- **Fix-Vorschlag**: ... (kein Code-Diff hier, nur Richtung)
```

---

## Phase 3: Dead-Code-Audit (nur lesen, nichts ändern)

Erstelle `AUDIT_DEADCODE.md`. **Kategorisiere nach Konfidenz**, nicht alphabetisch.

### 3.1 Kandidaten finden
- **Ungenutzte Dateien**: Für jede `.svelte`/`.ts`/`.js`-Datei prüfe per `rg` rückwärts, ob sie irgendwo importiert wird (auch dynamische Imports `import('...')`, auch in `*.config.*`, auch in HTML/Templates).
- **Ungenutzte Exports**: Funktionen/Konstanten/Types, die exportiert aber nirgends importiert werden.
- **Ungenutzte Komponenten**: Svelte-Components ohne `<TagName />`-Verwendung irgendwo.
- **Ungenutzte Assets**: Bilder/Fonts/SVGs in `static/` oder `src/lib/assets/`, die in keinem Code/CSS/HTML referenziert werden.
- **Tote Branches**: `if (false)`, kommentierte Code-Blöcke, `// TODO: remove`, `// deprecated`.
- **Ungenutzte CSS-Klassen** in globalen Stylesheets (Svelte scoped CSS warnt selbst).
- **Verwaiste Test-Dateien** für längst gelöschte Module.
- **`.bak`/`.old`/`copy`/`-old`-Dateien** im Repo.

### 3.2 Konfidenz-Stufen
- **🟢 SICHER LÖSCHBAR**: Datei nicht referenziert, kein dynamischer Import möglich, kein Asset-Bezug, nicht in Config.
- **🟡 WAHRSCHEINLICH LÖSCHBAR**: Sieht ungenutzt aus, aber prüfe folgendes Risiko: [explizit nennen].
- **🔴 NICHT EIGENMÄCHTIG LÖSCHEN**: Verdächtig, aber könnte über dynamische Imports, SvelteKit-Routing-Konvention, Build-Tool-Magie oder externe Konsumenten genutzt werden.

### 3.3 Begründungspflicht
Jeder Eintrag braucht: Datei, Konfidenz, **konkrete Belegkette** (z.B. `rg "FooComponent" -t svelte -t ts → 0 Treffer in src/, 0 in tests/, 0 in static/`).

**Was du NICHT als Dead Code meldest, ohne genauer hinzuschauen:**
- SvelteKit-Routendateien (`+page`, `+layout`, `+server`, `+error`) — sie werden über Dateisystem-Routing geladen, nicht über Imports.
- Dateien in `static/` — werden zur Laufzeit geladen.
- Globale Type-Deklarationen (`*.d.ts`).
- `app.html`, `hooks.server.ts`, `hooks.client.ts` — SvelteKit-Konventionen.

---

## Phase 4: Freigabe und Umsetzung

Nach Abschluss von Phasen 1–3:
1. Präsentiere mir die drei Berichte als Zusammenfassung (Top-Findings, Statistiken, Risiken).
2. **Warte auf meine Freigabe.** Frag explizit: "Welche Findings soll ich jetzt fixen? Bug-IDs / Deadcode-IDs?"
3. Erst dann modifizierst du Code — und zwar **ein Fix pro Commit-würdiger Einheit**, nicht alles auf einmal.
4. Nach jedem Fix:
   - Lauf `svelte-check` erneut → keine neuen Errors
   - Falls Tests existieren: `npm test` → grün
   - Kurzes Changelog-Statement: was geändert, warum, welcher Bug-Eintrag erledigt.
5. Beim Löschen von Dateien: `git mv` zu `.deleted/`-Ordner (oder einfach `rm`, aber **mit Liste, was entfernt wurde**) — kein Force-Push, kein Rebase.

---

## Anti-Pattern, die du vermeiden musst

- ❌ "Ich habe alle Bugs behoben" ohne Liste.
- ❌ Refactorings, die nicht beauftragt wurden.
- ❌ Updaten von Dependencies ohne Auftrag.
- ❌ Stilistische Änderungen mit echten Bugfixes vermischen.
- ❌ "Ich denke, das könnte ein Problem sein" ohne Verifikation.
- ❌ Mehrere Bugs in einem riesigen Diff.

## Start

Beginne jetzt mit **Phase 1**. Sag mir, sobald `AUDIT_RECON.md` fertig ist, bevor du Phase 2 startest. Ich will zwischen den Phasen reviewen können.
~~~~
