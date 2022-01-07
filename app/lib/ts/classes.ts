import { SVG } from '@svgdotjs/svg.js'
import { nanoid } from 'nanoid'

class Piece {
  constructor() {
  }
  points: []
  name = "init"
  closed: false
}

class Point {
  constructor(args) {
    this.x = args.x
    this.y = args.y
    this.type = args.type ?? "normal"
    this.active = args.active ?? false
    this.id = args.id ?? nanoid()
  }
  x: number
  y: number
  type: string
  active: boolean
  id: string
}

export {
  Piece
  , Point
}