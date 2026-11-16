# Project notes

- Do not add Claude/AI attribution to commits, PRs or comments (no Co-Authored-By, session links or "Generated with" footers). Commits should look like normal human commits.
- Opening data lives in `src/openings/`. Every line must pass `npm run check`, and ideally `npm run check:engine` (Stockfish).
- Never rename a line `id`; saved progress depends on it.
- The board must keep looking like lichess (chessground, brown board, cburnett pieces).
- After changing opening lines, run `npm run evals` so the eval bar covers the new positions.
