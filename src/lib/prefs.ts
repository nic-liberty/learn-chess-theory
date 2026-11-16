import type { DrillColor } from './srs'

function get(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function set(key: string, v: string) {
  try {
    localStorage.setItem(key, v)
  } catch {
    /* ignore */
  }
}

/** Which side the user trains in a course. Defaults to the course's own side. */
export function trainColor(openingId: string, fallback: DrillColor): DrillColor {
  const v = get(`lct.color.${openingId}`)
  return v === 'white' || v === 'black' ? v : fallback
}
export function setTrainColor(openingId: string, c: DrillColor) {
  set(`lct.color.${openingId}`, c)
}

/** How many new lines a Learn session covers. */
export const LEARN_BATCH = 5
/** Most lines in one Review session. */
export const REVIEW_BATCH = 20
