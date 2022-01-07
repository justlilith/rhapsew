import { SVG } from '@svgdotjs/svg.js'
import { nanoid } from 'nanoid'

type State = {
  currentTheme: string
  units: string
  scale: number
  pieces: Array<Piece>
  status: string
  parent: string
  menu: boolean
  selectedPoint: Point|null
  menuX: null
  menuY: null
}

export type {
  State
}