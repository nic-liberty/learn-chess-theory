import type { ParsedMove } from './types'

/** Parse "1.e4 e5 {note} 2.Nf3" into SAN moves with optional notes. */
export function parseMoves(pgn: string): ParsedMove[] {
  const moves: ParsedMove[] = []
  const re = /\{([^}]*)\}|([^\s{}]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(pgn))) {
    if (m[1] !== undefined) {
      const last = moves[moves.length - 1]
      if (!last) throw new Error(`Comment before first move: ${m[1]}`)
      const text = m[1].trim().replace(/\s+/g, ' ')
      last.comment = last.comment ? `${last.comment} ${text}` : text
      continue
    }
    const token = m[2].replace(/^\d+\.(\.\.)?/, '')
    if (token) moves.push({ san: token })
  }
  return moves
}
