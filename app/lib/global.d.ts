interface State {
  anchorClicked: boolean
  canvasClicked: boolean
  currentTheme: string
  currentCoords: {x: number, y: number}
  units: string
  zoom: number
  dpi: number
  pieces: PieceT[]
  status: string
  parent: string
  menu: boolean
  settingsMenu: boolean
  selectedPiece: PieceT|null
  selectedPoint: PointT|null
  menuX: number|null
  menuY: number|null
  mousedown: boolean
  moving: boolean
  panning: boolean
}

interface PieceT {
  points: PointT[]
  name: string
  closed: boolean
  id: string
  mirrorLine: PointT[]
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
  pairId?: string
}


interface PointT {
  x: number
  y: number
  type: "anchor" | "control"
  active: boolean
  id: string
  parent?: PointT
  pairId?: string
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
  currentCoords: {x: number, y: number}
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