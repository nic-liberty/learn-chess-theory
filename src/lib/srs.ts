// Spaced repetition (Leitner boxes), saved in the browser.
const KEY = 'lct.progress.v1'
const DAY = 24 * 60 * 60 * 1000
/** Wait after a clean run, by box. Box 0 means "learning". */
const INTERVALS = [0, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY, 90 * DAY]

export type DrillColor = 'white' | 'black'

export interface CardState {
  box: number
  due: number
  seen: boolean
  reps: number
  lapses: number
}

type Store = Record<string, CardState>

function load(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Store
  } catch {
    return {}
  }
}

function save(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* storage unavailable: progress lasts for this visit only */
  }
}

let store: Store = load()

export const cardKey = (lineId: string, color: DrillColor) => `${lineId}:${color}`

export function getCard(lineId: string, color: DrillColor): CardState | undefined {
  return store[cardKey(lineId, color)]
}

/** Record a finished drill. `hinted` = the line was new and shown with arrows. */
export function recordResult(lineId: string, color: DrillColor, mistakes: number, hinted: boolean) {
  const k = cardKey(lineId, color)
  const prev = store[k] ?? { box: 0, due: 0, seen: false, reps: 0, lapses: 0 }
  const now = Date.now()
  let box = prev.box
  if (hinted) box = 0
  else if (mistakes === 0) box = Math.min(box + 1, INTERVALS.length - 1)
  else {
    box = 0
    prev.lapses++
  }
  store = { ...store, [k]: { box, due: now + INTERVALS[box], seen: true, reps: prev.reps + 1, lapses: prev.lapses } }
  save(store)
}

export function resetProgress() {
  store = {}
  save(store)
}

export type CardStatus = 'new' | 'learning' | 'due' | 'learned'

export function status(lineId: string, color: DrillColor, now = Date.now()): CardStatus {
  const c = getCard(lineId, color)
  if (!c || !c.seen) return 'new'
  if (c.box === 0) return 'learning'
  return c.due <= now ? 'due' : 'learned'
}

/** Pick the next line: overdue/learning first, then new lines in book order. */
export function pickNext(lineIds: string[], color: DrillColor, exclude?: string): string | undefined {
  const now = Date.now()
  const candidates = lineIds.filter(id => id !== exclude || lineIds.length === 1)
  const due = candidates
    .map(id => ({ id, c: getCard(id, color) }))
    .filter(x => x.c?.seen && x.c.due <= now)
    .sort((a, b) => a.c!.due - b.c!.due)
  if (due.length) return due[0].id
  const fresh = candidates.find(id => !getCard(id, color)?.seen)
  return fresh
}

export function nextDueTime(lineIds: string[], color: DrillColor): number | undefined {
  const times = lineIds.map(id => getCard(id, color)?.due).filter((t): t is number => t !== undefined)
  return times.length ? Math.min(...times) : undefined
}
