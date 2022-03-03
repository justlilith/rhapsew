interface State {
  anchorClicked: boolean
  canvasClicked: boolean
  contextMenu: boolean
  currentCoords: { x: number, y: number }
  currentTheme: string
  currentTool: "anchor" | "piece" | "annotate" | "pan"
  dpi: number
  menuX: number | null
  menuY: number | null
  mousedown: boolean
  mousedownCoords?: { x: number, y: number }
  moving: boolean
  panning: boolean
  parent: string
  pieceMoving: boolean
  pieces: PieceT[]
  resizing: boolean
  selectedPiece: PieceT | null
  selectedPoint: PointT | null
  status: string
  topMenu: "settings" | "tools" | null
  units: string
  zoom: number
}

interface PieceT {
  closed: boolean
  id: string
  mirrorLine: PointT[]
  mousedownSize: { width: number, height: number, x: number, y: number }
  name: string
  offset: { x: number, y: number }
  points: PointT[]
}

interface NewPointArgs {
  active?: boolean
  coords?: { x: number, y: number }
  id: string
  offset?: { x: number, y: number }
  pairId?: string
  parent?: PointT
  pieceId: string
  type?: "anchor" | "control"
  x: number
  y: number
}


interface PointT {
  active: boolean
  id: string
  mousedownCoords?: { x: number, y: number }
  offset: { x: number, y: number }
  parent?: PointT
  pairId?: string
  type: "anchor" | "control"
  x: number
  y: number
}

interface EventTarget {
  getAttribute(x: string)
  classList: DOMTokenList
}






interface AddPointArgs {
  coords?: { x: number, y: number }
  data: State
  event: MouseEvent
  pairId?: string
  parent?: PointT
  pieceId: string
  type?: "control" | "anchor"
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
  mirrored?: boolean
  piece: PieceT
}

interface HandleClickArgs {
  data: State
  event: MouseEvent
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
  renderedPiece: G
}

interface SetMirrorLineArgs {
  clear?: boolean
  data: State
  event?: Event
  resetPoint?: PointT
  piece?: PieceT
}