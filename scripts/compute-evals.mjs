// Pre-computes a Stockfish evaluation for every book position, for the eval bar.
// Usage: node scripts/compute-evals.mjs [stockfish-path] [depth]
// Only new positions are analysed; delete the JSON file to redo everything.
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { openings } from './openings.mjs'

const engine = process.argv[2] || '/usr/games/stockfish'
const depth = +(process.argv[3] || 22)

const sf = spawn(engine)
let buf = ''
let waiter = null
sf.stdout.on('data', d => {
  buf += d
  let i
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i)
    buf = buf.slice(i + 1)
    waiter?.(line)
  }
})
sf.stdin.write('uci\nsetoption name Threads value 4\nsetoption name Hash value 256\n')

/** Eval from White's point of view: centipawns, or "#N" / "#-N" for mate. */
function analyse(fen) {
  return new Promise(res => {
    const black = fen.split(' ')[1] === 'b'
    let score = 0
    waiter = line => {
      const m = line.match(/ score (cp|mate) (-?\d+)/)
      if (m && !line.includes('bound')) {
        const v = +m[2] * (black ? -1 : 1)
        score = m[1] === 'cp' ? v : `#${v}`
      }
      if (line.startsWith('bestmove')) res(score)
    }
    sf.stdin.write(`ucinewgame\nposition fen ${fen}\ngo depth ${depth}\n`)
  })
}

/** Position key without move counters, so transpositions share an eval. */
export const fenKey = fen => fen.split(' ').slice(0, 4).join(' ')

const strip = pgn => pgn.replace(/\{[^}]*\}/g, ' ').split(/\s+/).map(t => t.replace(/^\d+\.(\.\.)?/, '')).filter(Boolean)

for (const op of openings) {
  const file = `src/openings/evals/${op.id}.json`
  const evals = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
  const fens = new Set()
  for (const line of op.lines) {
    const c = new Chess()
    fens.add(c.fen())
    for (const san of strip(line.pgn)) {
      c.move(san)
      fens.add(c.fen())
    }
  }
  const todo = [...fens].filter(f => !(fenKey(f) in evals))
  console.log(`${op.id}: ${fens.size} positions, ${todo.length} to analyse at depth ${depth}`)
  let n = 0
  for (const fen of todo) {
    evals[fenKey(fen)] = await analyse(fen)
    if (++n % 20 === 0) {
      console.log(`  ${n}/${todo.length}`)
      writeFileSync(file, JSON.stringify(evals, null, 0))
    }
  }
  const sorted = Object.fromEntries(Object.entries(evals).sort())
  writeFileSync(file, JSON.stringify(sorted, null, 1) + '\n')
}
sf.kill()
