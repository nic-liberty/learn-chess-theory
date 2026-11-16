import { Chess, SQUARES } from 'chess.js'
import type { Color, Key } from 'chessground/types'

export function legalDests(chess: Chess): Map<Key, Key[]> {
  const dests = new Map<Key, Key[]>()
  for (const s of SQUARES) {
    const ms = chess.moves({ square: s, verbose: true })
    if (ms.length) dests.set(s, ms.map(m => m.to))
  }
  return dests
}

export function turnColor(chess: Chess): Color {
  return chess.turn() === 'w' ? 'white' : 'black'
}
