# CLAUDE.md

Working agreement for Claude Code on TripTales. Historical Codex instructions are archived at [docs/legacy/codex_custom_instructions.md](docs/legacy/codex_custom_instructions.md) — this file replaces them. Scope-completed sections of the legacy doc (MVP requirements, route inventory, component checklist, methodology phases) are intentionally not duplicated here; the codebase, the README, and `git log` are authoritative for what shipped.

## Stack

- **SvelteKit 2.57** + **Svelte 5 with runes mode forced** (see [svelte.config.js](svelte.config.js)). No `$:` reactivity, no `on:event=` syntax. Use `$state`, `$derived`, `$effect`, `onevent={…}`.
- **JavaScript only.** [jsconfig.json](jsconfig.json) has `checkJs: false`. TypeScript is installed but unused — don't introduce `.ts` without asking.
- **MongoDB 7.2** via [src/lib/server/db.js](src/lib/server/db.js). Server-only code lives in [src/lib/server/](src/lib/server/) and must never be imported from `.svelte` files or non-server `.js`.
- **Auth:** scrypt + salted passwords, hashed session tokens, HttpOnly cookies — [src/lib/server/auth.js](src/lib/server/auth.js), [src/hooks.server.js](src/hooks.server.js). **Every repository query scopes by `userId`.** Preserve that invariant on every new query.
- **Leaflet + OpenStreetMap.** **Netlify adapter.** **npm.** Node 18+.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server at http://localhost:5173 |
| `npm run build` | Production build (catches Svelte + unresolved-import errors) |
| `npm run smoke` | End-to-end check: login → create → list → memory → journey → delete |
| `npm run seed` / `npm run upsert:samples` | Demo data |
| `npm run normalize:*` / `cleanup:*` | Idempotent data-migration scripts |

There is no test runner, linter, formatter, or `svelte-check` script. Run `npx svelte-check` manually if a TS-aware check is needed.

## Code layout

- [src/routes/](src/routes/) — file-based routes; `+page.server.js` for loads + form actions, `+page.svelte` for view.
- [src/lib/components/](src/lib/components/) — reusable UI.
- [src/lib/server/](src/lib/server/) — server-only. [repository.js](src/lib/server/repository.js) is a barrel re-exporting from [repositories/](src/lib/server/repositories/) (`shared`, `events`, `journey`, `ideas`, `seed`).
- [src/lib/utils/](src/lib/utils/) — pure helpers (e.g. [event-format.js](src/lib/utils/event-format.js)).
- [src/lib/constants.js](src/lib/constants.js) — shared categories, upload limits, MIME allowlist.

## Working rules (kept from legacy §3, §4, §5, §17)

