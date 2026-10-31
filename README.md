# Kentucky lineup tracker

Which five-man lineups Kentucky men's basketball uses most, and how each one performs. Covers Mark Pope's seasons: 2024-25, 2025-26, and the current 2026-27 season.

Live page: https://eric-t-ringer.github.io/UK-basketball-lineup-stats/

## How it updates

The morning after each game, a scheduled task reads the "Line Up Analysis" and box score pages of Kentucky's official box score (posted at ukathletics.com), checks that the lineup totals match the final score and game length, and commits the refreshed files in `2026-27/data/`:

- `2026-27/data/kentucky_lineup_stints.json` — one row per five-man unit per game
- `2026-27/data/kentucky_schedule.json` — the schedule, with results
- `2026-27/data/kentucky_player_games.json` — each player's box score line per game (player stats tables, Notable dates)
- `2026-27/data/kentucky_team_games.json` — Kentucky's and the opponent's team totals per game (rebound percentages, usage)

Each season has its own folder (`2024-25/`, `2025-26/`, `2026-27/`) with a page and its `data/`; the root `index.html` is the season picker. Pages share `shim.js` and compute every figure in the browser from their season's data files. Completed seasons don't change. d3 v7.9.0 is bundled in `vendor/` (ISC license), so the page loads nothing from other servers.

Unofficial fan project, not affiliated with the University of Kentucky. Created by [Eric T. Ringer](https://www.linkedin.com/in/ericringer/).
