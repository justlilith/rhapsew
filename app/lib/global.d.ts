interface State {
  currentTheme: string
  units: string
  scale: number
  pieces: Piece[]
  status: string
  parent: string
  menu: boolean
  selectedPiece: Piece|null
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






interface addPointArgs {
  event: MouseEvent
  data: State
  index: number
}

interface HandleKeyboardArgs {
  data: State
}

interface HandleMouseArgs {
  data: State
  event: MouseEvent
}

interface HandleMoveArgs {
  data: State
  event: MouseEvent
}

interface PieceArgs {
  data: State
  event: MouseEvent
}

interface RenderPieceArgs {
  data: State
  piece: Piece  
}

interface RenderPointArgs {
  id: string
  data: State
  point: Point
}