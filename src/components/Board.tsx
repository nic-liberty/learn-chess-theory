import { Chessground } from 'chessground'
import type { Api } from 'chessground/api'
import type { DrawShape } from 'chessground/draw'
import type { Color, Key } from 'chessground/types'
import { useEffect, useRef } from 'react'
import type { Eval } from '../lib/evals'
import EvalBar from './EvalBar'
import 'chessground/assets/chessground.base.css'
import 'chessground/assets/chessground.brown.css'
import 'chessground/assets/chessground.cburnett.css'

export interface BoardProps {
  fen: string
  orientation: Color
  turnColor: Color
  lastMove?: Key[]
  check?: boolean
  /** Which side the user may move, or undefined for no moves. */
  movableColor?: Color
  dests?: Map<Key, Key[]>
  onMove?: (orig: Key, dest: Key) => void
  /** Arrows/circles the app draws (hints, book moves). User drawings are separate. */
  autoShapes?: DrawShape[]
  /** Bump this to force the board back to `fen` (e.g. after a wrong move). */
  resetKey?: number
  /** Show the eval bar with this evaluation (undefined = position not analysed). */
  showEval?: boolean
  ev?: Eval
}

/**
 * Lichess's own board (chessground). Right-click drag draws arrows, right-click
 * marks a circle; hold Shift/Ctrl/Alt for red/blue/yellow, like on lichess.
 */
export default function Board(props: BoardProps) {
  const el = useRef<HTMLDivElement>(null)
  const api = useRef<Api | null>(null)
  const onMove = useRef(props.onMove)
  onMove.current = props.onMove

  useEffect(() => {
    if (!el.current) return
    api.current = Chessground(el.current, {
      coordinates: true,
      animation: { enabled: true, duration: 200 },
      highlight: { lastMove: true, check: true },
      movable: { free: false, showDests: true, events: { after: (o, d) => onMove.current?.(o, d) } },
      premovable: { enabled: false },
      drawable: { enabled: true, visible: true, eraseOnClick: true, defaultSnapToValidMove: true },
    })
    const resize = () => document.body.dispatchEvent(new Event('chessground.resize'))
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      api.current?.destroy()
      api.current = null
    }
  }, [])

  useEffect(() => {
    api.current?.set({
      fen: props.fen,
      orientation: props.orientation,
      turnColor: props.turnColor,
      lastMove: props.lastMove,
      check: props.check ? props.turnColor : false,
      movable: { color: props.movableColor, dests: props.movableColor ? props.dests : new Map() },
    })
  }, [props.fen, props.orientation, props.turnColor, props.lastMove, props.check, props.movableColor, props.dests, props.resetKey])

  // Clear the user's own drawings whenever the position changes, like lichess.
  useEffect(() => {
    api.current?.setShapes([])
  }, [props.fen])

  useEffect(() => {
    api.current?.setAutoShapes(props.autoShapes ?? [])
  }, [props.autoShapes])

  return (
    <div className="board-row">
      {props.showEval && <EvalBar ev={props.ev} orientation={props.orientation} />}
      <div className="board-wrap">
        <div ref={el} className="board" />
      </div>
    </div>
  )
}
