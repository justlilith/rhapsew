import { SVG } from '@svgdotjs/svg.js'
import { nanoid } from 'nanoid'
import * as PieceOps from './helpers/pieceOps'

class Piece {
  constructor(args:PieceArgs) {
    const id = nanoid()
    this.id = id
    this.points = []
    this.closed = false
  }
  points: PointT[]
  name: string = "init"
  closed: boolean
  id: string
}

class Point {
  constructor(args:NewPointArgs) {
    this.x = args.x
    this.y = args.y
    this.type = args.type ?? "anchor"
    this.active = args.active ?? false
    this.id = args.id ?? nanoid()
    this.pieceId = args.pieceId
    this.parent ??= args.parent
    this.pairId = args.pairId ?? null
  }
  x: number
  y: number
  pieceId: string
  type: "anchor" | "control"
  active: boolean
  id: string
  parent?: PointT
  pairId?: string
}

export {
  Piece
  , Point
}