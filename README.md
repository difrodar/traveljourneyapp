# Projektdokumentation - TripTales

## Inhaltsverzeichnis

1. [Ausgangslage](#1-ausgangslage)
2. [Lösungsidee](#2-lösungsidee)
3. [Vorgehen & Artefakte](#3-vorgehen--artefakte)
    1. [Understand & Define](#31-understand--define)
    2. [Sketch](#32-sketch)
    3. [Decide](#33-decide)
    4. [Prototype](#34-prototype)
    5. [Validate](#35-validate)
4. [Erweiterungen [Optional]](#4-erweiterungen-optional)
5. [Projektorganisation [Optional]](#5-projektorganisation-optional)
6. [KI-Deklaration](#6-ki-deklaration)
7. [Anhang [Optional]](#7-anhang-optional)

> **Hinweis:** Massgeblich sind die im **Unterricht** und auf **Moodle** kommunizierten Anforderungen.

<!-- WICHTIG: DIE KAPITELSTRUKTUR DARF NICHT VERÄNDERT WERDEN! -->

<!-- Diese Vorlage ist für eine README.md im Repository gedacht. Abschnitte mit [Optional] können weggelassen werden, wenn in den Übungen nichts anderes verlangt wird. -->

## 1. Ausgangslage
Kurz beschreiben, welches Problem adressiert wird und welches Ergebnis angestrebt ist. Wem nützt die Lösung, wer ist beteiligt oder betroffen?
- **Problem:** Während eines Auslandssemesters entstehen viele Pläne und Erinnerungen parallel in Kalendern, Gruppenchats, Google Maps, Instagram und Notizen. Dadurch gehen Details zu Events, Orten, eingeladenen Freunden und persönlichen Eindrücken schnell verloren.
- **Ziele:** TripTales soll Aktivitäten in San Diego zentral planbar machen, Orte und Freunde mit Events verknüpfen und vergangene Erlebnisse als Journey dokumentieren. Die App soll als interaktiver, weiterführbarer SvelteKit-Prototyp mit echter Datenhaltung umgesetzt werden.
- **Primäre Zielgruppe:** Studierende im Ausland, Reisende und junge Erwachsene, die mit Freunden Aktivitäten planen und Erinnerungen später wieder ansehen möchten.
- **Weitere Stakeholder [Optional]:** Dozierende und Mitstudierende im Modul Prototyping, da sie Umsetzung, Vorgehen, Evaluation und Dokumentation beurteilen.


## 2. Lösungsidee
Beschreibt die Lösungsidee.
- **Kernfunktionalität:** Nutzerinnen und Nutzer erstellen Events mit Datum, Location, Kategorie, Beschreibung und Freunden. Events können bearbeitet, als erlebt markiert und mit Rating, Erinnerungstext sowie optionaler Bild-URL in eine Journey überführt werden. Ergänzend gibt es Dashboard, Event-Liste, Google-Maps-/Pinpoint-Ansicht und Reiseideen mit Umwandlung in Events.
- **Annahmen [Optional]:** Eine kombinierte Planungs- und Erinnerungsansicht reduziert die Streuung von Reiseinformationen. Eine stabile Google-Maps-Fallback-Ansicht ist für den Prototyp wichtiger als eine rein externe Kartenabhängigkeit. Studierende profitieren von wenigen klaren Workflows statt vielen isolierten Tools.
- **Abgrenzung [Optional]:** Kein Login, keine echten Einladungsnachrichten, kein Chat und kein Bild-Upload. Bildmaterial wird nur über optionale URLs referenziert, damit Urheberrecht und Storage-Komplexität im Prototyp kontrollierbar bleiben.

## 3. Vorgehen & Artefakte
Die Durchführung erfolgt phasenbasiert; dokumentieren Sie die wichtigsten Ergebnisse je Phase.

### 3.1 Understand & Define
- **Zielgruppenverständnis:** Proto-Persona: Austauschstudentin in San Diego, 22 Jahre, plant Aktivitäten mit wechselnden Freundesgruppen, möchte Orte und Erinnerungen nicht über mehrere Apps zusammensuchen. Problemraumanalyse: Planung, Location-Infos, soziale Abstimmung und persönliche Erinnerungen sind normalerweise getrennt.
- **Wesentliche Erkenntnisse:** Zentrale Workflows müssen schnell erreichbar sein. Events brauchen Status, Freunde und Location. Erinnerungen sollen direkt nach dem Event ergänzt werden können. Eine visuelle Ortsübersicht erzeugt Mehrwert, darf aber den Prototyp nicht destabilisieren.

### 3.2 Sketch
- **Variantenüberblick:** Variante A war dashboard-zentriert mit schnellen Kennzahlen. Variante B war map-zentriert mit Orten als Einstieg. Variante C war journey-zentriert mit Erinnerungen als Hauptnavigation. Entschieden wurde eine kombinierte App: Dashboard als Einstieg, Events als Arbeitsbereich, Journey und Map als Rückblick/Orientierung.
- **Skizzen:** Platzhalter für Skizzen: `docs/sketch-dashboard.png`, `docs/sketch-event-flow.png`, `docs/sketch-map-journey.png`. Unterschiede: Dashboard priorisiert Überblick, Event-Flow priorisiert CRUD, Map/Journey priorisieren Erlebnisse nach Ort und Zeit.

### 3.3 Decide
- **Gewählte Variante & Begründung:** Gewählt wurde eine Workflow-App mit klarer Navigation: Dashboard, Events, Journey, Map und Ideas. Diese Struktur erfüllt die Anforderungen an mehrere Pages, echte Workflows, Datenbankzugriff und Erweiterbarkeit.
- **End-to-End-Ablauf:** Neues Event erstellen, Freunde hinzufügen, Location speichern, Event später bearbeiten, als completed markieren, Rating und Erinnerung ergänzen, Journey ansehen, Ort auf Map prüfen. Reiseideen können separat gesammelt und in Events umgewandelt werden.
- **Mockup:** Platzhalter Figma-Link: `[Figma-Link ergänzen]`. Platzhalter Screenshots: `docs/screenshot-dashboard.png`, `docs/screenshot-event-detail.png`, `docs/screenshot-journey.png`, `docs/screenshot-map.png`.

### 3.4 Prototype

#### 3.4.1. Entwurf (Design)
Beschreibt die Gestaltung und Interaktion.
> **Hinweis:** Hier wird der **Prototyp** beschrieben, nicht das **Mockup**.
- **Informationsarchitektur:** `/` Dashboard, `/events` Listen- und Filteransicht, `/events/new` Erstellung, `/events/[id]` Detail/Bearbeitung/Memory, `/journey` Timeline, `/map` Orte, `/ideas` Reiseideen.
- **User Interface Design:** Das UI nutzt kompakte Cards, klare Formulare, Status-Badges, Kategorie-Badges, Filterleisten und leere Zustände. Platzhalter für finale Screenshots werden nach lokalem Test oder Deployment-Screenshot ergänzt.
- **Designentscheidungen:** Die Gestaltung ist ruhig und nutzungsorientiert, mit San-Diego-inspirierten Farben für Strand, Stadt, Food und Journey. Karten werden nur für einzelne Event-, Location- und Journey-Elemente verwendet; die Seiten bleiben übersichtlich und scanbar.

#### 3.4.2. Umsetzung (Technik)
Fasst die technische Realisierung zusammen.
- **Technologie-Stack:** SvelteKit mit Svelte 5, JavaScript/TypeScript-nahe Modulstruktur, MongoDB Atlas mit offiziellem Node.js Driver, Netlify Adapter, Google Maps JavaScript API optional.
- **Tooling:** Visual Studio Code, Git/GitHub, Netlify, MongoDB Atlas, Codex/ChatGPT als Planungs- und Entwicklungsassistenz.
- **Struktur & Komponenten:** Zentrale Komponenten sind `Navigation`, `DashboardStats`, `EventCard`, `EventForm`, `FriendPicker`, `RatingInput`, `JourneyCard`, `GoogleMapView`, `LocationPinGrid`, `TravelIdeaCard` und `SharePreview`.
- **Daten & Schnittstellen:** MongoDB Collections: `events`, `locations`, `friends`, `journeyEntries`, `travelIdeas`. Datenzugriff erfolgt serverseitig in `src/lib/server`. SvelteKit Server Loads und Form Actions übernehmen Lesen, Erstellen, Aktualisieren, Löschen und Umwandeln.
- **Deployment:** Netlify URL: https://triptales-difrodar.netlify.app/. Benötigte Netlify Environment Variables: `MONGODB_URI`, `MONGODB_DB=triptales`, optional `PUBLIC_GOOGLE_MAPS_API_KEY`, optional `PUBLIC_GOOGLE_MAP_ID`.
- **Besondere Entscheidungen:** Der MongoDB Connection String wird nicht im Repository gespeichert. Google Maps ist vorbereitet; ohne API-Key zeigt die App eine stabile Pinpoint-Fallback-Ansicht. Seed-Daten werden automatisch beim ersten Datenzugriff erzeugt, wenn die Datenbank leer ist.

### 3.5 Validate
- **URL der getesteten Version** (separat deployt): https://triptales-difrodar.netlify.app/
- **Ziele der Prüfung:** Prüfen, ob Nutzende ein Event erstellen, Freunde hinzufügen, das Event als erlebt markieren und die Erinnerung in Journey/Map wiederfinden können.
- **Vorgehen:** Geplant: moderierter Usability-Test, remote oder vor Ort, mit Beobachtung und kurzem Interview.
- **Stichprobe:** Platzhalter: `[2-4 Testpersonen, idealerweise Studierende oder junge Reisende ergänzen]`.
- **Aufgaben/Szenarien:** 1. Erstelle einen Strand-Event mit Freunden. 2. Bearbeite Location oder Datum. 3. Markiere den Event als erlebt und ergänze Rating/Memory. 4. Finde die Erinnerung in der Journey. 5. Finde den Ort in der Map. 6. Erstelle eine Reiseidee und wandle sie in ein Event um.
- **Kennzahlen & Beobachtungen:** Platzhalter: Erfolgsquote, benötigte Zeit, Rückfragen, Fehlklicks, qualitative Kommentare.
- **Zusammenfassung der Resultate:** Platzhalter: `[nach Durchführung ergänzen, keine erfundenen Resultate]`.
- **Abgeleitete Verbesserungen:** Platzhalter: `[priorisierte Verbesserungen aus Evaluation ergänzen]`.

## 4. Erweiterungen [Optional]
Dokumentiert Erweiterungen über den Mindestumfang hinaus.
> **Hinweis:** Jede Erweiterung ist separat nach dem folgenden Schema zu beschreiben.

### 4.1 Reiseideen in Events umwandeln
- **Beschreibung & Nutzen:** Ideen können gespeichert, priorisiert und später in konkrete Events umgewandelt werden. Das unterstützt spontane Reiseplanung.
- **Wo umgesetzt:** Frontend und Actions in `/ideas`, Datenbank-Collection `travelIdeas`, Conversion über serverseitige Repository-Funktion.
- **Referenz:** Siehe `/ideas` und Abschnitt 3.4.2.
- **Aus Evaluation abgeleitet?:** Nein, initiale Erweiterung aus Projektidee.

### 4.2 Google Maps mit Fallback
- **Beschreibung & Nutzen:** Locations werden auf Google Maps angezeigt, sofern ein API-Key vorhanden ist. Ohne Key bleibt die Seite über Pinpoint-Karten nutzbar.
- **Wo umgesetzt:** `GoogleMapView` und `LocationPinGrid`, Daten aus `locations`.
- **Referenz:** Siehe `/map`.
- **Aus Evaluation abgeleitet?:** Nein, technische Absicherung für stabilen Prototyp.

### 4.3 Share-/Insta-Preview
- **Beschreibung & Nutzen:** Event- und Journey-Daten werden als prototypische Social-Preview visualisiert.
- **Wo umgesetzt:** `SharePreview` auf der Event-Detailseite.
- **Referenz:** Siehe `/events/[id]`.
- **Aus Evaluation abgeleitet?:** Nein, Erweiterung mit erkennbarem Storytelling-Mehrwert.

## 5. Projektorganisation [Optional]
Beispiele:
- **Repository & Struktur:** GitHub Repository mit SvelteKit-Standardstruktur. Wichtige Bereiche: `src/routes` für Pages, `src/lib/components` für UI, `src/lib/server` für MongoDB-Zugriff, `scripts/seed.js` für Seed-Daten.
- **Issue-Management:** Vorgeschlagene Issues: Setup, MongoDB Data Layer, Event Workflow, Journey, Map, Ideas, README, Deployment, Validate.
- **Commit-Praxis:** Sprechende Commits nach Bereichen, z. B. `feat: implement event planning workflows`, `feat: add journey memory workflow`, `docs: complete project documentation`.

## 6. KI-Deklaration
Die folgende Deklaration ist verpflichtend und beschreibt den Einsatz von KI im Projekt.

### 6.1 KI-Tools
- **Eingesetzte Tools**: OpenAI Codex/ChatGPT in Visual Studio Code.
- **Zweck & Umfang**: KI wurde für Projektplanung, technische Architektur, Codevorschläge, SvelteKit-Komponenten, MongoDB-Datenzugriff, README-Strukturierung und Qualitätssicherung eingesetzt. Teile der Implementierung und Dokumentation entstanden KI-unterstützt.
- **Eigene Leistung (Abgrenzung):** Projektidee, fachliche Anforderungen, Vorgaben, Deployment-Ziel, MongoDB-Entscheid und finale Kontrolle liegen beim Projektverfasser. KI-Vorschläge müssen geprüft, angepasst, getestet und dokumentiert werden.

### 6.2 Prompt-Vorgehen
Es wurde mit ausführlichen Kontext-Prompts gearbeitet: Projektidee, Bewertungskriterien, gewünschte Pages, Datenmodell, Workflows, README-Vorgaben und technische Entscheidungen wurden explizit beschrieben. Anschliessend wurde zuerst ein Plan erstellt und danach iterativ umgesetzt. Sensible Daten werden nicht in Dateien übernommen.

### 6.3 Reflexion
KI beschleunigt Strukturierung, Boilerplate, Dokumentation und das Finden technischer Risiken. Grenzen bestehen bei fachlicher Bewertung, tatsächlicher Nutzer-Evaluation, Secret-Handling und finaler Qualitätssicherung. Deshalb werden Build-Checks, manuelle Tests, Deployment-Prüfung und echte Evaluation separat durchgeführt.

## 7. Anhang [Optional]
Beispiele:
- **Quellen:** SvelteKit Dokumentation, Netlify SvelteKit Deployment Docs, MongoDB Node.js Driver Docs, Google Maps JavaScript API Docs. Externe Bildassets werden aktuell nicht als feste Projektdateien verwendet.
- **Testskript & Materialien:** Platzhalter: `docs/testskript.md`.
- **Rohdaten/Auswertung:** Platzhalter: `docs/evaluation-results.md`.
