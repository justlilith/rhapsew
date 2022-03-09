import { SVG } from '@svgdotjs/svg.js'
import { Piece, Point } from '$lib/ts/classes'
import * as AppOps from '$lib/ts/helpers/appOps'
import * as PieceOps from '$lib/ts/helpers/pieceOps'
// import type { State } from 'app/lib/global'



function deleteKey(args: HandleKeyboardArgs): State {
  let data = args.data
  console.info('Rhapsew [Info]: Key pressed: Delete')
  PieceOps.wipe(data)
  if (data.selectedPiece) {
    if (data.selectedPoint) {
      data.pieces = data.pieces.map(piece => {
        const newPoints = piece.points.filter(point => {
          let flag = false
          point.id == data.selectedPoint.id ? null : flag = true
          if (point.parent && point.parent.id == data.selectedPoint.id) {
            flag = true
          }
          return flag
        })
        data.selectedPiece.points = newPoints
        return { ...piece, points: newPoints }
      })
    } else { // by jove, get rid of the whole piece!
      data.pieces = data.pieces.filter(piece => piece.id != data.selectedPiece.id)
    }
  }

  data.status = 'Delete'
  return args.data
}

function escape(args: HandleKeyboardArgs): State {
  console.info('Rhapsew [Info]: Key pressed: Escape')
  args.data.selectedPoint = null
  args.data.pieces.forEach(piece => {
    piece.points.forEach(point => {
      point.active = false
    })
  })
  AppOps.toggleContextMenu({ data: args.data, state: "off" })
  return args.data
}

export {
  deleteKey
  , escape
}