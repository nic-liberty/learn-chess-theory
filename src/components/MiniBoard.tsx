import { Chessground } from 'chessground'
import type { Color } from 'chessground/types'
import { useEffect, useRef } from 'react'

/** Small static board for cards and headers. */
export default function MiniBoard({ fen, orientation = 'white' }: { fen: string; orientation?: Color }) {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!el.current) return
    const api = Chessground(el.current, {
      fen,
      orientation,
      viewOnly: true,
      coordinates: false,
      drawable: { enabled: false, visible: false },
    })
    return () => api.destroy()
  }, [fen, orientation])
  return (
    <div className="mini-board">
      <div ref={el} />
    </div>
  )
}
