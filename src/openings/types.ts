export interface LineDef {
  /** Stable id, used as the key for saved progress. Never rename once shipped. */
  id: string
  /** Section this line belongs to, e.g. "Classical (4...Bc5)". */
  group: string
  /** Full name of the line. */
  name: string
  /**
   * Moves in SAN from the starting position. Move numbers are optional.
   * Put a note on a move with {braces} right after it.
   */
  pgn: string
}

export interface Opening {
  id: string
  name: string
  eco: string
  description: string
  lines: LineDef[]
}

export interface ParsedMove {
  san: string
  comment?: string
}

export interface Line {
  id: string
  group: string
  name: string
  moves: ParsedMove[]
}
