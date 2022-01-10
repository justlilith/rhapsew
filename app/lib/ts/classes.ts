import { SVG } from '@svgdotjs/svg.js'
import { nanoid } from 'nanoid'
import * as PieceOps from './helpers/pieceOps'

class Piece {
  constructor(args:PieceArgs) {
    console.log("new piece args", args)
    const id = nanoid()
    this.id = id
    this.points = []
    // this.points = [PieceOps.addPoint({data: args.data, event: args.event, index: 0, pieceId: id})] // issue pt 2 <- probably due to this
    // this.points = [new Point({x:0, y:0, active: true, id, index: 0, pieceId: id})]
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
  }
  x: number
  y: number
  pieceId: string
  type: "anchor" | "control"
  active: boolean
  id: string
  parent?: PointT
}

export {
  Piece
  , Point
}