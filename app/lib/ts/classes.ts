import { SVG } from '@svgdotjs/svg.js'
import { nanoid } from 'nanoid'
import * as PieceOps from './helpers/pieceOps'

class Piece {
  constructor(args:PieceArgs) {
    this.id = nanoid()
    this.points = [PieceOps.addPoint({data: args.data, event: args.event, index: 0})]
    this.closed = false
  }
  points: Array<Point>
  name: string = "init"
  closed: boolean
  id: string
}

class Point {
  constructor(args) {
    this.x = args.x
    this.y = args.y
    this.type = args.type ?? "normal"
    this.active = args.active ?? false
    this.id = args.id ?? nanoid()
    this.index = args.index ?? null
  }
  x: number
  y: number
  type: string
  active: boolean
  id: string
  index: number
}

export {
  Piece
  , Point
}