# Learn Chess Theory

A website for learning and practising chess opening theory, on a board that looks and feels like lichess.

Right now it covers the **Scotch Game** (1.e4 e5 2.Nf3 Nc6 3.d4): 32 lines across the Schmidt/Mieses, Scotch Four Knights, Classical, Steinitz, sidelines, Scotch Gambit and Göring Gambit. More openings will follow.

## Features

- **Opening catalog.** Each opening is a course card with your progress and due reviews.
- **Course page.** Lines grouped into chapters, each marked New, Learning, Due or Learned. One button starts the right session: review what's due, or learn the next 5 new lines. Train as White or Black, tracked separately.
- **Learn sessions.** Each new line is played once with arrows and notes, then straight away from memory.
- **Review sessions.** Due lines, no arrows. A wrong move snaps back with one more try, then the answer shows. Lines with slips come back again at the end of the session. A summary closes every session.
- **Spaced repetition.** Clean lines come back after 1, 3, 7, 16, 35, then 90 days; missed lines come back right away. Progress is saved in your browser, with no account needed.
- **Browse all lines.** An explorer for every branch with notes, book-move arrows and keyboard navigation (arrow keys, `f` flips).
- **Eval bar.** A lichess-style gauge beside the board shows Stockfish's evaluation of every book position. Toggle it with the ± button (or `e` in Learn mode).
- **Lichess-style board.** Built on [chessground](https://github.com/lichess-org/chessground), lichess's own board. Right-click and drag to draw arrows, right-click a square to circle it, and hold Shift, Ctrl or Alt for other colors.

## Running it locally

```bash
npm install
npm run dev
```

## Adding an opening

1. Create `src/openings/<name>.ts` that exports an `Opening` (copy `scotch.ts` as a template).
2. Add it to the `openings` list in `src/openings/index.ts`.
3. Run `npm run evals` to analyse the new positions with Stockfish for the eval bar (needs Stockfish installed; only new positions are analysed), and add the new JSON file to `src/lib/evals.ts`.
4. Run `npm run check` to check that every move is legal. If Stockfish is installed, `npm run check:engine` also flags moves that lose a lot of evaluation.

Each line is written as plain moves with optional `{notes}`:

```ts
{ id: 'my-line', group: 'Main line', name: 'Something 5.Nc3', pgn: '1.e4 e5 2.Nf3 Nc6 3.d4 {Note on this move.} exd4 4.Nxd4' }
```

Never rename a line's `id` after it ships, because saved progress is keyed by it.

## Deploying

Pushes to `main` build and deploy to GitHub Pages through `.github/workflows/deploy.yml`. Turn it on once in **Settings → Pages → Source: GitHub Actions**. Pages on a private repo needs GitHub Pro; otherwise make the repo public.

## Tech

Vite, React, TypeScript, chessground, chess.js.
