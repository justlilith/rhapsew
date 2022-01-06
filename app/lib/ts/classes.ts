import { SVG } from '@svgdotjs/svg.js'

class Point {
  constructor(args) {
    this.x = args.x
    this.y = args.y
    this.type = args.type ?? "normal"
    this.active = args.active ?? false
  }
  x = 0
  y = 0
  type = "normal"
  active = false
  
}

export {
  Point
}