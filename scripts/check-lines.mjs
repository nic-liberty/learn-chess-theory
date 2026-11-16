// Checks every opening line: legal moves, and (if Stockfish is installed) flags moves
// that lose a lot of evaluation. Usage: node scripts/check-lines.mjs [stockfish-path]
import { spawn } from 'node:child_process'
import { Chess } from 'chess.js'
import { scotch } from '../src/openings/scotch.ts'

const openings = [scotch]
const engine = process.argv[2]
const THRESHOLD = 120

function parse(pgn) {
  return pgn.replace(/\{[^}]*\}/g, ' ').split(/\s+/).map(t => t.replace(/^\d+\.(\.\.)?/, '')).filter(Boolean)
}

let sf, buf = '', waiters = []
if (engine) {
  sf = spawn(engine)
  sf.stdout.on('data', d => {
    buf += d
    let i
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i); buf = buf.slice(i + 1)
      waiters.forEach(w => w(line))
    }
  })
  sf.stdin.write('uci\nsetoption name Threads value 4\nsetoption name Hash value 128\nisready\n')
}
const cache = new Map()
function evalFen(fen) {
  if (cache.has(fen)) return cache.get(fen)
  const p = new Promise(res => {
    let score = 0
    const w = line => {
      const m = line.match(/score (cp|mate) (-?\d+)/)
      if (m) score = m[1] === 'cp' ? +m[2] : (+m[2] > 0 ? 10000 : -10000)
      if (line.startsWith('bestmove')) { waiters = waiters.filter(x => x !== w); res(score) }
    }
    waiters.push(w)
    sf.stdin.write(`position fen ${fen}\ngo depth 16\n`)
  })
  cache.set(fen, p)
  return p
}

let errors = 0
const seen = new Set()
for (const op of openings) {
  for (const line of op.lines) {
    if (seen.has(line.id)) { console.log(`DUPLICATE id ${line.id}`); errors++ }
    seen.add(line.id)
    const chess = new Chess()
    const sans = parse(line.pgn)
    for (let i = 0; i < sans.length; i++) {
      const before = chess.fen()
      try { chess.move(sans[i]) } catch { console.log(`ILLEGAL ${line.id}: ply ${i + 1} ${sans[i]}`); errors++; break }
      if (!sf) continue
      // eval from side-to-move perspective; mover's loss = eval(before) + eval(after)
      const a = await evalFen(before), b = await evalFen(chess.fen())
      const loss = a + b
      if (loss > THRESHOLD) console.log(`WARN ${line.id}: ${Math.ceil((i + 1) / 2)}${i % 2 ? '...' : '.'}${sans[i]} loses ${loss}cp (eval for mover ${a} -> ${-b})`)
    }
    if (sf) console.log(`ok ${line.id} final eval (white): ${(chess.turn() === 'w' ? 1 : -1) * (await evalFen(chess.fen()))}`)
  }
}
sf?.kill()
process.exit(errors ? 1 : 0)
