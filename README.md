# Kentucky lineup tracker, 2026-27

Which five-man lineups Kentucky men's basketball uses most, and how each one performs.

Live page: https://eric-t-ringer.github.io/UK-basketball-lineup-stats/

## How it updates

The morning after each game, a scheduled task reads the "Line Up Analysis" and box score pages of Kentucky's official box score (posted at ukathletics.com), checks that the lineup totals match the final score and game length, and commits the refreshed files in `data/`:

- `data/kentucky_lineup_stints.json` — one row per five-man unit per game
- `data/kentucky_schedule.json` — the schedule, with results
- `data/kentucky_player_games.json` — each player's box score line per game (player stats tables, Notable dates)
- `data/kentucky_team_games.json` — Kentucky's and the opponent's team totals per game (rebound percentages, usage)

The page (`index.html` + `shim.js`) computes every figure in the browser from those two files. d3 v7.9.0 is bundled in `vendor/` (ISC license), so the page loads nothing from other servers.

Unofficial fan project, not affiliated with the University of Kentucky.
