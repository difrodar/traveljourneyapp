#!/usr/bin/env pwsh
# Patch the bodies of the 18 usability-test issues (#31-#48) to fix:
#   1. BOM character leaking at start of body
#   2. Backtick escapes consuming the `npm run build` literal in here-strings
# Self-contained: re-defines data + template with fixes, calls `gh issue edit`.

$ErrorActionPreference = "Stop"

$reportLink = "[docs/validate/Usability-Test/Analyse/TripTales_Usability_Analyse_Report.pdf](docs/validate/Usability-Test/Analyse/TripTales_Usability_Analyse_Report.pdf)"

# Tag -> Issue number (from initial creation, see commit log)
$tagToNumber = @{
	"U1"="31"; "U2"="32"; "U3"="33"; "U4"="34"; "U5"="35"; "U6"="36";
	"U7"="37"; "U8"="38"; "U9"="39"; "U10"="40"; "U11"="41"; "U12"="42";
	"U13"="43"; "U14"="44"; "U15"="45"; "U16"="46"; "U17"="47"; "U18"="48"
}

function New-FixedBody {
	param(
		[string]$Severity,
		[string]$Tasks,
		[string]$Testers,
		[string]$Evidence,
		[string]$Cause,
		[string]$Impact,
		[string]$Recommendation,
		[string]$CodeRefs,
		[string]$AcceptanceExtra = ""
	)
	$severityLabel = switch ($Severity) {
		"4" { "**4** (Usability-Katastrophe -- kritisch fuer Vertrauen)" }
		"3" { "**3** (hohe Prioritaet)" }
		"2" { "**2** (kleines Problem)" }
		"1" { "**1** (kosmetisch / gering)" }
		default { $Severity }
	}
	# Single-quoted here-string @'...'@ does NOT interpret backticks, so `npm run build`
	# stays literal. Variables aren't expanded either -- we use placeholder tokens and
	# substitute via -replace afterwards.
	$template = @'
**Source:** Usability test (2 testers: Lukas + Sandra). Full analysis: __REPORT__.

## Beobachtung / Friction
__EVIDENCE__
- Severity: __SEVERITY__
- Affected tasks: __TASKS__
- Affected testers: __TESTERS__

## Vermutete Ursache
__CAUSE__

## Auswirkung
__IMPACT__

## Code references
__CODEREFS__

## Proposed change
__RECOMMENDATION__

## Acceptance criteria
- [ ] Change implemented and reviewed
- [ ] `npm run build` clean__ACCEPTANCE_EXTRA__
- [ ] README §3.5 entry for this issue marked as "umgesetzt"
'@
	$body = $template `
		-replace '__REPORT__', $reportLink `
		-replace '__EVIDENCE__', $Evidence `
		-replace '__SEVERITY__', $severityLabel `
		-replace '__TASKS__', $Tasks `
		-replace '__TESTERS__', $Testers `
		-replace '__CAUSE__', $Cause `
		-replace '__IMPACT__', $Impact `
		-replace '__CODEREFS__', $CodeRefs `
		-replace '__RECOMMENDATION__', $Recommendation `
		-replace '__ACCEPTANCE_EXTRA__', $AcceptanceExtra
	return $body
}

