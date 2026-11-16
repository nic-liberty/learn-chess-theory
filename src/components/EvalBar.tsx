import type { Color } from 'chessground/types'
import { formatEval, whiteShare, type Eval } from '../lib/evals'

interface Props {
  ev?: Eval
  orientation: Color
}

/** Vertical eval gauge beside the board, like lichess. White fills from White's side. */
export default function EvalBar({ ev, orientation }: Props) {
  const share = ev === undefined ? 0.5 : whiteShare(ev)
  const whiteAhead = ev === undefined ? true : typeof ev === 'string' ? !ev.startsWith('#-') : ev >= 0
  // Number sits at the end of the side that is better.
  const labelAtBottom = whiteAhead === (orientation === 'white')
  return (
    <div className={`eval-bar ${orientation}`} title={ev === undefined ? 'No evaluation' : `Stockfish: ${formatEval(ev)}`}>
      <div className="eval-white" style={{ height: `${share * 100}%` }} />
      <div className="eval-ticks">
        {Array.from({ length: 7 }, (_, i) => (
          <i key={i} style={{ top: `${(i + 1) * 12.5}%` }} />
        ))}
      </div>
      {ev !== undefined && (
        <span className={`eval-label ${labelAtBottom ? 'bottom' : 'top'} ${whiteAhead ? 'on-white' : 'on-black'}`}>
          {formatEval(ev)}
        </span>
      )}
    </div>
  )
}
