Maintain the public Thailand car-events calendar in this repository.

Safety first:

- Run `git status --porcelain` before doing anything. If the worktree is not clean, stop without editing and report why.
- Work only on the car calendar. Do not edit `art.html`.
- Never force-push, rewrite history, delete past events, or change unrelated files.

Research:

1. Use live web search in both English and Thai.
2. Use the built-in web search only. Do not load or use browser-control skills, browser extensions, or interactive browser tools. If a social page is not publicly searchable, treat it as unavailable and move on.
3. Review every event in `data/events.json` occurring within the next 45 days.
4. Search for newly announced Thailand car meets, track days, cruises, motorsport events, and automotive shows occurring within the next 180 days.
5. Start with official organizers, circuits, venues, manufacturers, and championship calendars. Use a reputable event publication only when no organizer page is available.
6. Search Thai terms including `งานรถ`, `มีตติ้งรถ`, `สนามแข่ง`, `แทร็กเดย์`, `มอเตอร์โชว์`, and `อีเวนต์รถยนต์`, combined with the current month and year.
7. Treat Facebook or Instagram snippets as leads. Do not mark an event confirmed unless a public organizer post or another authoritative source clearly states its date and venue.

Editing rules:

- Update only sourced facts in `data/events.json`.
- Keep `data/events-th.json` synchronized whenever an event is added or its public name, location, or description changes. Translate those fields faithfully into natural Thai, preserve brand names, and do not add facts that are absent from the sourced English record.
- Keep the Thai translation IDs in one-to-one correspondence with `data/events.json`, and keep both top-level `updated_at` values identical.
- Never infer a date or venue from an annual pattern.
- Use `confirmed` only with a clear authoritative source, `tentative` when an official source is incomplete, and `cancelled` only when cancellation is explicit.
- Update an event's `last_verified` only when that event was actually checked against a source during this run.
- Change top-level `updated_at` only when public event data changes; routine verification alone is not a public update.
- Preserve past events and stable event IDs. Avoid duplicates.
- Keep descriptions factual and concise. The `url` must point directly to the best available supporting source.

Validation and publishing:

1. Run `node scripts/sync-events.mjs`.
2. Run `node scripts/sync-events.mjs --check`.
3. Run `git diff --check` and review the entire diff for unsupported claims or unrelated changes.
4. If no verified public data changed, restore any generated no-op differences and exit without committing.
5. If verified data changed and all checks pass, stage only `data/events.json`, `data/events-th.json`, `index.html`, `events/`, `th/`, `sitemap.xml`, and `robots.txt`, commit with a concise factual message, and push the current branch to `origin` so Netlify deploys it.
6. Report the searches performed, sources used, changes published, and anything needing human verification. Never publish an uncertain claim just to make a daily update.