# Same data as create-usability-issues.ps1
$issues = @(
	@{ Tag="U1"; Severity="1"; Tasks="1"; Testers="TP1, TP2";
		Evidence="- 🟡 Both testers tried Login first, then found Registration on their own.`n- TP1 (Lukas): *""Kurz unklar war, ob Login oder Registrierung verwendet werden soll.""*`n- TP2 (Sandra): *""Es war kurz unklar, ob Login oder Registrierung der richtige Einstieg ist.""*";
		Cause="Two parallel forms on the entry screen with similar visual weight; no primary CTA distinction between sign-in and sign-up.";
		Impact="Minor delay during onboarding. Both testers self-corrected, but signups in the wild may drop off.";
		CodeRefs="- ``src/routes/login/+page.svelte`` -- login + signup forms side by side";
		Recommendation="Visually separate Register vs. Login; highlight the primary CTA ""Create account"" for new users on the first visit." },
	@{ Tag="U2"; Severity="3"; Tasks="2"; Testers="TP1, TP2";
		Evidence="- 🟠 Both testers expected to click a calendar day to create an event.`n- TP1 (Lukas): *""Eine direkte Erfassung im Kalender und eine klare Bestätigung nach dem Speichern.""*`n- TP2 (Sandra): *""Kalender hatte keine direkte Eingabefunktion, der Create-Button war ungewohnt.""*";
		Cause="The calendar suggests interactivity (highlighted dates, hoverable cells) but offers no create path.";
		Impact="Detours and exploratory searching for a core function -- increases time-to-first-event.";
		CodeRefs="- ``src/routes/+page.svelte`` -- dashboard calendar without create affordance`n- ``src/routes/events/new/+page.svelte`` -- current entry point via separate button";
		Recommendation="Click-to-create directly in the calendar with the selected date pre-filled in the event form; alternatively, a global create button that pre-fills today's date by default." },
	@{ Tag="U3"; Severity="2"; Tasks="2, 3"; Testers="TP1, TP2";
		Evidence="- 🟡 TP2 mistook the events list filter as a create surface; TP1 searched first before creating.`n- TP2 (Sandra): *""Die Suchfunktion in Events wurde mit einer Erstellfunktion verwechselt.""*";
		Cause="Create, search, and filter affordances are not clearly separated visually on the events list page.";
		Impact="False starts and aha-moments instead of direct usage.";
		CodeRefs="- ``src/routes/events/+page.svelte`` -- events list with filters + search`n- ``src/lib/components/`` -- no dedicated create CTA above the fold";
		Recommendation="Place the create action visually primary (e.g. prominent button top-right); clearly delineate search/filter regions from create." },
	@{ Tag="U4"; Severity="3"; Tasks="2, 3, 5"; Testers="TP1, TP2";
		Evidence="- 🟠 Both testers found the event form heavy.`n- TP1 (Lukas): *""Die Strasse wurde als Pflichtfeld vermutet, das Country-Feld wirkte nach unten verrutscht.""*`n- TP2 (Sandra): *""Das zweispaltige Formular wurde zuerst spaltenweise gelesen.""* Country/City/Location-Felder wirkten doppelt.";
		Cause="Form has too many fields without sections; required vs. optional is not visually distinguished; two-column layout encourages misreading order.";
		Impact="Increased cognitive load and incorrect input (e.g. assuming street is mandatory).";
		CodeRefs="- ``src/lib/components/EventForm.svelte`` -- current single-block layout`n- ``src/routes/events/new/+page.svelte``";
		Recommendation="Group the form into clear sections (Basics, Location, Schedule, Options) with progressive disclosure; mark required fields unambiguously." },
	@{ Tag="U5"; Severity="3"; Tasks="3"; Testers="TP1, TP2";
		Evidence="- 🟠 Both testers expected a start–end time pair.`n- TP1 (Lukas): *""Es fehlten eigene Kategorien sowie eine klare Möglichkeit für Dauer oder Endzeit.""*`n- TP2 (Sandra): erwartet ""Von-bis"" beim Termin.";
		Cause="Event model only captures the start time; end/duration is not surfaced in the UI.";
		Impact="Real-world appointments (courses, dinner reservations, multi-hour activities) cannot be represented accurately.";
		CodeRefs="- ``src/lib/components/EventForm.svelte`` -- only ``time`` field`n- ``src/lib/server/repositories/events.js`` -- schema lacks ``endTime``/``duration``";
		Recommendation="Add an optional end-time field (von–bis range) or a duration picker presets (30 min, 1h, 2h, all-day)." },
	@{ Tag="U6"; Severity="3"; Tasks="2"; Testers="TP1, TP2";
		Evidence="- 🟠 Task 2 (""…sollte dich rechtzeitig erinnern"") could not be fulfilled.`n- TP1 (Lukas): ""Add to local calendar"" war nicht eindeutig.`n- TP2 (Sandra): *""Eine Reminder-Möglichkeit""* fehlte gänzlich.";
		Cause="The promise ""sollte dich rechtzeitig erinnern"" is not supported by any in-app UI; the .ics export is the only related affordance and is hidden.";
		Impact="Core planning value proposition is not delivered.";
		CodeRefs="- ``src/routes/events/[id]/+page.svelte`` -- has ICS download but no in-app reminder`n- (none for native reminders yet)";
		Recommendation="Add a native reminder function inside TripTales (e.g. notification bell + opt-in lead time); keep the .ics export as a complement." },
	@{ Tag="U7"; Severity="2"; Tasks="2, 3"; Testers="TP2";
		Evidence="- 🟡 TP2 (Sandra) interpreted ""Occurrences"" as the number of people: *""Der Begriff 'Occurrences' wurde mit Anzahl Personen verwechselt.""*";
		Cause="English technical term without context; no tooltip or microcopy.";
		Impact="Wrong recurrence count possible -- e.g. testperson enters 4 thinking they invite 4 friends, but creates 4 recurring instances.";
		CodeRefs="- ``src/lib/components/EventForm.svelte`` -- recurrence section`n- ``src/lib/constants.js`` -- ``repeatFrequencies``";
		Recommendation="Replace the label with ""Number of dates"" or ""Repeat count""; or add an inline tooltip explaining the concept." },
	@{ Tag="U8"; Severity="2"; Tasks="3"; Testers="TP1, TP2";
		Evidence="- 🟡 TP1 missed a fitting/custom category; TP2 found the existing ones helpful but wanted to extend them.`n- TP1 (Lukas): *""Es fehlten eigene Kategorien…""*`n- TP2 (Sandra): *""…Kategorien hilfreich, möchten sie aber erweitern.""*";
		Cause="Fixed category list does not cover real-world activities (e.g. ""Pottery class"").";
		Impact="Testers pick a mismatched category or get interrupted in their flow.";
		CodeRefs="- ``src/lib/constants.js`` -- ``categories`` array is fixed";
		Recommendation="Add an ""Other"" fallback category; optionally allow users to add their own categories scoped per account." },
	@{ Tag="U9"; Severity="3"; Tasks="4, 5, 7, 8"; Testers="TP1, TP2";
		Evidence="- 🟠 The information architecture relies on five overlapping English concepts.`n- TP1 (Lukas): *""Die Benennung und Einordnung rund um Memory/Journey war nicht ganz prägnant.""*`n- TP2 (Sandra): *""Die Abgrenzung zwischen Journey und Trip sowie der Zusammenhang mit Memories war unklar.""*";
		Cause="Idea/Event/Trip/Journey/Memory are abstract English concepts with no inline explanation, even though both testers are comfortable with English UIs.";
		Impact="Users look in the wrong places and don't trust the data model; surfaced across 4 tasks.";
		CodeRefs="- Navigation labels in ``src/lib/components/Navigation.svelte```n- README §3.4.1 already documents the IA -- but never surfaces in-product";
		Recommendation="Short onboarding/guide explaining Idea -> Event -> Memory -> Journey, plus Trip as a grouping; consistent microcopy on related pages (e.g. an explainer banner on the Journey page)." },
	@{ Tag="U10"; Severity="3"; Tasks="5"; Testers="TP1, TP2";
		Evidence="- 🟠 TP1 did not see Ideas at first; TP2 tried Trip first.`n- TP1 (Lukas): *""Der Bereich 'Ideas' wurde zunächst nicht gesehen.""*`n- TP2 (Sandra): *""Zuerst wurde versucht, einen Trip zu erstellen statt eine Idea.""*";
		Cause="Ideas tab exists but is not prominent in navigation; there's no ""Save as idea"" entry point from the event form.";
		Impact="Date-less captures are inefficient or only succeed with help; the Ideas section remains empty in practice.";
		CodeRefs="- ``src/lib/components/Navigation.svelte`` -- nav ordering`n- ``src/routes/events/new/+page.svelte`` -- no save-as-idea affordance";
		Recommendation="Reorder navigation: Dashboard, Ideas, Events, Trips, Journey, Map. Add ""Save idea without date"" / ""Save as idea"" inside the event form." },
	@{ Tag="U11"; Severity="3"; Tasks="5"; Testers="TP1";
		Evidence="- 🟠 TP1 (Lukas) observed: *""Konvertierung erzeugt Random-Datum/Bild, ist nicht rückgängig machbar, Idee verschwindet.""*";
		Cause="Conversion has unclear defaults (random date 7 days out, random fallback image) and silently deletes the original idea.";
		Impact="Loss of trust + data errors. Users can't undo a misclick.";
		CodeRefs="- ``src/lib/server/repositories/ideas.js`` -- ``convertIdeaToEvent`` sets defaults`n- ``src/routes/ideas/+page.server.js`` -- convert action";
		Recommendation="Add a review step before conversion (show defaults, allow editing); preserve the idea (archive status) instead of silent delete; offer undo for a short window." },
	@{ Tag="U12"; Severity="1"; Tasks="6"; Testers="TP1, TP2";
		Evidence="- 🟢 Inviting itself worked for both testers, but feedback was thin.`n- TP1 (Lukas): *""Nach dem Absenden fehlte eine deutlichere Bestätigung der Einladung.""*`n- TP2 (Sandra): *""Es fehlte höchstens die Möglichkeit für einen kurzen Einladungstext.""*";
		Cause="Successful invitation has no explicit success toast; no optional message field for the inviter.";
		Impact="Minor uncertainty -- core task succeeds, but users second-guess whether the invitation was sent.";
		CodeRefs="- ``src/lib/components/EventForm.svelte`` -- FriendPicker block`n- ``src/routes/events/new/+page.server.js`` -- success path";
		Recommendation="Add a success toast naming the recipient and showing status; optional short invitation message field for the inviter." },
	@{ Tag="U13"; Severity="3"; Tasks="7"; Testers="TP2 (primary), partial TP1";
		Evidence="- 🟠 TP2 navigated to Journey first before realising Trips is the right place.`n- TP2 (Sandra): *""Die Abgrenzung zwischen Journey und Trip sowie der Zusammenhang mit Memories war unklar.""*`n- TP1 (Lukas): grouping worked, but a missing image on one trip event was noted.";
		Cause="The Trip/Event/Journey data model is not explained in the UI; testers infer it from trial and error.";
		Impact="Grouping succeeds eventually, but the concept stays fuzzy -- users may not return to the feature.";
		CodeRefs="- ``src/routes/trips/[id]/+page.svelte`` -- trip detail`n- ``src/routes/journey/+page.svelte`` -- group-by-trip exists but is subtle";
		Recommendation="Reuse the onboarding/guide from [#39](https://github.com/difrodar/traveljourneyapp/issues/39); add a clear in-page explainer on /journey: ""planned activities -> trips, completed activities -> memories""." },
	@{ Tag="U14"; Severity="4"; Tasks="8"; Testers="TP1, TP2";
		Evidence="- 🔴 Both testers failed to locate sharing on the Trip page during task 8.`n- TP1 (Lukas): *""Share nicht über Trip-Site verfügbar.""*`n- TP2 (Sandra): *""Sharefunktion nicht in Trip vorhanden.""*";
		Cause="Sharing is currently anchored on /journey only; users approaching from Trips don't find it.";
		Impact="Central sharing task blocked; data-protection scope and access control are hard to reason about; **highest-priority issue** alongside [#46](https://github.com/difrodar/traveljourneyapp/issues/46).";
		CodeRefs="- ``src/routes/trips/[id]/+page.svelte`` -- no share entry`n- ``src/routes/journey/+page.svelte`` -- current share surface`n- ``src/lib/server/repositories/shares.js`` -- share logic already supports trip scope (see [#30](https://github.com/difrodar/traveljourneyapp/issues/30))";
		Recommendation="Introduce a central scope-aware sharing surface where events, trips, and the full journey can all be shared. Add context links from ``/events/[id]``, ``/trips/[id]``, and ``/journey`` that lead to the same dialog with the scope pre-selected.";
		AcceptanceExtra="`n- [ ] Share dialog reachable from ``/events/[id]``, ``/trips/[id]``, and ``/journey```n- [ ] Scope is pre-selected based on the entry point`n- [ ] ``npm run smoke`` passes" },
	@{ Tag="U15"; Severity="3"; Tasks="8"; Testers="TP1, TP2";
		Evidence="- 🟠 Critical function is missed or misread.`n- TP1 (Lukas): *""Share geht unter.""*`n- TP2 (Sandra): *""Share-Button in Journey zuerst nicht gesehen, Benennung völlig falsch.""*";
		Cause="Label and placement don't match users' mental model of ""sharing this trip"".";
		Impact="Critical function not found or misinterpreted; downstream sharing-scope confusion.";
		CodeRefs="- ``src/lib/components/SharePreview.svelte``, ``src/routes/journey/+page.svelte`` -- current share UI";
		Recommendation="Inside the central sharing area ([#44](https://github.com/difrodar/traveljourneyapp/issues/44)), use precise labels: ""Share event"", ""Share trip"", ""Share journey"" -- plus a scope preview that shows what will actually be shared." },
	@{ Tag="U16"; Severity="4"; Tasks="8"; Testers="TP1";
		Evidence="- 🔴 TP1 (Lukas) explicit blocker: *""2 Wochen gar nicht möglich.""*";
		Cause="Expiry presets are too restrictive (currently 1/7/30 days or never).";
		Impact="Access-control / data-protection requirement (""nach zwei Wochen wieder verschwinden"") cannot be fulfilled -- this is a **trust-critical failure**.";
		CodeRefs="- ``src/lib/server/repositories/shares.js`` -- expiry handling`n- ``src/routes/journey/+page.svelte`` -- expiry picker";
		Recommendation="Offer three presets immediately: 7, 14, 30 days. Optionally add a custom date later." },
	@{ Tag="U17"; Severity="3"; Tasks="8"; Testers="TP1, TP2";
		Evidence="- 🟠 Both testers showed uncertainty about who sees what and for how long.`n- TP1 (Lukas): *""Hättest du Datenschutzbedenken? -- Ja, weil Scope und Link-Gültigkeit klarer sichtbar sein sollten.""*`n- TP2 (Sandra): *""Hättest du Datenschutzbedenken? -- Ja, solange nicht klar sichtbar ist, was genau geteilt wird und wie lange der Link gültig bleibt.""*";
		Cause="Blocked or unclear flow prevented testers from forming a clear mental model of share scope/expiry; current warnings are embedded prose, not surfaced.";
		Impact="Data-protection risk remains unevaluated; users may share more than they realise.";
		CodeRefs="- ``src/routes/journey/+page.svelte`` -- share dialog`n- ``src/routes/share/[hash]/+page.svelte`` -- public view";
		Recommendation="Surface explicit scope + expiry summary before the link is generated (""This link will show: 3 memories, valid until 2026-06-08, anyone with the link""). Validate understanding in the next test round." },
	@{ Tag="U18"; Severity="2"; Tasks="7, 8"; Testers="TP1";
		Evidence="- 🟡 TP1 (Lukas): *""Bild fehlt bei Event; Dummydaten haben falsche Bilder.""*";
		Cause="Seed data was not fully consistent for the demo accounts used in tasks 7 and 8 (``demo_traveler``).";
		Impact="Can erode trust and bias test results -- testers focus on broken visuals instead of the feature being tested.";
		CodeRefs="- ``scripts/seed-usability-test-account.js`` -- Milan/Italy seed`n- ``scripts/fix-walkthrough-images.js`` -- image-mapping logic";
		Recommendation="Clean up seed data, validate every image renders, extend the pre-test setup checklist with a render check." }
)

