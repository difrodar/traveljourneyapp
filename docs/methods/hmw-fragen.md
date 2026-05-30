# How-Might-We-Fragen (Define → Sketch)

**Zweck:** How-Might-We-Fragen (HMW) sind die Brücke zwischen der Problemanalyse (Understand & Define) und der Ideenfindung (Sketch) im Design Sprint. Sie übersetzen jeden zentralen Pain Point aus der [User Journey Map](user-journey-map.md) in eine offene, lösungsneutrale Gestaltungsfrage — breit genug für mehrere Ideen, eng genug, um fokussiert zu bleiben.

**Methode:** Jeder Pain Point der As-Is-Journey (siehe [user-journey-map.md](user-journey-map.md)) wurde in eine HMW-Frage umformuliert. Die rechte Spalte hält fest, welche TripTales-Entscheidung bzw. welches Feature aus der Frage hervorgegangen ist — so bleibt die Kette *Pain Point → HMW → Lösung* nachvollziehbar.

| # | Pain Point (Lifecycle-Stage) | How Might We … | Resultierende Lösung / Entscheidung |
|---|---|---|---|
| HMW-1 | Ideen verteilen sich über Instagram, Notizen, Chats und gehen unter (Inspiration) | … verhindern, dass spontane Reiseideen zwischen mehreren Apps verloren gehen? | Travel Ideas mit Stadt, Priorität, Notiz an einem Ort ([§4.1](../README.md#41-reiseideen-in-events-umwandeln)) |
| HMW-2 | Termin- und Freundesabstimmung läuft über WhatsApp-Sprachnachrichten, niemand sieht den finalen Plan (Planung) | … die Termin- und Freundesabstimmung für eine Aktivität in einen einzigen Schritt bringen? | Event-Erstellung mit integriertem Friend-Invite ([§4.8](../README.md#48-friend-management-über-login-user)) |
| HMW-3 | Ort (Maps) und Aktivitätsnotizen (Notion) liegen getrennt (Detailplanung) | … Ort, Beschreibung und Bilder einer Aktivität bündeln, statt über Maps und Notion zu verteilen? | Event mit City-Combobox + Koordinaten, Beschreibung und Bild-Uploads ([§4.6](../README.md#46-bild-uploads-für-events-und-memories)) |
| HMW-4 | Kalender-Reminder funktioniert, aber ohne Kontext zur Aktivität (Erinnerung) | … an bevorstehende Aktivitäten erinnern, ohne den Kontext (Ort, Freunde, Idee) zu verlieren? | Dashboard „Upcoming soon" + native In-App-Reminder mit Lead-Time ([§4.12](../README.md#412-in-app-reminder-mit-konfigurierbarer-lead-time)) |
| HMW-5 | Erinnerungen werden nach dem Erlebnis nirgends strukturiert festgehalten (Sofortige Reflexion) | … es so einfach machen, direkt nach einem Event eine Erinnerung mit Foto festzuhalten, dass es tatsächlich passiert? | After-Event-Memory-Formular, das Event in einem Schritt als erlebt markiert (§3.4) |
| HMW-6 | Fotos liegen chronologisch ohne Event-/Ortskontext im Foto-Berg (Foto-Sortierung) | … Fotos automatisch mit Event, Ort und Datum verknüpfen, statt sie später per Zeitachse zu suchen? | Bilder direkt am Event/Memory hinterlegt; Journey bündelt Foto + Memory + Ort + Datum (§3.4) |
| HMW-7 | Storytelling ist fragmentiert, kein zentraler Überblick zum Teilen (Storytelling) | … eine Reise so teilen, dass Empfänger:innen sie ohne Account und ohne Re-Kuratierung sehen? | Read-only Share-Link mit Scope-Auswahl ([§4.3](../README.md#43-share-insta-preview)) |
| HMW-8 | Nach Monaten verblasst die Erinnerung — kein kuratierter Rückblick (Rückblick) | … das ganze Semester als kuratierte Timeline erlebbar machen, statt durch 5'000 Fotos zu scrollen? | Journey-Timeline, gruppierbar „By month" oder „By trip" ([§4.10](../README.md#410-trips)) |

## Anwendung im Projekt

Die HMW-Fragen waren der Filter für die Sketch-Phase: Jede der acht Fragen musste durch mindestens einen Screen der [Crazy-8s-Skizzen](../sketches/Crazy8s.pdf) beantwortet werden. Fragen, die kein Panel adressierte, markierten Lücken im ersten Entwurf (z. B. fehlte anfangs ein klarer Sharing-Einstieg — HMW-7 —, was sich später im Usability-Test als Issue-Cluster #44/#45/#47 bestätigte). Umgekehrt zeigte HMW-4, dass „Erinnern mit Kontext" mehr als einen Kalender-Reminder braucht — daraus entstand später der native In-App-Reminder ([§4.12](../README.md#412-in-app-reminder-mit-konfigurierbarer-lead-time), aus Usability-Issue #36).

## Limitierung

Die HMW-Fragen wurden aus einer Primary-Persona-Journey (Dario, Auslandssemester) abgeleitet; Marcos Secondary-Bedürfnisse (wiederkehrende Termine, mehrtägige Reisen) flossen erst über die Erweiterungen [§4.9](../README.md#49-wiederkehrende-events)/[§4.10](../README.md#410-trips) nach. Sie sind als Gestaltungs-Leitfragen zu verstehen, nicht als abschliessender Anforderungskatalog.
