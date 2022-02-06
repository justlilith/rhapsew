interface State {
  anchorClicked: boolean
  canvasClicked: boolean
  currentCoords: { x: number, y: number }
  currentTheme: string
  dpi: number
  menu: boolean
  menuX: number | null
  menuY: number | null
  mousedown: boolean
  moving: boolean
  panning: boolean
  parent: string
  pieceMoving: boolean
  pieces: PieceT[]
  selectedPiece: PieceT | null
  selectedPoint: PointT | null
  settingsMenu: boolean
  status: string
  units: string
  zoom: number
}

interface PieceT {
  closed: boolean
  id: string
  mirrorLine: PointT[]
  offset: { x: number, y: number }
  name: string
  points: PointT[]
}

interface NewPointArgs {
  x: number
  y: number
  pieceId: string
  type?: "anchor" | "control"
  active?: boolean
  id: string
  parent?: PointT
  coords?: { x: number, y: number }
  pairId?: string
  offset?: { x: number, y: number }
}


interface PointT {
  x: number
  y: number
  type: "anchor" | "control"
  active: boolean
  id: string
  parent?: PointT
  pairId?: string
  offset: { x: number, y: number }
}

interface EventTarget {
  getAttribute(x: string)
  classList: DOMTokenList
}






interface AddPointArgs {
  event: MouseEvent
  data: State
  pieceId: string
  parent?: PointT
  type?: "control" | "anchor"
  coords?: { x: number, y: number }
  pairId?: string
}

interface FindAngleArgs {
  mode: string
  point1: PointT
  point2: PointT
}

interface FindPreviousSegmentArgs {
  data: State
  point: PointT
}

interface GenerateBoundingBoxArgs {
  data: State
  piece: import("@svgdotjs/svg.js").G
  pieceId: string
}

interface GeneratePieceArgs {
  data: State
  piece: PieceT
  mirrored?: boolean
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

interface PanArgs {
  data: State
  currentCoords: { x: number, y: number }
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

interface SetMirrorLineArgs {
  data: State
  piece?: PieceT
  event?: Event
  resetPoint?: PointT
  clear?: boolean
}