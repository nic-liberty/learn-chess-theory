import { Chess } from 'chess.js'
import type { Key } from 'chessground/types'
import type { Line } from '../openings'

export interface TreeNode {
  fen: string
  san?: string
  from?: Key
  to?: Key
  ply: number
  comment?: string
  parent?: TreeNode
  children: TreeNode[]
  /** Ids of every line that passes through this node. */
  lineIds: string[]
}

/** Merge all lines into one move tree, checking every move is legal. */
export function buildTree(lines: Line[]): TreeNode {
  const chess = new Chess()
  const root: TreeNode = { fen: chess.fen(), ply: 0, children: [], lineIds: lines.map(l => l.id) }
  for (const line of lines) {
    chess.reset()
    let node = root
    line.moves.forEach((m, i) => {
      let move
      try {
        move = chess.move(m.san)
      } catch {
        throw new Error(`Illegal move ${m.san} at ply ${i + 1} in line "${line.id}"`)
      }
      let child = node.children.find(c => c.san === move.san)
      if (!child) {
        child = {
          fen: chess.fen(),
          san: move.san,
          from: move.from as Key,
          to: move.to as Key,
          ply: i + 1,
          parent: node,
          children: [],
          lineIds: [],
        }
        node.children.push(child)
      }
      child.lineIds.push(line.id)
      if (m.comment && !child.comment) child.comment = m.comment
      node = child
    })
  }
  return root
}

export function pathTo(node: TreeNode): TreeNode[] {
  const path: TreeNode[] = []
  for (let n: TreeNode | undefined = node; n && n.parent; n = n.parent) path.unshift(n)
  return path
}

export function moveLabel(node: TreeNode): string {
  const n = Math.ceil(node.ply / 2)
  return node.ply % 2 ? `${n}.${node.san}` : `${n}...${node.san}`
}
