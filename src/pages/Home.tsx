import MiniBoard from '../components/MiniBoard'
import { getLines, openings, previewFen } from '../openings'
import { courseStats, dueLines, status } from '../lib/srs'

export default function Home({ onOpen, onTry }: { onOpen: (id: string) => void; onTry: (openingId: string, lineId: string) => void }) {
  const families: [string, typeof openings][] = []
  for (const o of openings) {
    const f = families.find(([n]) => n === o.family)
    if (f) f[1].push(o)
    else families.push([o.family, [o]])
  }

  return (
    <div className="page home">
      <section className="home-hero">
        <h1>Learn openings by playing them.</h1>
        <p className="lede">
          Pick an opening, play through its main lines with short explanations, then practice them until they stick.
          Lines you know come back less often; lines you miss come back sooner.
        </p>
      </section>

      {families.map(([family, list]) => (
        <section key={family} className="family">
          <h2>{family}</h2>
          <div className="card-grid">
            {list.map(o => {
              const ids = getLines(o).map(l => l.id)
              const color = o.side
              const firstNew = ids.find(id => status(id, color) === 'new')
              const s = courseStats(ids, color)
              const due = dueLines(ids, color).length
              const started = s.new < s.total
              return (
                <article key={o.id} className="opening-card">
                  <button className="card-board" onClick={() => onOpen(o.id)} aria-label={`Open ${o.name}`}>
                    <MiniBoard fen={previewFen(o)} orientation={o.side} />
                  </button>
                  <div className="card-body">
                    <div className="tags">
                      <span className={`tag side-${o.side}`}>For {o.side === 'white' ? 'White' : 'Black'}</span>
                      <span className="tag">{s.total} lines</span>
                    </div>
                    <h3>
                      <button className="card-title" onClick={() => onOpen(o.id)}>{o.name}</button>
                    </h3>
                    <p className="muted">{o.previewMoves}</p>
                    <div className="mini-progress">
                      <div style={{ width: `${(s.learned / s.total) * 100}%` }} />
                    </div>
                    <div className="card-foot">
                      <span className="muted small">
                        {started ? `${s.learned}/${s.total} learned` : 'Not started'}
                        {due > 0 && <b className="due-badge">{due} due</b>}
                      </span>
                    </div>
                    <div className="card-actions">
                      <button className="primary" onClick={() => onOpen(o.id)}>{started ? 'Continue' : 'Open course'}</button>
                      {firstNew && !started && (
                        <button onClick={() => onTry(o.id, firstNew)}>Try the first line</button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}

      <p className="muted coming">More openings are on the way.</p>
    </div>
  )
}