- **Plan first** for changes touching >3 files, public component APIs, route contracts, data shapes, or new dependencies. Use Claude Code plan mode.
- **Iterate.** Small, dokumentierbare Schritte. No big-bang rewrites; one logical change at a time.
- **README kapitelstruktur is immutable.** Add bullets inside existing sections; never add, rename, or reorder `##` or `###`.
- **Document new features in the appropriate existing section** of [README.md](README.md) (codex §5). Internal tooling/dev-only scripts are exempt.
- **Never invent evaluation results, URLs, sketches, sources, testers, or Figma links.** `[…ergänzen]` placeholders stay until real data lands.
- **Empty/loading states required** on every list view.
- **Image uploads:** Up to 5 images per event/memory, 2 MB max per image, 9 MB total per item; JPG/PNG/WebP/GIF only. Stored as `images: [{ url, alt, credit?, license?, sourceUrl? }]`. Server-side check in `uploadedImagesFields` ([shared.js](src/lib/server/repositories/shared.js)) is the source of truth; client guards in [EventForm.svelte](src/lib/components/EventForm.svelte) and [MemoryForm.svelte](src/lib/components/MemoryForm.svelte).
- **Priority order:** Stabilität → Workflows → Dokumentation → Usability → Code-Struktur → Evaluation → Erweiterungen → optische Verfeinerung.
- **KI-Deklaration honesty.** When Claude Code makes substantive contributions, [README §6.1](README.md#L184) tracks who used what. Don't silently add work without declaring it.

## Hard constraints — don't (legacy §3, §18)

- **No overengineering.** Pick the smallest change that solves the problem. Three repeated lines beat a premature abstraction.
- **No experimental libraries** without a clear, stated benefit and approval.
- **No new dependencies** without justification (legacy §3, §18).
- **No monster components or monster modules.** If a `.svelte` file pushes ~300 lines of logic (CSS-only is fine) or a server module pushes ~500 lines, plan a split. Models: the [repositories/](src/lib/server/repositories/) split, the [DeleteRecurringDialog.svelte](src/lib/components/DeleteRecurringDialog.svelte) / [MemoryForm.svelte](src/lib/components/MemoryForm.svelte) extractions.
- **No hardcoded fake data as the only data source** (legacy §3). Demo data may be a fallback (e.g. seed for `difrodar`); user-created data must persist.
- **No unlicensed third-party assets.** Code is MIT (see [LICENSE](LICENSE)); image attributions live in [README §7](README.md#L195) and must stay accurate.
- **No features that destabilize the MVP** (legacy §3). Extensions land only when the core flows still work.
- **No `--no-verify`, no `--force` push to main, no destructive git operations** without explicit user instruction.
- **No reformatting files you aren't editing.** Stay in scope.
- **No placeholder TODO stubs presented as completed work** — say "not done" if it's not done.

## UI / UX rules (legacy §10)

- Clear navigation; consistent button labels; mobile-friendly layout; legible typography; sinnvolle Abstände; visible visual hierarchy.
- Feedback after save/edit (success message or redirect). Validation errors must appear feldnah (next to the offending field), not as a single global blob.
- Empty states explain the next sensible action; loading states whenever data is async.
- No hidden main functions, no decorative-only features, no inconsistent button text, no overloaded screens.

## Uncertainty handling (legacy §19)

- **Surface uncertainty** rather than guess silently.
- **Propose a safe minimal variant** when unsure of scope or approach.
- **Don't invent assumptions** — ask before making a load-bearing project decision.
- **For technical alternatives, name pros and cons** instead of picking unilaterally.
- A short clarifying question is cheaper than the wrong implementation.

## Git hygiene (legacy §15)

- Commits are small, sprechend, and follow the existing style (e.g. `feat: …`, `fix: …`, `docs: …`, `refactor: …`).
- One logical change per commit; if a refactor and a feature land together, split them.
- Branches are descriptive (`feature/…`, `fix/…`, `refactor/…`).
- Never commit secrets; `.env` is gitignored, `.env.example` is the source of truth for required env vars.
- Don't commit unless the user asks. Prefer staging and showing `git status` for review.

## Outdated guidance in the archived doc

- [Archived doc §9](docs/legacy/codex_custom_instructions.md) data model is stale — it shows free-text `Friend.name`, but Extension 4.8 migrated to `invitedUserIds` + `invitations` referencing real users. Defer to the live schema in [repositories/events.js](src/lib/server/repositories/events.js).
- [Archived doc §6, §7, §8, §11](docs/legacy/codex_custom_instructions.md) describe the MVP requirements, route inventory, component checklist, and Design-Sprint methodology phases. All shipped. Don't regenerate from those sections; defer to the codebase and [README §3.4](README.md#L84).

## Svelte gotchas in this codebase

- **Runes only.** No `let count` for reactive state; use `let count = $state(0)`.
- **Form actions called via fetch return a JSON envelope** (`{type:"redirect"|"success"|"failure", …}`) at HTTP 200, not a real 303. Pattern in [scripts/smoke.js](scripts/smoke.js).
- **SSR boundary.** Anything from `$lib/server/**` is server-only. Browser-only APIs need an `import { browser } from "$app/environment"` guard.
- **Don't shadow the `event` prop name** when writing DOM event handlers — use `domEvent` or `e`.
- **Don't suppress a11y warnings** without an explanation in a comment.

## Verification before declaring done

1. `npm run build` — must be clean.
2. If server / form-action / route code changed: `npm run smoke` — must pass.
3. If UI changed: state explicitly which route + interaction was clicked in `npm run dev`. No "should work" claims.
4. If a new feature shipped: README updated in the appropriate existing section. No new chapters.
5. No new dependencies introduced without justification.
