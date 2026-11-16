import { Chess } from 'chess.js'
import type { DrawShape } from 'chessground/draw'
import type { Color, Key } from 'chessground/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Line } from '../openings'
import { playMoveSound } from '../lib/sound'
import { moveLabel, pathTo, type TreeNode } from '../lib/tree'
import Board from './Board'
import LineList from './LineList'

interface Props {
  lines: Line[]
  tree: TreeNode
  initialLineId?: string
  onDrill: (lineId: string) => void
}

export default function LearnView({ lines, tree, initialLineId, onDrill }: Props) {
  const lineById = useMemo(() => new Map(lines.map(l => [l.id, l])), [lines])
  const [node, setNode] = useState<TreeNode>(tree)
  const [lineId, setLineId] = useState<string>(initialLineId ?? lines[0].id)
  const [orientation, setOrientation] = useState<Color>('white')

  const go = useCallback((n: TreeNode, sound = true) => {
    setNode(n)
    if (sound && n.ply > 0) playMoveSound(n.san)
    setLineId(cur => (n.lineIds.includes(cur) ? cur : n.lineIds[0]))
  }, [])

  const nextChild = useCallback(
    (n: TreeNode) => n.children.find(c => c.lineIds.includes(lineId)) ?? n.children[0],
    [lineId],
  )

  const forward = useCallback(() => {
    const c = nextChild(node)
    if (c) go(c)
  }, [node, nextChild, go])
  const back = useCallback(() => node.parent && go(node.parent, false), [node, go])
  const toStart = useCallback(() => go(tree, false), [tree, go])
  const toEnd = useCallback(() => {
    let n = node
    for (let c = nextChild(n); c; c = nextChild(n)) n = c
    go(n, false)
  }, [node, nextChild, go])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.key === 'ArrowRight') forward()
      else if (e.key === 'ArrowLeft') back()
      else if (e.key === 'ArrowUp' || e.key === 'Home') toStart()
      else if (e.key === 'ArrowDown' || e.key === 'End') toEnd()
      else if (e.key === 'f') setOrientation(o => (o === 'white' ? 'black' : 'white'))
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [forward, back, toStart, toEnd])

  const chess = useMemo(() => new Chess(node.fen), [node])
  const turn: Color = chess.turn() === 'w' ? 'white' : 'black'

  // Only book moves can be played on the board.
  const dests = useMemo(() => {
    const d = new Map<Key, Key[]>()
    for (const c of node.children) d.set(c.from!, [...(d.get(c.from!) ?? []), c.to!])
    return d
  }, [node])

  const onMove = (from: Key, to: Key) => {
    const c = node.children.find(ch => ch.from === from && ch.to === to)
    if (c) go(c)
  }

  const shapes = useMemo<DrawShape[]>(() => {
    const main = nextChild(node)
    return node.children.map(c => ({ orig: c.from!, dest: c.to!, brush: c === main ? 'paleGreen' : 'paleBlue' }))
  }, [node, nextChild])

  const selectLine = (id: string) => {
    setLineId(id)
    // Stay put if the current position is on this line, otherwise start from the top.
    if (!node.lineIds.includes(id)) setNode(tree)
  }

  const line = lineById.get(lineId)!
  const path = pathTo(node)
  const lineNames = (ids: string[]) => {
    const names = ids.map(id => lineById.get(id)!.name)
    return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2} more` : names.join(', ')
  }

  return (
    <div className="layout">
      <aside className="side">
        <LineList lines={lines} selectedId={lineId} onSelect={selectLine} />
      </aside>

      <main className="center">
        <Board
          fen={node.fen}
          orientation={orientation}
          turnColor={turn}
          lastMove={node.from ? [node.from, node.to!] : undefined}
          check={chess.inCheck()}
          movableColor={node.children.length ? turn : undefined}
          dests={dests}
          onMove={onMove}
          autoShapes={shapes}
        />
        <div className="controls">
          <button onClick={toStart} title="Start (↑)">⏮</button>
          <button onClick={back} title="Back (←)">◀</button>
          <button onClick={forward} title="Forward (→)">▶</button>
          <button onClick={toEnd} title="End of line (↓)">⏭</button>
          <button onClick={() => setOrientation(o => (o === 'white' ? 'black' : 'white'))} title="Flip board (f)">⇅</button>
        </div>
      </main>

      <aside className="panel">
        <div className="panel-head">
          <div className="eyebrow">{line.group}</div>
          <h2>{line.name}</h2>
          <button className="primary" onClick={() => onDrill(lineId)}>Drill this line</button>
        </div>

        <div className="moves">
          {path.length === 0 && <span className="muted">Starting position</span>}
          {path.map(n => (
            <button key={n.ply} className={`mv ${n === node ? 'active' : ''}`} onClick={() => go(n, false)}>
              {n.ply % 2 ? <span className="num">{Math.ceil(n.ply / 2)}.</span> : null}
              {n.san}
            </button>
          ))}
        </div>

        <div className="comment">
          {node.comment ? <p>{node.comment}</p> : <p className="muted">{node.ply === 0 ? 'Press → or play a move on the board to begin.' : 'No note on this move.'}</p>}
        </div>

        <div className="book">
          <h4>{node.children.length ? 'Book moves' : 'End of line'}</h4>
          {node.children.length === 0 && (
            <p className="muted">
              That's the end of the theory here. <button className="link" onClick={() => onDrill(lineId)}>Drill it</button> or go back to explore other branches.
            </p>
          )}
          <ul>
            {node.children.map(c => (
              <li key={c.san}>
                <button onClick={() => go(c)} className={c === nextChild(node) ? 'main' : ''}>
                  <strong>{moveLabel(c)}</strong>
                  <span className="muted">{lineNames(c.lineIds)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="tip">Tip: right-click and drag to draw arrows. Right-click a square to circle it. Hold Shift, Ctrl or Alt for other colours.</p>
      </aside>
    </div>
  )
}
