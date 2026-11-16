# Learn Chess Theory

A website for learning and practising chess opening theory, on a board that looks and feels like lichess.

Right now it covers the **Scotch Game** (1.e4 e5 2.Nf3 Nc6 3.d4): 32 lines across the Schmidt/Mieses, Scotch Four Knights, Classical, Steinitz, sidelines, Scotch Gambit and Göring Gambit. More openings will follow.

## Features

- **Learn mode.** Step through every line with short notes on the key moves. Book moves show as arrows, and you can play them on the board or click them in the list. Arrow keys move through the line, `f` flips the board.
- **Drill mode.** Play the moves yourself while the site plays the replies, as White, Black or both. New lines start with hint arrows. A wrong move snaps back and gives you one more try before the answer appears.
- **Spaced repetition.** Lines you know come back less often (1, 3, 7, 16, 35, 90 days), and lines you miss come back right away. Progress is saved in your browser, with no account needed.
- **Lichess-style board.** Built on [chessground](https://github.com/lichess-org/chessground), lichess's own board. Right-click and drag to draw arrows, right-click a square to circle it, and hold Shift, Ctrl or Alt for other colours.

## Running it locally

```bash
npm install
npm run dev
```

## Adding an opening

1. Create `src/openings/<name>.ts` that exports an `Opening` (copy `scotch.ts` as a template).
2. Add it to the `openings` list in `src/openings/index.ts`.
3. Run `npm run check` to check that every move is legal. If Stockfish is installed, `npm run check:engine` also flags moves that lose a lot of evaluation.

Each line is written as plain moves with optional `{notes}`:

```ts
{ id: 'my-line', group: 'Main line', name: 'Something 5.Nc3', pgn: '1.e4 e5 2.Nf3 Nc6 3.d4 {Note on this move.} exd4 4.Nxd4' }
```

Never rename a line's `id` after it ships, because saved progress is keyed by it.

## Deploying

Pushes to `main` build and deploy to GitHub Pages through `.github/workflows/deploy.yml`. Turn it on once in **Settings → Pages → Source: GitHub Actions**. Pages on a private repo needs GitHub Pro; otherwise make the repo public.

## Tech

Vite, React, TypeScript, chessground, chess.js.
