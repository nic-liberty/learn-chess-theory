import type { Line } from '../openings'

interface Props {
  lines: Line[]
  selectedId?: string
  onSelect: (id: string) => void
  badge?: (line: Line) => React.ReactNode
}

export default function LineList({ lines, selectedId, onSelect, badge }: Props) {
  const groups: [string, Line[]][] = []
  for (const l of lines) {
    const g = groups.find(([name]) => name === l.group)
    if (g) g[1].push(l)
    else groups.push([l.group, [l]])
  }
  return (
    <nav className="line-list">
      {groups.map(([group, ls]) => (
        <section key={group}>
          <h3>{group}</h3>
          <ul>
            {ls.map(l => (
              <li key={l.id}>
                <button className={l.id === selectedId ? 'active' : ''} onClick={() => onSelect(l.id)}>
                  {badge?.(l)}
                  <span>{l.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  )
}