Write-Output "Patching $($issues.Count) GitHub issue bodies...`n"

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

foreach ($issue in $issues) {
	$num = $tagToNumber[$issue.Tag]
	$acceptanceExtra = ""
	if ($issue.ContainsKey('AcceptanceExtra')) { $acceptanceExtra = $issue.AcceptanceExtra }

	$body = New-FixedBody `
		-Severity $issue.Severity `
		-Tasks $issue.Tasks `
		-Testers $issue.Testers `
		-Evidence $issue.Evidence `
		-Cause $issue.Cause `
		-Impact $issue.Impact `
		-Recommendation $issue.Recommendation `
		-CodeRefs $issue.CodeRefs `
		-AcceptanceExtra $acceptanceExtra

	$tmpFile = New-TemporaryFile
	# Critical: write WITHOUT BOM so gh doesn't include it in the body
	[System.IO.File]::WriteAllText($tmpFile, $body, $utf8NoBom)

	Write-Output ("  Patching #$num [$($issue.Tag)]...")
	try {
		gh issue edit $num --body-file $tmpFile | Out-Null
		Write-Output "    -> ok"
	} catch {
		Write-Output "    -> FAIL: $_"
	} finally {
		Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
	}
}

Write-Output "`n=== Done. Verify with: gh issue view 44 ==="
