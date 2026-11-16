import { Chess } from 'chess.js'
import type { DrawShape } from 'chessground/draw'
import type { Key } from 'chessground/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Line } from '../openings'
import { legalDests } from '../lib/chess'
import { playMoveSound, sounds } from '../lib/sound'
import {
  getCard,
  nextDueTime,
  pickNext,
  recordResult,
  resetProgress,
  status,
  type CardStatus,
  type DrillColor,
} from '../lib/srs'
import type { TreeNode } from '../lib/tree'
import Board from './Board'
import LineList from './LineList'

type SideSetting = DrillColor | 'both'

interface Props {
  lines: Line[]
  tree: TreeNode
  request?: { lineId: string; nonce: number }
  onStudy: (lineId: string) => void
}

interface Session {
  lineId: string
  color: DrillColor
  hinted: boolean
}

const OPP_DELAY = 450

function loadSide(): SideSetting {
  try {
    const s = localStorage.getItem('lct.side')
    if (s === 'white' || s === 'black' || s === 'both') return s
  } catch {
    /* ignore */
  }
  return 'both'
}

function fmtWhen(t: number) {
  const ms = t - Date.now()
  if (ms <= 0) return 'now'
  const h = ms / 3600000
  if (h < 1) return `in ${Math.max(1, Math.round(ms / 60000))} min`
  if (h < 20) return `in ${Math.round(h)} h`
  if (h < 36) return 'tomorrow'
  return `in ${Math.round(h / 24)} days`
}

