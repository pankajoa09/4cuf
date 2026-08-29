# Daily car-event update

The public car calendar is sourced from `data/events.json`. `index.html` contains a generated fallback copy so the page still works if the JSON request fails.

## Scheduled task

The exact agent prompt is stored in `DAILY_TASK_PROMPT.md`. A macOS launch agent runs it through Codex CLI with live web search every day at 08:00 local time.

The source template is `automation/com.4cuf.daily-update.plist`; the installed copy belongs at `~/Library/LaunchAgents/com.4cuf.daily-update.plist`. The launch agent uses a dedicated checkout at `~/Library/Application Support/4cuf-automation/repo` because macOS blocks unattended processes from reading repositories under `Documents` unless the shell receives Full Disk Access.

The prompt instructs the agent to:

- Abort safely when the repository already has uncommitted work.
- Search public English and Thai sources.
- Verify near-term listings and discover newly announced events.
- Edit only sourced facts and never invent an update.
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

The first command validates `data/events.json` and regenerates the embedded fallback. The second fails if the data is invalid or the fallback is stale.
