import { SVG } from '@svgdotjs/svg.js'
import { Point } from '$lib/ts/classes'
import * as AppOps from '$lib/ts/helpers/appOps'
import * as PieceOps from '$lib/ts/helpers/pieceOps'
// import type { State } from 'app/lib/global'



function deleteKey (args: HandleKeyboardArgs):State {
  let data = args.data
  console.info('Rhapsew [Info]: Key pressed: Delete')
  args.data.pieces = args.data.pieces.map(piece => {
    const newPoints = piece.points.filter(point => point.id != data.selectedPoint)
    PieceOps.renderPiece({data, piece: {...piece, points: newPoints}})
    return {...piece, points: newPoints}
  })

  return args.data
}

function escape (args: HandleKeyboardArgs):State {
  console.info('Rhapsew [Info]: Key pressed: Escape')
  args.data.selectedPoint = null
  args.data.pieces.forEach(piece => {
    piece.points.forEach(point => {
      point.active = false
    })
  })
  AppOps.toggleContextMenu({data: args.data, state: "off"})
  return args.data
}

export {
  deleteKey
  , escape
}