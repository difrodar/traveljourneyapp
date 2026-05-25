# Competitive Analysis — TripTales vs. existierende Lösungen

**Ziel:** Differenzierungsargument für TripTales schärfen, indem vier Apps verglichen werden, die ähnliche oder benachbarte Probleme adressieren. Untersucht wird, welche Phase des Travel-Lifecycles sie abdecken — *Planung → Erleben → Erinnerung* — und wo TripTales bewusst anders ansetzt.

**Methode:** Heuristische Feature-Inspektion auf Basis öffentlich zugänglicher Produktinformationen (Webseiten, App-Store-Beschreibungen, eigene Nutzererfahrung mit Polarsteps und Google Calendar). Keine Tiefen-Audits einzelner Apps — Ziel ist Positionierungs-Klärung, nicht Konkurrenz-Schwächung.

## Verglichene Apps

1. **Polarsteps** — Reise-Tagebuch mit automatischem GPS-Tracking, Foto-Upload und Kartenansicht.
2. **Google Calendar** — Universeller Kalender, geteilte Events, Wiederholungen, Erinnerungen.
3. **Notion (Travel-Templates)** — Generisches Datenbank-Tool mit vorgefertigten Reise-Vorlagen.
4. **Wanderlog** — Reiseplaner mit kollaborativen Itineraries, Karten und Buchungs-Aggregator.

## Feature-Matrix

| Feature | Polarsteps | Google Cal | Notion | Wanderlog | **TripTales** |
|---|:---:|:---:|:---:|:---:|:---:|
| **Planung-Phase** | | | | | |
| Events mit Datum, Ort, Kategorie planen | ⚠ schwach | ✅ | ✅ | ✅ | ✅ |
| Freunde aus Account-System einladen | ❌ | ✅ | ⚠ Workaround | ✅ | ✅ |
| Wiederkehrende Termine | ❌ | ✅ | ⚠ manuell | ❌ | ✅ |
| Mehrtägige Reisen als Bündel | ✅ | ❌ | ✅ | ✅ | ✅ |
| Spontane Ideen sammeln ohne Datum | ❌ | ❌ | ✅ | ⚠ schwach | ✅ |
| Ideen → konkretes Event konvertieren | ❌ | ❌ | ⚠ manuell | ❌ | ✅ |
| **Erlebnis-Phase** | | | | | |
| Auf Karte Markern wo Events stattfanden | ✅ | ❌ | ⚠ Embed | ✅ | ✅ |
| Standort-Pinning aus dem Event heraus | ✅ automatisch | ❌ | ❌ | ✅ | ✅ manuell |
| **Erinnerungs-Phase** | | | | | |
| Memory-Text + Fotos pro Event | ✅ | ❌ | ✅ | ⚠ schwach | ✅ |
| Journey-/Timeline-Ansicht | ✅ | ❌ | ⚠ manuell | ⚠ schwach | ✅ |
| Storytelling-Bundle pro Reise | ✅ | ❌ | ✅ | ⚠ schwach | ✅ |
| **Teilen & Privacy** | | | | | |
| Read-only Share-Link mit Ablauf | ⚠ Pro-Feature | ✅ | ⚠ Workspace | ✅ | ✅ |
| Social-Media-Format-Preview | ❌ | ❌ | ❌ | ❌ | ✅ |
| Account-isolierte Daten | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tech & UX** | | | | | |
| Offline-Nutzung | ✅ | ⚠ | ⚠ | ⚠ | ❌ |
| Mobile-optimierte Oberfläche | ✅ | ✅ | ⚠ | ✅ | ✅ Web-Responsive |
| Dark Mode | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legende:** ✅ vollständig, ⚠ teilweise / Workaround, ❌ nicht vorhanden

## Positionierung

| App | Stärke | Schwäche relativ zu TripTales |
|---|---|---|
| **Polarsteps** | Beste Erinnerungs-/Karten-Erfahrung, automatisches Tracking | Sehr schwach in der Planungsphase, kein Friend-Invite, keine wiederkehrenden Termine, keine Ideen-Sammlung |
| **Google Calendar** | Beste Planung, Standard für Termine | Keine Erinnerungs-Schicht, keine Karte, kein Foto-Storytelling |
| **Notion** | Maximale Flexibilität, alle Phasen abbildbar | Setup-Overhead, kein integrierter Karten-Workflow, mobile UX umständlich, keine echten Friend-Invitations |
| **Wanderlog** | Starke Itinerary-Planung, Karten, Kollaboration | Schwach in der Erinnerungs-Phase, keine wiederkehrenden Termine, kein Ideen-System ohne Datum |

## Differenzierungs-Argument für TripTales

TripTales ist nicht primär ein Reise-Tagebuch (Polarsteps), kein Kalender-Ersatz (Google Calendar) und keine Datenbank-Vorlage (Notion). TripTales adressiert spezifisch den **Lifecycle "Planen → Erleben → Erinnern" in einer App**, mit drei besonderen Eigenschaften:

1. **Ideen-zu-Event-Pipeline (§4.1):** Spontane Reiseideen ohne Datum bleiben erfasst und werden später per Klick zu Events — diese Stufe fehlt allen verglichenen Apps.
2. **Wiederkehrende Termine + Storytelling-Bundle (§4.9 + §4.10):** Polarsteps und Wanderlog erfassen Reisen als Bündel, aber keine Wiederholungen; Google Calendar das Gegenteil. TripTales kombiniert beides.
3. **Friend-Invitations über echte Accounts (§4.8):** Polarsteps und Notion nutzen keine Account-basierten Einladungen; Google Calendar und Wanderlog tun es, aber ohne Foto-/Memory-Verknüpfung mit den eingeladenen Personen.

Für die definierte Primary Persona (Dario, Wirtschaftsinformatik-Student vor Austauschsemester — siehe [`docs/personas.md`](../personas.md)) ist die Lifecycle-Abdeckung in **einer** App der entscheidende Mehrwert: Er soll nicht mehr zwischen Google Maps, Instagram-Saved-Posts und WhatsApp-Gruppen wechseln müssen.

## Limitierungen dieser Analyse

- Keine quantitativen Benchmarks (Conversion, NPS, MAU) — diese Daten sind extern nicht zugänglich.
- Vergleichszeitpunkt: April–Mai 2026. Feature-Sets der Konkurrenz können sich schnell ändern (besonders bei Wanderlog, das aktiv ausgebaut wird).
- Offline-Fähigkeit und Native-Mobile-Apps sind bei TripTales bewusst nicht im MVP-Scope — sind für die Web-Prototyping-Aufgabe nicht abgegrenzt.
- Polarsteps' GPS-Auto-Tracking ist eine Kategorie für sich und würde für TripTales eine native App erfordern — bewusst out-of-scope.
