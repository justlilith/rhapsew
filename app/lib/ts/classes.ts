import { SVG } from '@svgdotjs/svg.js'
import { nanoid } from 'nanoid'

class Piece {
  constructor() {
    this.id = nanoid()
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