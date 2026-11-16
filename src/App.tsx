import { useCallback, useMemo, useState } from 'react'
import { getLines, openings } from './openings'
import { loadShowEval, saveShowEval } from './lib/evals'
import { setTrainColor, trainColor } from './lib/prefs'
import { useRoute } from './lib/route'
import { isMuted, setMuted } from './lib/sound'
import type { DrillColor } from './lib/srs'
import { buildTree } from './lib/tree'
import Course from './pages/Course'
import Explore from './pages/Explore'
import Home from './pages/Home'
import Session, { type SessionMode } from './pages/Session'
import { dueLines, newLines } from './lib/srs'
import { LEARN_BATCH, REVIEW_BATCH } from './lib/prefs'

interface ActiveSession {
  mode: SessionMode
  lineIds: string[]
  nonce: number
}

export default function App() {
  const [route, go] = useRoute()
  const opening = route.page === 'home' ? undefined : openings.find(o => o.id === route.id)
  const lines = useMemo(() => (opening ? getLines(opening) : []), [opening])
  const tree = useMemo(() => buildTree(lines), [lines])
  const [colorTick, setColorTick] = useState(0)
  const color: DrillColor = opening ? trainColor(opening.id, opening.side) : 'white'
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [muted, setMutedState] = useState(isMuted)
  const [showEval, setShowEval] = useState(loadShowEval)
  const [exploreLine, setExploreLine] = useState<string>()
  const toggleEval = useCallback(() => {
    setShowEval(v => {
      saveShowEval(!v)
      return !v
    })
  }, [])

  const start = (mode: SessionMode, lineIds: string[]) => {
    setSession({ mode, lineIds, nonce: Date.now() })
    window.scrollTo(0, 0)
  }

  // Training takes over the whole screen.
  if (session && opening) {
    return (
      <Session
        key={session.nonce}
        opening={opening}
        lines={lines}
        tree={tree}
        color={color}
        mode={session.mode}
        lineIds={session.lineIds}
        showEval={showEval}
        onToggleEval={toggleEval}
        onExit={() => {
          setSession(null)
          go({ page: 'course', id: opening.id })
        }}
        onNext={mode => {
          const ids = lines.map(l => l.id)
          const next = mode === 'review' ? dueLines(ids, color).slice(0, REVIEW_BATCH) : newLines(ids, color).slice(0, LEARN_BATCH)
          if (next.length) start(mode, next)
          else setSession(null)
        }}
      />
    )
  }

  return (
    <div className="app">
      <header className="top">
        <button className="brand" onClick={() => go({ page: 'home' })}>
          <span className="logo">♞</span> Learn Chess Theory
        </button>
        <nav className="tabs">
          <button className={route.page === 'home' ? 'active' : ''} onClick={() => go({ page: 'home' })}>
            Openings
          </button>
        </nav>
        <button
          className="icon"
          title={muted ? 'Sound off' : 'Sound on'}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          onClick={() => {
            setMuted(!muted)
            setMutedState(!muted)
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </header>

      {route.page === 'home' || !opening ? (
        <Home onOpen={id => go({ page: 'course', id })} />
      ) : route.page === 'course' ? (
        <Course
          key={`${opening.id}-${colorTick}`}
          opening={opening}
          lines={lines}
          color={color}
          onColor={c => {
            setTrainColor(opening.id, c)
            setColorTick(t => t + 1)
          }}
          onLearn={ids => start('learn', ids)}
          onReview={ids => start('review', ids)}
          onPractice={id => start('single', [id])}
          onExplore={id => {
            setExploreLine(id)
            go({ page: 'explore', id: opening.id })
          }}
          onHome={() => go({ page: 'home' })}
        />
      ) : (
        <Explore
          key={`${opening.id}-${exploreLine}`}
          openingId={opening.id}
          openingName={opening.name}
          color={color}
          showEval={showEval}
          onToggleEval={toggleEval}
          lines={lines}
          tree={tree}
          initialLineId={exploreLine}
          onBack={() => go({ page: 'course', id: opening.id })}
          onHome={() => go({ page: 'home' })}
          onDrill={id => start('single', [id])}
        />
      )}
    </div>
  )
}
