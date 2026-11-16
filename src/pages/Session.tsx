import { useMemo, useState } from 'react'
import LineRunner from '../components/LineRunner'
import type { Line, Opening } from '../openings'
import { courseStats, dueLines, getCard, recordResult, type DrillColor } from '../lib/srs'
import type { TreeNode } from '../lib/tree'

export type SessionMode = 'learn' | 'review' | 'single'

interface Item {
  lineId: string
  kind: 'new' | 'recall' | 'review' | 'retry'
}

interface Result {
  lineId: string
  kind: Item['kind']
  mistakes: number
}

interface Props {
  opening: Opening
  lines: Line[]
  tree: TreeNode
  color: DrillColor
  mode: SessionMode
  lineIds: string[]
  showEval: boolean
  onToggleEval: () => void
  onExit: () => void
  onNext: (mode: 'learn' | 'review') => void
}

function buildQueue(mode: SessionMode, ids: string[], color: DrillColor): Item[] {
  if (mode === 'learn') return ids.flatMap(id => [{ lineId: id, kind: 'new' as const }, { lineId: id, kind: 'recall' as const }])
  if (mode === 'review') return ids.map(id => ({ lineId: id, kind: 'review' as const }))
  // A single line: show it first if it has never been seen.
  const id = ids[0]
  return getCard(id, color)?.seen
    ? [{ lineId: id, kind: 'review' }]
    : [{ lineId: id, kind: 'new' }, { lineId: id, kind: 'recall' }]
}

function fmtWhen(t: number) {
  const ms = t - Date.now()
  if (ms <= 60000) return 'in a minute'
  const h = ms / 3600000
  if (h < 1) return `in ${Math.round(ms / 60000)} minutes`
  if (h < 20) return `in ${Math.round(h)} hours`
  if (h < 36) return 'tomorrow'
  return `in ${Math.round(h / 24)} days`
}

/** A focused training session: a queue of lines, then a summary. */
export default function Session(p: Props) {
  const lineById = useMemo(() => new Map(p.lines.map(l => [l.id, l])), [p.lines])
  const [queue, setQueue] = useState<Item[]>(() => buildQueue(p.mode, p.lineIds, p.color))
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [confirmExit, setConfirmExit] = useState(false)

  const item = queue[index]
  const done = index >= queue.length

  const onDone = (mistakes: number) => {
    const it = item
    if (it.kind === 'new') recordResult(it.lineId, p.color, 0, true)
    else if (it.kind !== 'retry') recordResult(it.lineId, p.color, mistakes, false)
    setResults(r => [...r, { lineId: it.lineId, kind: it.kind, mistakes }])
    // A line with slips comes back once more at the end of the session.
    if (mistakes > 0 && it.kind !== 'new' && it.kind !== 'retry') setQueue(q => [...q, { lineId: it.lineId, kind: 'retry' }])
    setIndex(i => i + 1)
  }

  const exit = () => {
    if (done || index === 0 || confirmExit) p.onExit()
    else setConfirmExit(true)
  }

  const scored = results.filter(r => r.kind === 'recall' || r.kind === 'review')
  const clean = scored.filter(r => r.mistakes === 0).length
  const total = queue.length

  return (
    <div className="session">
      <header className="session-bar">
        <button className="ghost" onClick={exit} aria-label="Leave session">
          ✕
        </button>
        <div className="session-progress" aria-label="Session progress">
          <div style={{ width: `${(Math.min(index, total) / total) * 100}%` }} />
        </div>
        <span className="session-count">
          {Math.min(index + 1, total)}/{total}
        </span>
      </header>

      {confirmExit && !done && (
        <div className="confirm-bar">
          <span>Leave this session? Lines you finished are saved.</span>
          <button className="primary" onClick={p.onExit}>Leave</button>
          <button onClick={() => setConfirmExit(false)}>Keep going</button>
        </div>
      )}

      {!done && item && (
        <LineRunner
          key={index}
          openingId={p.opening.id}
          line={lineById.get(item.lineId)!}
          lineName={id => lineById.get(id)!.name}
          tree={p.tree}
          color={p.color}
          guided={item.kind === 'new'}
          kind={item.kind}
          showEval={p.showEval}
          onToggleEval={p.onToggleEval}
          onDone={onDone}
        />
      )}

      {done && <Summary {...p} results={results} clean={clean} scored={scored.length} />}
    </div>
  )
}

function Summary(p: Props & { results: Result[]; clean: number; scored: number }) {
  const ids = p.lines.map(l => l.id)
  const stats = courseStats(ids, p.color)
  const due = dueLines(ids, p.color).length
  const learned = new Set(p.results.map(r => r.lineId))
  const next = Math.min(
    ...[...learned].map(id => getCard(id, p.color)?.due ?? Infinity).filter(t => t > Date.now()),
  )
  const accuracy = p.scored ? Math.round((p.clean / p.scored) * 100) : 100

  return (
    <div className="summary">
      <div className="summary-card">
        <div className="summary-mark">✓</div>
        <h2>Session complete</h2>
        <div className="summary-stats">
          <div>
            <strong>{learned.size}</strong>
            <span>{learned.size === 1 ? 'line' : 'lines'} trained</span>
          </div>
          <div>
            <strong>{accuracy}%</strong>
            <span>first-try accuracy</span>
          </div>
          <div>
            <strong>
              {stats.learned}/{stats.total}
            </strong>
            <span>lines learned</span>
          </div>
        </div>
        {Number.isFinite(next) && <p className="muted">These lines come back for practice {fmtWhen(next)}.</p>}
        <div className="summary-actions">
          {due > 0 ? (
            <button className="primary big" onClick={() => p.onNext('review')}>
              Practice {due} due {due === 1 ? 'line' : 'lines'}
            </button>
          ) : stats.new > 0 ? (
            <button className="primary big" onClick={() => p.onNext('learn')}>
              Learn the next lines
            </button>
          ) : null}
          <button className="big" onClick={p.onExit}>
            Back to course
          </button>
        </div>
      </div>
    </div>
  )
}
