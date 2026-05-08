# TripTales – Testskript

Dieses Testskript begleitet die Validate-Phase aus [README §3.5](../README.md#35-validate). Es wird mit 2–4 Testpersonen durchgeführt und in [evaluation-results.md](evaluation-results.md) ausgewertet. Resultate werden erst nach der Durchführung ergänzt; bis dahin bleibt die Auswertung leer (vgl. `codex_custom_instructions.md` §11/§18).

## Setup

- URL: https://triptales-difrodar.netlify.app/
- Demo-Account 1: `difrodar` / `difrodar` (gefüllt mit Demo-Daten)
- Demo-Account 2: `dummy` / `dummy` (leerer Account)
- Browser: Chrome oder Firefox, Desktop und Mobil
- Beobachtende Person notiert Erfolg, Zeit, Rückfragen, Fehlklicks und qualitative Kommentare pro Aufgabe.

## Aufgaben

| # | Aufgabe | Erwartetes Ergebnis |
|---|---------|---------------------|
| 1 | Logge dich als `difrodar` ein und prüfe die Dashboard-Übersicht. | Login gelingt, Dashboard zeigt kommende Events und Highlights. |
| 2 | Logge dich aus, dann als `dummy` ein. | Leerer Account, Empty States verständlich. |
| 3 | Erstelle einen Strand-Event mit mindestens einer eingeladenen Person und lade ein Event-Bild hoch. | Event ist auf `/events` und Dashboard sichtbar. |
| 4 | Lasse beim Erstellen ein Pflichtfeld leer und prüfe die Fehlermeldung. | Feldnahe Fehlermeldung, andere Eingaben bleiben erhalten. |
| 5 | Versuche ein zu grosses oder falsches Bildformat hochzuladen. | Verständliche Upload-Meldung, Event wird nicht gespeichert. |
| 6 | Bearbeite Location, Datum und Bild des erstellten Events. | Änderungen erscheinen im Detail und in der Liste. |
| 7 | Markiere den Event als erlebt und ergänze Memory-Text plus optional Memory-Bild. | Event wechselt auf Status `completed`, Memory ist gespeichert. |
| 8 | Finde die Erinnerung in der Journey. | Memory erscheint chronologisch korrekt. |
| 9 | Finde den Ort in der Map. | Pin oder Listeneintrag korrekt zugeordnet. |
| 10 | Erstelle eine Reiseidee und wandle sie in ein Event um. | Idee verschwindet aus `/ideas`, Event erscheint mit Location/Bild. |
| 11 | Erstelle eine wöchentliche `Education`-Serie für 14 Termine. | Alle 14 Termine erscheinen im Kalender und in der Liste. |
| 12 | Lösche einmal nur einen Termin der Serie, einmal die ganze Serie über den Dialog. | Verhalten entspricht Auswahl. |
| 13 | Filtere Events nach Zeitraum und Kategorie. | Liste passt sich an, Empty State erscheint bei null Treffern. |
| 14 | Sortiere Events nach Datum und nach letzter Bearbeitung. | Reihenfolge ändert sich erkennbar. |
| 15 | Suche und filtere die Journey nach Zeitraum, Kategorie oder Text. | Leere Trefferlisten bleiben verständlich. |

## Beobachtungsrubrik (pro Aufgabe)

- Erfolg: ja / mit Hilfe / nein
- Benötigte Zeit (ungefähr in Sekunden)
- Rückfragen oder Stockungen
- Fehlklicks oder falsche Pfade
- Qualitative Kommentare der Testperson

## Abschlussfragen

1. Was war an der App besonders verständlich oder hilfreich?
2. Wo bist du hängengeblieben oder hattest Zweifel?
3. Welche eine Funktion würdest du dir am dringendsten zusätzlich wünschen?
4. Würdest du die App während eines Auslandssemesters tatsächlich nutzen? Warum oder warum nicht?
