import { Chess } from 'chess.js'
import type { DrawShape } from 'chessground/draw'
import type { Key } from 'chessground/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Line } from '../openings'
import { legalDests } from '../lib/chess'
import { getEval } from '../lib/evals'
import { playMoveSound, sounds } from '../lib/sound'
import type { DrillColor } from '../lib/srs'
import type { TreeNode } from '../lib/tree'
import Board from './Board'

interface Props {
  openingId: string
  line: Line
  lineName: (id: string) => string
  tree: TreeNode
  color: DrillColor
  /** Show the move with an arrow every turn (first time through a line). */
  guided: boolean
  /** Label on the panel, e.g. "New line" or "Practice". */
  kind: 'new' | 'recall' | 'review' | 'retry'
  showEval: boolean
  onToggleEval: () => void
  onDone: (mistakes: number) => void
}

const OPP_DELAY = 450

const KIND_LABEL = {
  new: 'New line · watch and play',
  recall: 'Now from memory',
  review: 'Practice',
  retry: 'One more time',
}

/** Plays one line: the opponent's moves are automatic, the user must find theirs. */
export default function LineRunner(p: Props) {
  const { line, color, guided } = p
  const moves = line.moves
  const [ply, setPly] = useState(0)
  const [tries, setTries] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'good' | 'bad' | 'info'; text: string } | null>(null)
  const [resetKey, setResetKey] = useState(0)
  const [flash, setFlash] = useState<'bad' | null>(null)
  const finished = ply >= moves.length

  const { chess, node, lastMove } = useMemo(() => {
    const c = new Chess()
    let n: TreeNode = p.tree
    let lm: Key[] | undefined
    for (let i = 0; i < ply; i++) {
      const m = c.move(moves[i].san)
      lm = [m.from as Key, m.to as Key]
      n = n.children.find(ch => ch.san === m.san) ?? n
    }
    return { chess: c, node: n, lastMove: lm }
  }, [moves, ply, p.tree])

  const userTurn = !finished && (ply % 2 === 0) === (color === 'white')

  useEffect(() => {
    if (finished || userTurn) return
    const t = setTimeout(() => {
      playMoveSound(moves[ply].san)
      setPly(x => x + 1)
    }, ply === 0 ? 500 : OPP_DELAY)
    return () => clearTimeout(t)
  }, [finished, userTurn, ply, moves])

  // Finish: a clean run moves on by itself, otherwise wait for Continue.
  const done = useRef(false)
  const finish = () => {
    if (done.current) return
    done.current = true
    p.onDone(mistakes)
  }
  useEffect(() => {
    if (!finished) return
    if (mistakes === 0 && !guided) sounds.success()
    if (mistakes === 0) {
      const t = setTimeout(finish, guided ? 1400 : 900)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])
  useEffect(() => {
    if (!finished) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        finish()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const expectedMove = useMemo(() => {
    if (finished) return undefined
    return new Chess(chess.fen()).move(moves[ply].san)
  }, [chess, finished, moves, ply])

  const wrong = (text: string) => {
    sounds.error()
    setFlash('bad')
    setTimeout(() => setFlash(null), 350)
    setFeedback({ kind: 'bad', text })
    setResetKey(k => k + 1)
  }

  const onMove = (from: Key, to: Key) => {
    if (!expectedMove) return
    let played
    try {
      played = new Chess(chess.fen()).move({ from, to, promotion: 'q' })
    } catch {
      setResetKey(k => k + 1)
      return
    }
    if (played.san === expectedMove.san) {
      playMoveSound(played.san)
      setPly(x => x + 1)
      setTries(0)
      setShowHint(false)
      setFeedback(tries ? { kind: 'good', text: 'That’s it.' } : null)
      return
    }
    const other = node.children.find(ch => ch.san === played.san)
    if (other) {
      sounds.move()
      setFeedback({
        kind: 'info',
        text: `${played.san} is also theory (${p.lineName(other.lineIds[0])}), but this line goes another way. Try again.`,
      })
      setResetKey(k => k + 1)
      return
    }
    const t = tries + 1
    setTries(t)
    if (t === 1) setMistakes(m => m + 1)
    setShowHint(t >= 2)
    wrong(t >= 2 ? 'Play the move shown by the arrow.' : `${played.san} isn’t the move here. Try once more.`)
  }

  const hint = () => {
    if (!showHint && tries === 0) setMistakes(m => m + 1)
    setShowHint(true)
  }

  const shapes = useMemo<DrawShape[]>(() => {
    if (!userTurn || !expectedMove) return []
    if (guided || showHint) return [{ orig: expectedMove.from as Key, dest: expectedMove.to as Key, brush: 'green' }]
    return []
  }, [userTurn, expectedMove, guided, showHint])

  const dests = useMemo(() => legalDests(chess), [chess])
  // Notes show as the line is played; the last one stays up at the end.
  const note = [...moves.slice(0, ply)].reverse().find(m => m.comment)?.comment
  const lastNoteOnThisMove = ply > 0 && moves[ply - 1].comment
  const progress = ply / moves.length

  return (
    <div className="train-body">
      <div className={`train-board ${flash ? 'flash-bad' : ''}`}>
        <Board
          fen={chess.fen()}
          orientation={color}
          turnColor={chess.turn() === 'w' ? 'white' : 'black'}
          lastMove={lastMove}
          check={chess.inCheck()}
          movableColor={userTurn ? color : undefined}
          dests={dests}
          onMove={onMove}
          autoShapes={shapes}
          resetKey={resetKey}
          showEval={p.showEval}
          ev={getEval(p.openingId, chess.fen())}
        />
      </div>

      <aside className="train-card">
        <div className={`chip chip-${p.kind}`}>{KIND_LABEL[p.kind]}</div>
        <h2 className="train-title">{guided || finished ? line.name : line.group}</h2>
        <div className="line-progress" aria-label="Moves played">
          <div style={{ width: `${progress * 100}%` }} />
        </div>

        <div className={`turn ${finished ? 'done' : userTurn ? 'you' : 'them'}`}>
          {finished
            ? mistakes === 0
              ? guided
                ? 'Got it. Next you’ll play it from memory.'
                : 'Clean. Line complete.'
              : `Line complete with ${mistakes} slip${mistakes > 1 ? 's' : ''}. It’ll come back soon.`
            : userTurn
              ? `Your move as ${color}`
              : 'Opponent replies…'}
        </div>

        {feedback && !finished && <p className={`feedback ${feedback.kind}`}>{feedback.text}</p>}

        <div className={`note ${lastNoteOnThisMove ? 'fresh' : ''}`}>
          {note ? <p>{note}</p> : <p className="muted">Notes on key moves appear here.</p>}
        </div>

        <div className="train-actions">
          {finished ? (
            <button className="primary big" onClick={finish} autoFocus>
              Continue
            </button>
          ) : (
            <>
              <button onClick={hint} disabled={!userTurn || showHint || guided}>
                Hint
              </button>
              <button onClick={p.onToggleEval} className={p.showEval ? 'on' : ''} title="Eval bar">
                ± Eval
              </button>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
