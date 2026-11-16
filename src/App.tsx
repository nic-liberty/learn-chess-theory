import { useCallback, useMemo, useState } from 'react'
import DrillView from './components/DrillView'
import LearnView from './components/LearnView'
import { getLines, openings } from './openings'
import { loadShowEval, saveShowEval } from './lib/evals'
import { isMuted, setMuted } from './lib/sound'
import { buildTree } from './lib/tree'

type Mode = 'learn' | 'drill'

export default function App() {
  const [openingId, setOpeningId] = useState(openings[0].id)
  const opening = openings.find(o => o.id === openingId)!
  const lines = useMemo(() => getLines(opening), [opening])
  const tree = useMemo(() => buildTree(lines), [lines])
  const [mode, setMode] = useState<Mode>('learn')
  const [drillReq, setDrillReq] = useState<{ lineId: string; nonce: number }>()
  const [learnKey, setLearnKey] = useState(0)
  const [studyLine, setStudyLine] = useState<string>()
  const [muted, setMutedState] = useState(isMuted)
  const [showEval, setShowEval] = useState(loadShowEval)
  const toggleEval = useCallback(() => {
    setShowEval(v => {
      saveShowEval(!v)
      return !v
    })
  }, [])
  const evalProps = { openingId: opening.id, showEval, onToggleEval: toggleEval }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="logo">♞</span> Learn Chess Theory
        </div>
        {openings.length > 1 ? (
          <select value={openingId} onChange={e => setOpeningId(e.target.value)}>
            {openings.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        ) : (
          <div className="opening-name" title={opening.description}>
            {opening.name} <span className="muted">{opening.eco}</span>
          </div>
        )}
        <nav className="tabs">
          <button className={mode === 'learn' ? 'active' : ''} onClick={() => setMode('learn')}>Learn</button>
          <button className={mode === 'drill' ? 'active' : ''} onClick={() => {
            setDrillReq(undefined)
            setMode('drill')
          }}>Drill</button>
        </nav>
        <button
          className="icon"
          title={muted ? 'Sound off' : 'Sound on'}
          onClick={() => {
            setMuted(!muted)
            setMutedState(!muted)
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </header>

      {mode === 'learn' ? (
        <LearnView
          key={`${opening.id}-${learnKey}`}
          {...evalProps}
          lines={lines}
          tree={tree}
          initialLineId={studyLine}
          onDrill={lineId => {
            setDrillReq({ lineId, nonce: Date.now() })
            setMode('drill')
          }}
        />
      ) : (
        <DrillView
          key={opening.id}
          {...evalProps}
          lines={lines}
          tree={tree}
          request={drillReq}
          onStudy={lineId => {
            setStudyLine(lineId)
            setLearnKey(k => k + 1)
            setMode('learn')
          }}
        />
      )}
    </div>
  )
}
