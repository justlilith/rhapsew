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
  points: Point[]
  name: string = "init"
  closed: boolean
  id: string
}

class Point {
  constructor(args) {
    this.x = args.x
    this.y = args.y
    this.type = args.type ?? "anchor"
    this.active = args.active ?? false
    this.id = args.id ?? null
    this.index = args.index ?? null
    this.pieceId = args.pieceId
  }
  x: number
  y: number
  pieceId: string
  type: "anchor" | "control"
  active: boolean
  id: string
  index: number
}

export {
  Piece
  , Point
}