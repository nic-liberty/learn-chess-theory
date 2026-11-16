import MiniBoard from '../components/MiniBoard'
import { getLines, openings, previewFen } from '../openings'
import { trainColor } from '../lib/prefs'
import { courseStats, dueLines } from '../lib/srs'

export default function Home({ onOpen }: { onOpen: (id: string) => void }) {
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
              const color = trainColor(o.id, o.side)
              const s = courseStats(ids, color)
              const due = dueLines(ids, color).length
              const started = s.new < s.total
              return (
                <button key={o.id} className="opening-card" onClick={() => onOpen(o.id)}>
                  <MiniBoard fen={previewFen(o)} orientation={o.side} />
                  <div className="card-body">
                    <div className="tags">
                      <span className={`tag side-${o.side}`}>For {o.side === 'white' ? 'White' : 'Black'}</span>
                      <span className="tag">{s.total} lines</span>
                    </div>
                    <h3>{o.name}</h3>
                    <p className="muted">{o.previewMoves}</p>
                    <div className="mini-progress">
                      <div style={{ width: `${(s.learned / s.total) * 100}%` }} />
                    </div>
                    <div className="card-foot">
                      <span className="muted small">
                        {started ? `${s.learned}/${s.total} learned` : 'Not started'}
                        {due > 0 && <b className="due-badge">{due} due</b>}
                      </span>
                      <span className="card-cta">{started ? 'Continue →' : 'Start →'}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <p className="muted coming">More openings are on the way.</p>
    </div>
  )
}
