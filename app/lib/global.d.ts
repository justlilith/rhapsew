interface State {
  currentTheme: string
  units: string
  scale: number
  pieces: Piece[]
  status: string
  parent: string
  menu: boolean
  selectedPoint: string
  menuX: number|null
  menuY: number|null
  moving: boolean
}

interface Piece {
  points: Point[]
  name: string
  closed: boolean
  id: string
}

interface Point {
  x: number
  y: number
  type: string
  active: boolean
  id: string
  index: number
}

interface EventTarget {
  getAttribute(x:string)
  classList: DOMTokenList
}