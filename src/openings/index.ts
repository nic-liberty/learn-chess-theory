import { parseMoves } from './parse'
import { scotch } from './scotch'
import type { Line, Opening } from './types'

/** Add new openings here. Each one gets its own file like scotch.ts. */
export const openings: Opening[] = [scotch]

export function getLines(opening: Opening): Line[] {
  return opening.lines.map(l => ({ id: l.id, group: l.group, name: l.name, moves: parseMoves(l.pgn) }))
}

export type { Line, Opening } from './types'

import { Chess } from 'chess.js'
export function previewFen(opening: Opening): string {
  const c = new Chess()
  for (const m of parseMoves(opening.previewMoves)) c.move(m.san)
  return c.fen()
}
