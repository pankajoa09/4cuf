# Daily car-event update

The public car calendar is sourced from `data/events.json`, with one-to-one Thai translations in `data/events-th.json`. The English and Thai homepages contain generated fallback copies so they still work if a JSON request fails. The same sync command generates crawlable English and Thai event detail pages under `events/` and `th/events/`, plus `sitemap.xml` and `robots.txt`.

## Scheduled task

The exact agent prompt is stored in `DAILY_TASK_PROMPT.md`. A macOS launch agent runs it through Codex CLI with live web search every day at 08:00 local time.

The source template is `automation/com.4cuf.daily-update.plist`; the installed copy belongs at `~/Library/LaunchAgents/com.4cuf.daily-update.plist`. The launch agent uses a dedicated checkout at `~/Library/Application Support/4cuf-automation/repo` because macOS blocks unattended processes from reading repositories under `Documents` unless the shell receives Full Disk Access.

Before starting research, the runner refuses a dirty checkout and fast-forwards it from the tracked remote branch. This keeps the unattended checkout aligned with site changes made elsewhere.

The prompt instructs the agent to:

- Abort safely when the repository already has uncommitted work.
- Search public English and Thai sources.
- Verify near-term listings and discover newly announced events.
- Edit only sourced facts and never invent an update.
- Translate new or changed public event text into Thai.
- Validate, commit, and push only genuine event-data changes.

Suggested schedule: every day at 08:00 Asia/Bangkok.

## Source watchlist

- Thailand Super Series and Chang International Circuit
- RAAT and Thailand Super Turbo / Super Endurance
- Toyota Gazoo Racing Thailand and D1GP Thailand
- BITEC, IMPACT, QSNCC, Bira Circuit, and Thailand Circuit
- Bangkok International Motor Show, Motor Expo, FAST Auto Show, Big Motor Sale, and IMPACT Speed Fest
- Rising Sunday, Only Octane, marque clubs, and established local meet organizers

General searches should include Thai terms such as `งานรถ`, `มีตติ้งรถ`, `สนามแข่ง`, `แทร็กเดย์`, `มอเตอร์โชว์`, and `อีเวนต์รถยนต์`, plus the current month and year.

## Manual commands

```sh
node scripts/sync-events.mjs
node scripts/sync-events.mjs --check
```

The first command validates both language datasets and regenerates the embedded fallbacks, bilingual event detail pages, sitemap, and robots file. The second fails if either dataset is invalid, a translation is missing, or any generated output is stale.
