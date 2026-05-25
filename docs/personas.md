# Personas

Zwei priorisierte Personas für TripTales. Dario ist die **Primary Persona**, deren Hauptbedürfnisse den MVP definiert haben. Marco ist die **Secondary Persona**, deren Anforderungen die Erweiterungen 4.9 (Recurring Events) und 4.10 (Trips) plausibilisiert haben.

Beide Personas wurden aus eigenen Reise- und Studienerfahrungen sowie aus den Feedback-Gesprächen zur Projektidee verdichtet — keine empirische Repräsentativität, sondern bewusst plausible Stellvertreter für die Zielgruppe "junge Erwachsene, die mit Freunden Aktivitäten planen und Erinnerungen visuell festhalten möchten".

---

## Persona 1 — Dario, 24 (Primary)

**Rolle:** Wirtschaftsinformatik-Student im 5. Semester an der ZHAW, ab Herbst Austauschsemester an der San Diego State University in Kalifornien.

**Hintergrund:** Wird ab Beginn des Auslandssemesters in einem Shared Apartment in Pacific Beach leben. Erwartet ein wechselndes soziales Umfeld: Mitbewohner:innen, Kommilitonen aus mehreren Kursen, lokale Surf-Bekannte und Wochenend-Travel-Gruppen aus dem Auslandsstudierenden-Netzwerk. Möchte das Semester intensiv erleben und gleichzeitig dokumentieren, weil er weiss, dass in der Erinnerung sonst verschwimmen würde, was er tatsächlich gemacht hat.

**Tech-Affinität:** Hoch. iPhone-Power-User, Notion-Notizen seit Schulzeit, Instagram + Strava, Google Calendar als Standardkalender. Hat schon ein eigenes Reise-Spreadsheet probiert und nach drei Wochen aufgegeben, weil die Datenpflege zwischen Apps zu fragmentiert war. Baut Side-Projects in JavaScript/SvelteKit und ist gewohnt, Tools selbst zu basteln, wenn der Markt nichts Passendes liefert.

**Ziele:**
1. **Geplante Aktivitäten zentral festhalten** — von Strandtagen über Wochenendtrips nach LA bis zu Vorlesungen.
2. **Freunde unkompliziert einladen**, ohne zwischen WhatsApp-Gruppen, Notion-Seiten und Google-Kalendern hin und her zu wechseln.
3. **Nach dem Erlebnis kurz reflektieren und Fotos zuordnen**, damit am Semesterende eine erlebte Chronik bleibt.
4. **Visuelle Karte aller besuchten Orte** als Souvenir.

**Pain Points:**
- Reiseinformationen liegen verteilt in Google Maps Listen, Instagram-Saved-Posts, Notion-Seiten und WhatsApp-Sprachnachrichten — kein einziger Ort, an dem man "die Reise" sieht.
- Kalender-Apps zeigen Termine, aber keine Erinnerungen danach.
- Foto-Apps sammeln Bilder chronologisch, aber ohne Kontext (welches Event, mit welchen Freunden).
- Reiseplanungs-Apps sind auf Hotelbuchung und Flüge ausgelegt, nicht auf Alltagsaktivitäten im Auslandssemester.

**Zitat:**
> "Wenn ich in zwei Jahren auf das San-Diego-Semester zurückschaue, möchte ich nicht durch 5'000 Fotos scrollen müssen, um zu wissen, was ich eigentlich gemacht habe."

**Relevanz für TripTales:** Darios Bedürfnisse haben die zentralen MVP-Workflows geprägt — Event-CRUD mit Friend-Invites, Memory-Speicherung nach Event, Journey-Timeline und Map. Die Auslandssemester-Situation hat ausserdem die Multi-User-Anforderung (Friend-Invites über echte Accounts, nicht Freitext) und das integrierte Image-Handling motiviert.

---

## Persona 2 — Marco, 29 (Secondary)

**Rolle:** IT-Consultant in Zürich, frisch aus dem Junior-Status raus, dadurch erstes Jahr mit ernsthaftem Urlaubsbudget.

**Hintergrund:** Wohnt zur Miete in Zürich-Wiedikon, pendelt drei Tage pro Woche ins Büro. Mehrere strukturell wiederkehrende Termine (Yoga-Klasse jeden Dienstag, Boulder-Abend jeden Donnerstag, Co-Working-Tag bei einem Freund jeden Freitag). Nimmt sich pro Jahr zwei bis drei längere Reisen vor, die er mit seiner Partnerin und manchmal mit einer kleinen Gruppe von Freunden plant.

**Tech-Affinität:** Mittel-hoch. Nutzt Polarsteps für vergangene Trips, kannte vorher Wanderlog, hat eine eigene Notion-Vorlage für Reiseplanung. Skeptisch gegenüber neuen Apps — installiert sie nur, wenn sie wirklich einen Workflow vereinfachen, und löscht sie nach einer Woche wieder, wenn nicht.

**Ziele:**
1. **Wiederkehrende Termine ohne Mehrfachaufwand erfassen** (Yoga, Boulder, Co-Working).
2. **Mehrtägige Reisen als geschlossene Erzähleinheit** speichern, nicht über mehrere Monatsüberschriften verstreut.
3. **Eine Reise gemeinsam mit Partnerin planen** — beide sollen Events einsehen und ergänzen können.
4. **Spontane Reiseideen festhalten**, ohne sofort einen Termin festlegen zu müssen ("Mount Fuji bei Kirschblüte" als Notiz, irgendwann konkretisieren).

**Pain Points:**
- Polarsteps ist erinnerungslastig, aber schwach in der Planungsphase.
- Notion ist mächtig, aber für unterwegs auf dem Handy umständlich.
- Google Calendar erfasst Wiederholungen, ist aber fürs Storytelling nutzlos.
- Reise-Ideen verschwinden in iOS-Notizen, weil sie nie strukturiert weiterbehandelt werden.

**Zitat:**
> "Wenn ich für jeden Yoga-Termin ein Event von Hand anlegen müsste, hätte ich nach einer Woche aufgehört. Und meine drei Reise-Ideen pro Quartal verlieren sich, weil ich nie weiss, wo ich sie aufschreiben soll."

**Relevanz für TripTales:** Marcos Bedürfnisse haben drei Erweiterungen direkt motiviert: §4.9 (Wiederkehrende Events) löst die Yoga-/Boulder-/Co-Working-Termine, §4.10 (Trips) bündelt mehrtägige Reisen, §4.1 (Travel Ideas + Convert) fängt spontane Ideen ein und führt sie zu konkreten Events über.

---

## Anwendung der Personas im Projekt

| Persona | Wirkt primär auf | Sichtbar in §x |
|---|---|---|
| Dario | MVP-Kernworkflows (Auth, Event-CRUD, Memory, Journey, Map) + Friend-Invites über echte Accounts | §3.1, §3.4, §4.5, §4.8 |
| Marco | Erweiterungen 4.1 (Ideas), 4.9 (Recurring), 4.10 (Trips) | §4.1, §4.9, §4.10 |

Die Personas dienen als Gegenprobe bei Feature-Entscheidungen: Wenn ein Feature weder Dario noch Marco hilft, ist es kein MVP-Kandidat. Wenn es nur eine der beiden trifft, wird es als Erweiterung priorisiert. Erweiterungen, die Pain Points beider lösen (z. B. §4.6 Bilder, §4.7 Profile), wurden früh umgesetzt.
