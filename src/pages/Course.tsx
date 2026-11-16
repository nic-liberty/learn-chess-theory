import { useMemo, useState } from 'react'
import MiniBoard from '../components/MiniBoard'
import { previewFen, type Line, type Opening } from '../openings'
import { parseMoves } from '../openings/parse'
import { LEARN_BATCH, REVIEW_BATCH } from '../lib/prefs'
import { courseStats, dueLines, getCard, newLines, resetCourse, status, type CardStatus, type DrillColor } from '../lib/srs'

interface Props {
  opening: Opening
  lines: Line[]
  color: DrillColor
  onColor: (c: DrillColor) => void
  onLearn: (ids: string[]) => void
  onReview: (ids: string[]) => void
  onPractice: (id: string) => void
  onExplore: (id?: string) => void
  onHome: () => void
}

const STATUS_LABEL: Record<CardStatus, string> = { new: 'New', learning: 'Learning', due: 'Due', learned: 'Learned' }

function fmtDue(t?: number) {
  if (!t) return ''
  const d = (t - Date.now()) / 86400000
  if (d <= 0) return 'now'
  if (d < 1) return 'today'
  if (d < 1.5) return 'tomorrow'
  return `in ${Math.round(d)}d`
}

/** Short move preview: the last few moves, where the line becomes its own. */
function movePreview(line: Line, start: number) {
  const from = Math.max(start, line.moves.length - 6)
  return line.moves
    .slice(from)
    .map((m, i) => {
      const ply = from + i
      return ply % 2 === 0 ? `${ply / 2 + 1}.${m.san}` : i === 0 ? `${(ply + 1) / 2}...${m.san}` : m.san
    })
    .join(' ')
}

export default function Course({ opening, lines, color, onColor, onLearn, onReview, onPractice, onExplore, onHome }: Props) {
  const ids = useMemo(() => lines.map(l => l.id), [lines])
  const [, setTick] = useState(0)
  const [confirmReset, setConfirmReset] = useState(false)
  const stats = courseStats(ids, color)
  const due = dueLines(ids, color)
  const fresh = newLines(ids, color)
  const startPly = parseMoves(opening.previewMoves).length
  const pct = (n: number) => `${(n / stats.total) * 100}%`

  const groups: [string, Line[]][] = []
  for (const l of lines) {
    const g = groups.find(([n]) => n === l.group)
    if (g) g[1].push(l)
    else groups.push([l.group, [l]])
  }

  return (
    <div className="page course">
      <nav className="crumbs">
        <button className="link" onClick={onHome}>Openings</button>
        <span>/</span>
        <span>{opening.name}</span>
      </nav>

      <section className="course-hero">
        <MiniBoard fen={previewFen(opening)} orientation={color} />
        <div className="course-info">
          <div className="tags">
            <span className={`tag side-${opening.side}`}>For {opening.side === 'white' ? 'White' : 'Black'}</span>
            <span className="tag">{opening.eco}</span>
            <span className="tag">{stats.total} lines</span>
          </div>
          <h1>{opening.name}</h1>
          <p className="lede">{opening.description}</p>

          <div className="mastery" aria-label="Progress">
            <div className="mastery-bar">
              <div className="seg learned" style={{ width: pct(stats.learned) }} />
              <div className="seg due" style={{ width: pct(stats.due) }} />
              <div className="seg learning" style={{ width: pct(stats.learning) }} />
            </div>
            <div className="mastery-legend">
              <span><i className="dot learned" />{stats.learned} learned</span>
              <span><i className="dot due" />{stats.due} due</span>
              <span><i className="dot learning" />{stats.learning} learning</span>
              <span><i className="dot new" />{stats.new} new</span>
            </div>
          </div>

          <div className="cta-row">
            {due.length > 0 && (
              <button className="primary big" onClick={() => onReview(due.slice(0, REVIEW_BATCH))}>
                Review {Math.min(due.length, REVIEW_BATCH)} due
              </button>
            )}
            {fresh.length > 0 && (
              <button className={`big ${due.length ? '' : 'primary'}`} onClick={() => onLearn(fresh.slice(0, LEARN_BATCH))}>
                Learn {Math.min(fresh.length, LEARN_BATCH)} new {fresh.length === 1 ? 'line' : 'lines'}
              </button>
            )}
            {due.length === 0 && fresh.length === 0 && (
              <p className="all-done">You know every line. Reviews will show up here when they’re due.</p>
            )}
            <button className="big ghost" onClick={() => onExplore()}>Browse all lines</button>
          </div>
        </div>
      </section>

      <section className="course-settings">
        <span className="muted">Train as</span>
        <div className="seg">
          {(['white', 'black'] as DrillColor[]).map(c => (
            <button key={c} className={color === c ? 'active' : ''} onClick={() => onColor(c)}>
              {c === 'white' ? 'White' : 'Black'}
            </button>
          ))}
        </div>
        <span className="muted small">Progress is tracked separately for each side.</span>
      </section>

      <section className="chapters">
        {groups.map(([group, ls], gi) => {
          const s = courseStats(ls.map(l => l.id), color)
          return (
            <article key={group} className="chapter">
              <header>
                <div>
                  <div className="chapter-num">Chapter {gi + 1}</div>
                  <h3>{group}</h3>
                </div>
                <div className="chapter-meta">
                  <span>
                    {s.learned}/{s.total} learned
                  </span>
                  <div className="mini-progress">
                    <div style={{ width: `${(s.learned / s.total) * 100}%` }} />
                  </div>
                </div>
              </header>
              <ul>
                {ls.map(l => {
                  const st = status(l.id, color)
                  const card = getCard(l.id, color)
                  return (
                    <li key={l.id} className="line-row">
                      <span className={`pill ${st}`}>{STATUS_LABEL[st]}</span>
                      <div className="line-text">
                        <span className="line-name">{l.name}</span>
                        <span className="line-moves">…{movePreview(l, startPly)}</span>
                      </div>
                      {st === 'learned' && <span className="muted small due-in">review {fmtDue(card?.due)}</span>}
                      <div className="row-actions">
                        <button onClick={() => onExplore(l.id)} title="See the moves and notes">View</button>
                        <button className="primary" onClick={() => onPractice(l.id)}>
                          {st === 'new' ? 'Learn' : 'Practice'}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </article>
          )
        })}
      </section>

      <footer className="course-foot">
        {confirmReset ? (
          <>
            <span>Erase your progress in this course (both sides)?</span>
            <button
              className="danger"
              onClick={() => {
                resetCourse(ids)
                setConfirmReset(false)
                setTick(t => t + 1)
              }}
            >
              Erase progress
            </button>
            <button onClick={() => setConfirmReset(false)}>Cancel</button>
          </>
        ) : (
          <button className="link" onClick={() => setConfirmReset(true)}>Reset course progress</button>
        )}
      </footer>
    </div>
  )
}
