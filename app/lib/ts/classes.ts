import { SVG } from '@svgdotjs/svg.js'
import { nanoid } from 'nanoid'
import * as PieceOps from './helpers/pieceOps'

class Piece {
  constructor(args: PieceArgs) {
    const id = nanoid()
    this.id = id
    this.points = []
    this.closed = false
    this.mirrorLine = []
    this.mousedownSize = null
    this.pathString = null
    this.seamAllowance = 0
  }
  points: PointT[]
  name: string = "init"
  closed: boolean
  id: string
  mirrorLine: PointT[]
  mousedownSize: { width: number, height: number }
  pathString: string | null
  seamAllowance: number
}

class Point {
  constructor(args: NewPointArgs) {
    this.x = args.x
    this.y = args.y
    this.type = args.type ?? "anchor"
    this.active = args.active ?? false
    this.id = args.id ?? nanoid()
    this.pieceId = args.pieceId
    this.parent ??= args.parent
    this.pairId = args.pairId ?? null
    this.offset = args.offset ?? null
    this.mousedownCoords = { x: null, y: null }
  }
  x: number
  y: number
  pieceId: string
  type: "anchor" | "control"
  active: boolean
  id: string
  mousedownCoords: { x: number, y: number }
  parent?: PointT
  pairId?: string
  offset: { x: number, y: number }
}

export {
  Piece
  , Point
}