export default function DrillView({ lines, tree, request, onStudy }: Props) {
  const lineById = useMemo(() => new Map(lines.map(l => [l.id, l])), [lines])
  const ids = useMemo(() => lines.map(l => l.id), [lines])
  const [side, setSideState] = useState<SideSetting>(loadSide)
  const [session, setSession] = useState<Session | null>(null)
  const [ply, setPly] = useState(0)
  const [tries, setTries] = useState(0) // wrong tries on the current move
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'good' | 'bad' | 'info'; text: string } | null>(null)
  const [resetKey, setResetKey] = useState(0)
  const [tick, setTick] = useState(0) // re-render progress after saving
  const [confirmReset, setConfirmReset] = useState(false)
  const lastColor = useRef<DrillColor>('black')

  const setSide = (s: SideSetting) => {
    setSideState(s)
    try {
      localStorage.setItem('lct.side', s)
    } catch {
      /* ignore */
    }
  }

  const start = useCallback(
    (lineId: string, color: DrillColor) => {
      const card = getCard(lineId, color)
      setSession({ lineId, color, hinted: !card?.seen })
      setPly(0)
      setTries(0)
      setMistakes(0)
      setShowHint(false)
      setFeedback(null)
      setResetKey(k => k + 1)
      lastColor.current = color
    },
    [],
  )

  /** Choose the next line to drill. Returns false if nothing is due or new. */
  const startNext = useCallback(
    (s: SideSetting = side, exclude?: string): boolean => {
      const colors: DrillColor[] =
        s === 'both' ? (lastColor.current === 'white' ? ['black', 'white'] : ['white', 'black']) : [s]
      // Prefer due reviews in any colour before new lines.
      for (const c of colors) {
        const id = pickNext(ids, c, exclude)
        if (id && getCard(id, c)?.seen) {
          start(id, c)
          return true
        }
      }
      for (const c of colors) {
        const id = pickNext(ids, c, exclude)
        if (id) {
          start(id, c)
          return true
        }
      }
      setSession(null)
      return false
    },
    [ids, side, start],
  )

  // Requests from Learn mode ("Drill this line").
  useEffect(() => {
    if (!request) return
    const c: DrillColor = side === 'both' ? (lastColor.current === 'white' ? 'black' : 'white') : side
    start(request.lineId, c)
  }, [request])

  // Start something on first open.
  useEffect(() => {
    if (!request) startNext()
  }, [])

  const line = session ? lineById.get(session.lineId)! : undefined
  const moves = useMemo(() => line?.moves ?? [], [line])
  const finished = !!line && ply >= moves.length

  // Board position after `ply` moves of the line.
  const { chess, node, lastMove } = useMemo(() => {
    const c = new Chess()
    let n: TreeNode = tree
    let lm: Key[] | undefined
    for (let i = 0; i < ply && i < moves.length; i++) {
      const m = c.move(moves[i].san)
      lm = [m.from as Key, m.to as Key]
      n = n.children.find(ch => ch.san === m.san) ?? n
    }
    return { chess: c, node: n, lastMove: lm }
  }, [moves, ply, tree])

  const userTurn = !!session && !finished && (ply % 2 === 0) === (session.color === 'white')
  const expected = !finished ? moves[ply] : undefined

  // Opponent replies automatically.
  useEffect(() => {
    if (!session || finished || userTurn) return
    const t = setTimeout(() => {
      playMoveSound(moves[ply].san)
      setPly(p => p + 1)
    }, ply === 0 ? 600 : OPP_DELAY)
    return () => clearTimeout(t)
  }, [session, finished, userTurn, ply, moves])

  // Save the result when the line is done.
  const recorded = useRef<string>('')
  useEffect(() => {
    if (!session || !finished) return
    const key = `${session.lineId}:${session.color}:${resetKey}`
    if (recorded.current === key) return
    recorded.current = key
    recordResult(session.lineId, session.color, mistakes, session.hinted)
    if (mistakes === 0) sounds.success()
    setTick(t => t + 1)
  }, [finished, session, mistakes, resetKey])

  const expectedMove = useMemo(() => {
    if (!expected) return undefined
    const c = new Chess(chess.fen())
    return c.move(expected.san)
  }, [chess, expected])

  const onMove = (from: Key, to: Key) => {
    if (!session || !expectedMove) return
    const c = new Chess(chess.fen())
    let played
    try {
      played = c.move({ from, to, promotion: 'q' })
    } catch {
      setResetKey(k => k + 1)
      return
    }
    if (played.san === expectedMove.san) {
      playMoveSound(played.san)
      setPly(p => p + 1)
      setTries(0)
      setShowHint(false)
      setFeedback(tries ? { kind: 'good', text: 'Correct.' } : null)
      return
    }
    // A book move from a different line isn't a mistake, just not this drill.
    const other = node.children.find(ch => ch.san === played.san)
    if (other) {
      sounds.move()
      setFeedback({
        kind: 'info',
        text: `${played.san} is book too (${lineById.get(other.lineIds[0])!.name}), but this drill covers a different move. Try again.`,
      })
      setResetKey(k => k + 1)
      return
    }
    sounds.error()
    const t = tries + 1
    setTries(t)
    setMistakes(m => m + (t === 1 ? 1 : 0))
    setShowHint(t >= 2)
    setFeedback({ kind: 'bad', text: t >= 2 ? 'Not quite. Play the arrow.' : `${played.san} isn't the book move. One more try.` })
    setResetKey(k => k + 1)
  }

  const hint = () => {
    if (!showHint && tries === 0) setMistakes(m => m + 1)
    setShowHint(true)
  }

  const shapes = useMemo<DrawShape[]>(() => {
    if (!userTurn || !expectedMove) return []
    if (showHint || session?.hinted)
      return [{ orig: expectedMove.from as Key, dest: expectedMove.to as Key, brush: 'green' }]
    return []
  }, [userTurn, expectedMove, showHint, session])

  const dests = useMemo(() => legalDests(chess), [chess])

  // Note from the last move played, shown while drilling.
  const lastNote = ply > 0 ? moves[ply - 1]?.comment : undefined

  const colorsFor = (s: SideSetting): DrillColor[] => (s === 'both' ? ['white', 'black'] : [s])
  const counts = useMemo(() => {
    const out: Record<CardStatus, number> = { new: 0, learning: 0, due: 0, learned: 0 }
    for (const c of colorsFor(side)) for (const id of ids) out[status(id, c)]++
    return out
  }, [ids, side, finished, session, tick])

  const badge = (l: Line) => (
    <span className="dots">
      {colorsFor(side).map(c => (
        <span key={c} className={`dot ${status(l.id, c)} ${c}`} title={`${c}: ${status(l.id, c)}`} />
      ))}
    </span>
  )

  const caughtUpNext = !session ? nextDueTime(ids, side === 'both' ? 'white' : side) : undefined

  return (
    <div className="layout">
      <aside className="side">
        <div className="side-head">
          <div className="seg">
            {(['white', 'both', 'black'] as SideSetting[]).map(s => (
              <button
                key={s}
                className={side === s ? 'active' : ''}
                onClick={() => {
                  setSide(s)
                  startNext(s)
                }}
              >
                {s === 'both' ? 'Both' : s === 'white' ? 'As White' : 'As Black'}
              </button>
            ))}
          </div>
          <div className="stats">
            <span><i className="dot due" /> {counts.due} due</span>
            <span><i className="dot learning" /> {counts.learning} learning</span>
            <span><i className="dot learned" /> {counts.learned} learned</span>
            <span><i className="dot new" /> {counts.new} new</span>
          </div>
        </div>
        <LineList
          lines={lines}
          selectedId={session?.lineId}
          onSelect={id => start(id, side === 'both' ? (session?.color ?? 'white') : side)}
          badge={badge}
        />
        <div className="reset">
          {confirmReset ? (
            <>
              <span>Erase all progress?</span>
              <button
                className="danger"
                onClick={() => {
                  resetProgress()
                  setConfirmReset(false)
                  startNext()
                }}
              >
                Yes, reset
              </button>
              <button onClick={() => setConfirmReset(false)}>Cancel</button>
            </>
          ) : (
            <button className="link" onClick={() => setConfirmReset(true)}>Reset progress</button>
          )}
        </div>
      </aside>

      <main className="center">
        <Board
          fen={chess.fen()}
          orientation={session?.color ?? 'white'}
          turnColor={chess.turn() === 'w' ? 'white' : 'black'}
          lastMove={lastMove}
          check={chess.inCheck()}
          movableColor={userTurn ? session!.color : undefined}
          dests={dests}
          onMove={onMove}
          autoShapes={shapes}
          resetKey={resetKey}
        />
      </main>

      <aside className="panel">
        {!session && (
          <div className="panel-head">
            <h2>All caught up</h2>
            <p className="muted">
              Nothing is due{caughtUpNext ? `. Next review ${fmtWhen(caughtUpNext)}` : ''}. Pick any line on the left to practise anyway.
            </p>
          </div>
        )}
        {session && line && (
          <>
            <div className="panel-head">
              <div className="eyebrow">
                {line.group} · playing {session.color}
                {session.hinted && <span className="pill">New line: follow the arrows</span>}
              </div>
              <h2>{finished ? line.name : 'Find the book moves'}</h2>
            </div>

            <div className={`status ${finished ? 'done' : userTurn ? 'you' : 'them'}`}>
              {finished
                ? session.hinted
                  ? 'Line seen. Now try it without arrows.'
                  : mistakes === 0
                    ? `Perfect! Next review ${fmtWhen(getCard(session.lineId, session.color)?.due ?? Date.now())}.`
                    : `Done with ${mistakes} mistake${mistakes > 1 ? 's' : ''}. It'll come back soon.`
                : userTurn
                  ? 'Your move'
                  : 'Opponent is moving…'}
            </div>

            {feedback && !finished && <div className={`feedback ${feedback.kind}`}>{feedback.text}</div>}

            <div className="comment">{lastNote ? <p>{lastNote}</p> : <p className="muted">Notes appear here as you go.</p>}</div>

            <div className="progress-bar">
              <div style={{ width: `${(Math.min(ply, moves.length) / moves.length) * 100}%` }} />
            </div>

            <div className="actions">
              {finished ? (
                <>
                  {session.hinted ? (
                    <>
                      <button className="primary" onClick={() => start(session.lineId, session.color)}>Try without arrows</button>
                      <button onClick={() => startNext(side, session.lineId)}>Next line</button>
                    </>
                  ) : (
                    <>
                      <button className="primary" onClick={() => startNext(side, session.lineId)}>Next line</button>
                      <button onClick={() => start(session.lineId, session.color)}>Again</button>
                    </>
                  )}
                  <button onClick={() => onStudy(session.lineId)}>Study in Learn</button>
                </>
              ) : (
                <>
                  <button onClick={hint} disabled={!userTurn || showHint || session.hinted}>Show me</button>
                  <button onClick={() => start(session.lineId, session.color)}>Restart</button>
                  <button onClick={() => startNext(side, session.lineId)}>Skip</button>
                </>
              )}
            </div>
          </>
        )}
        <p className="tip">Right-click and drag to draw arrows while you think.</p>
      </aside>
    </div>
  )
}
