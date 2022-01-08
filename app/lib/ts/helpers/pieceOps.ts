import { SVG } from '@svgdotjs/svg.js'
import { Piece, Point } from '$lib/ts/classes'
import * as AppOps from '$lib/ts/helpers/appOps'
import { nanoid } from 'nanoid'
import * as F from 'futil-js'
import * as _ from 'lodash'

const TOPBARHEIGHT = 30

function addPiece (args:PieceArgs):State {
  let newPiece = new Piece({data: args.data, event: args.event})
  args.data.pieces = args.data.pieces.concat(newPiece)
  args.data.selectedPiece = newPiece
  console.info(`Rhapsew [Info]: New piece added: ${newPiece.id}`)
  return args.data
}

function addPoint (args:addPointArgs):Point {
  const pieceId = args.pieceId
  const index = args.index
  const id = nanoid()
  const draw = AppOps.initSVGCanvas(args.data)
  let coords = SVG(`svg`).point(args.event.pageX, args.event.pageY)

  const point = new Point({...coords, active: true, id, index, pieceId})
  switch (args.event.altKey) {
    case true:
    point.type = "handle"
    break
    case false:
    break
    default:
  }
  
  return point
}

function renderPiece (args:RenderPieceArgs) {
  let data = args.data
  let piece = args.piece
  const draw = AppOps.initSVGCanvas(data)
  
  let renderedPath = `M ${piece.points[0].x} ${piece.points[0].y}`
  
  piece.points.forEach((point, index) => {
    if (index - 1 >= 0){
      switch (point?.type) {
        case "handle":
        if (piece.points[index + 1]) {
          renderedPath += ` S ${point.x} ${point.y} ${piece.points[index +1].x} ${piece.points[index +1].y}`
        } else if (piece.closed) {
          renderedPath += ` S ${point.x} ${point.y} ${piece.points[0].x} ${piece.points[0].y}`
        } else {
          renderedPath += ` L ${point.x} ${point.y}`
        }
        // if (piece.points[index - 1]) {
          draw.find(`[data-source-point-id="${point.id}"]`) ? draw.find(`[data-source-point-id="${point.id}"]`).forEach(line => line.remove()) : null
          let controlPath = [point.x, point.y, piece.points[index - 1].x, piece.points[index - 1].y]
          let controlLine = SVG().line(controlPath).stroke('blue').addClass('control-line').data("source-point-id", point.id)
          draw.add(controlLine)
        // }
        break
        default:
        renderedPath += ` L ${point.x} ${point.y}`
      }
    }
  })
  if (piece.closed) {
    renderedPath += ` z`
  }
  // draw.find('.piece').forEach(element => element.remove())
  const renderedPiece = SVG()
  .path(renderedPath)
  .data("piece", piece)
  .data("id", piece.id)
  .attr({x: piece.points[0].x, y: piece.points[0].y, fill:"none"})
  .stroke({color:"hsl(180, 100%, 50%)", width:2})
  .addClass('piece')
  
  const renderedPieceThickStroke = SVG()
  .path(renderedPath)
  .data("piece", piece)
  .data("id", piece.id)
  .attr({x: piece.points[0].x, y: piece.points[0].y, fill:"none", stroke:"cyan"})
  .stroke({color:"hsla(0, 0%, 0%, 0.1)", width:10})
  .addClass('piece-wrangler')
  .click((event) => {
    console.info('Rhapsew [Infp]: Path clicked')
    if (data.selectedPiece) {
      data.selectedPiece.points = data.selectedPiece.points.concat(addPoint({event, data, index: data.selectedPiece.points.length, pieceId: data.selectedPiece.id}))
    }
  })
  
  const domPiece = draw.find(`[data-id = "${piece.id}"`)?.[0]
  if (domPiece) {
    if (!_.isEqual(AppOps.shallowCopy(domPiece.data("piece")), AppOps.shallowCopy(piece))){
      console.info(`Rhapsew [Info]: Rerendering piece: ${piece.id}`)
      draw.find('.piece').forEach(element => element.remove())
      draw.find('.piece-wrangler').forEach(element => element.remove())
      draw.add(renderedPiece)
      draw.add(renderedPieceThickStroke)
      piece.points.forEach(point => {
        renderPoint({id: point.id, data, point, piece})
      })
      // }
    }
  } else {
    draw.add(renderedPiece)
    draw.add(renderedPieceThickStroke)
    piece.points.forEach(point => {
      renderPoint({id: point.id, data, point, piece})
    })
  }
}

function renderPoint (args:RenderPointArgs) {
  let data = args.data
  let id = args.id
  let point = args.point
  let pieceId = args.piece.id
  const draw = AppOps.initSVGCanvas(data)
  
  const domPoint = draw.find(`[data-id = "${point.id}"]`)[0]
  
  console.info(`Rhapsew [Info]: Purging DOM point: ${id}`)
  draw.find(`[data-id = "${id}"]`).forEach(element => element.remove())
  // draw.find(`.selection-box`).forEach(element => element.remove())
  
  const renderedPoint = SVG()
  .circle()
  .attr({fill: 'black', cx: point.x, cy: point.y})
  .stroke({color:"hsla(0,0%,0%,0)", width:15})
  .size(10)
  .addClass('anchor')
  .data('id', id)
  .data('point', point)
  .data('pieceId', pieceId)
  
  draw.add(renderedPoint)
  const domSelectionBox = draw.find(`.selection-box`)[0]
  
  const selectionBox = SVG()
  .rect()
  .attr({fill:"none", width: 20, height: 20, x: point.x -10, y: point.y -10})
  .stroke({color:"hsla(0,0%,0%,0.5)", width:2})
  .addClass('selection-box')
  .data('id', id)
  
  switch (data.selectedPoint == id) {
    case true:
    if (domSelectionBox) {
      domSelectionBox.remove()
    }
    draw.add(selectionBox)
    break
    default:
  }
}


export {
  addPiece
  , addPoint
  , renderPiece
  , renderPoint
}