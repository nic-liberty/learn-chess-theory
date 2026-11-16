import { useEffect, useState } from 'react'

/**
 * Tiny hash router. Routes: "" (home), "<opening>" (course page),
 * "<opening>-explore" (browse every line).
 */
export type Route = { page: 'home' } | { page: 'course'; id: string } | { page: 'explore'; id: string }

function parse(hash: string): Route {
  const h = hash.replace(/^#/, '')
  if (!h) return { page: 'home' }
  if (h.endsWith('-explore')) return { page: 'explore', id: h.slice(0, -'-explore'.length) }
  return { page: 'course', id: h }
}

export function routeHash(r: Route): string {
  return r.page === 'home' ? '' : r.page === 'course' ? `#${r.id}` : `#${r.id}-explore`
}

export function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState(() => parse(location.hash))
  useEffect(() => {
    const on = () => {
      setRoute(parse(location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = (r: Route) => {
    location.hash = routeHash(r)
  }
  return [route, go]
}
