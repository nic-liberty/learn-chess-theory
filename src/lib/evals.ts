import scotch from '../openings/evals/scotch.json'

/** White-POV evals: centipawns, or "#N"/"#-N" for mate. Made by `npm run evals`. */
export type Eval = number | string

const byOpening: Record<string, Record<string, Eval>> = { scotch }

export function getEval(openingId: string, fen: string): Eval | undefined {
  return byOpening[openingId]?.[fen.split(' ').slice(0, 4).join(' ')]
}

/** Share of the bar that is White, 0–1. Same curve lichess uses for its eval gauge. */
export function whiteShare(ev: Eval): number {
  if (typeof ev === 'string') return ev.startsWith('#-') ? 0 : 1
  const winning = 2 / (1 + Math.exp(-0.00368208 * ev)) - 1
  return 0.5 + 0.5 * Math.max(-1, Math.min(1, winning))
}

export function formatEval(ev: Eval): string {
  if (typeof ev === 'string') return ev.replace('-', '')
  const p = Math.abs(ev / 100)
  return (ev > 0 ? '+' : ev < 0 ? '−' : '') + (p >= 10 ? p.toFixed(0) : p.toFixed(1))
}

const KEY = 'lct.evalbar'
export function loadShowEval(): boolean {
  try {
    return localStorage.getItem(KEY) !== '0'
  } catch {
    return true
  }
}
export function saveShowEval(v: boolean) {
  try {
    localStorage.setItem(KEY, v ? '1' : '0')
  } catch {
    /* ignore */
  }
}
