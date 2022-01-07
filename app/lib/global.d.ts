interface State {
  currentTheme: string
  units: string
  scale: number
  pieces: Array<Piece>
  status: string
  parent: string
  menu: boolean
  selectedPoint: string
  menuX: number|null
  menuY: number|null
  moving: boolean
}

interface Piece {
  points: Array<Point>
  name: string
  closed: boolean
}

interface Point {
  x: number
  y: number
  type: string
  active: boolean
  id: string
}

interface EventTarget {
  getAttribute(x:string)
  classList: DOMTokenList
}