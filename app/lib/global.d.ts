interface State {
  currentTheme: string
  units: string
  zoom: number
  pieces: PieceT[]
  status: string
  parent: string
  menu: boolean
  selectedPiece: PieceT|null
  selectedPoint: PointT|null
  menuX: number|null
  menuY: number|null
  moving: boolean
}

interface PieceT {
  points: PointT[]
  name: string
  closed: boolean
  id: string
}

interface NewPointArgs {
  x: number
  y: number
  pieceId: string
  type?: "anchor" | "control"
  active?: boolean
  id: string
  parent?: PointT
  coords?: {x: number, y: number}
}


interface PointT {
  x: number
  y: number
  type: "anchor" | "control"
  active: boolean
  id: string
  parent?:PointT
}

interface EventTarget {
  getAttribute(x:string)
  classList: DOMTokenList
}






interface AddPointArgs {
  event: MouseEvent
  data: State
  pieceId: string
  parent?: PointT
  type?: "control" | "anchor"
  coords?: {x: number, y: number}
}

interface FindPreviousSegmentArgs {
  data: State
  point: PointT
}

interface HandleClickArgs {
  event: MouseEvent
  data: State
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
  point: PointT
  piece: PieceT
}