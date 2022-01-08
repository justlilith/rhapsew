import { SVG } from '@svgdotjs/svg.js'
import { Piece, Point } from '$lib/ts/classes'
import * as AppOps from '$lib/ts/helpers/appOps'
import { nanoid } from 'nanoid'
import * as F from 'futil-js'
import * as _ from 'lodash'

const TOPBARHEIGHT = 30

function addPiece (args:PieceArgs):State {
  let newPiece = new Piece({data: args.data, event: args.event})
  args.data.pieces = args.data.pieces.concat([newPiece])
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
    point.type = "control"
    console.log('alt')
    break
    case false:
    break
    default:
  }
  
  return point
}

/**
* Needs heavy refactoring.
* Each segment needs its own path.
* What's a segment? [0] to [1], [1] to [2], [2] to [0], etc.
* For each point, render a path? No.
* Note in piece data whether it's cubic, smooth, or normal (lol)
*/

function renderPiece (args:RenderPieceArgs) {
  let data = args.data
  let piece = args.piece
  const draw = AppOps.initSVGCanvas(data)
  
  
  piece.points.forEach((point, index) => {
    let pathString = `M ${point.x} ${point.y}`
    
    if (point.type == "anchor") {
      if (piece.points[index + 3] && piece.points?.[index + 1]?.type == 'control' && piece.points?.[index + 2]?.type == 'control' && (piece.points?.[index + 3]?.type == 'anchor' || !piece.points?.[index + 4])) {
        pathString += ` C ${piece.points[index + 1].x} ${piece.points[index + 1].y} ${piece.points[index + 2].x} ${piece.points[index + 2].y} ${piece.points[index + 3].x} ${piece.points[index + 3].y}`
      }
      // C
    } else if (piece.points[index + 2] && piece.points?.[index + 1]?.type == 'control' && (piece.points?.[index + 2]?.type == 'anchor' || !piece.points?.[index + 3])) {
      pathString += ` S ${piece.points[index + 1].x} ${piece.points[index + 1].y} ${piece.points[2].x} ${piece.points[2].y}`
      // S
    } else if (piece.points[index + 1] && (piece.points?.[index + 1]?.type == 'anchor' || !piece.points?.[index + 2])) {
      pathString += ` L ${piece.points[index + 1].x} ${piece.points[index + 1].y}`
      // L
    } else if (piece.points?.[index + 1]?.type == 'control' && !piece.points[index + 2]) {
        pathString += ` S ${piece.points[index + 1].x} ${piece.points[index + 1].y} ${piece.points[0].x} ${piece.points[0].y}`
      // M
    }
    
    const segment = SVG()
    .path(pathString)
    .data("piece", piece)
    .data("point-id", point.id)
    .data("starting-point", point.id)
    .attr({x: point.x, y: point.y, fill:"none"})
    .stroke({color:"hsl(180, 100%, 50%)", width:2})
    .addClass('segment')
    
    const segmentWrangler = SVG()
    .path(pathString)
    .data("piece", piece)
    .data("point-id", point.id)
    .data("starting-point", point.id)
    .attr({x: point.x, y: point.y, fill:"none"})
    .stroke({color:"hsla(0, 0%, 0%, 0.1)", width:10})
    .addClass('segment-wrangler')
    .click((event) => {
      console.info('Rhapsew [Info]: Path clicked')
      // if (data.selectedPiece) {
      //   data.selectedPiece.points = data
      //   .selectedPiece
      //   .points
      //   .concat(
      //     addPoint({
      //       event, data, index: data.selectedPiece.points.length, pieceId: data.selectedPiece.id
      //     }))
      //   }
    })
    
    // draw.add(segment)
    // draw.add(segmentWrangler)
    
    if (point.type == 'control') { // C, S
      draw.find(`[data-source-point-id="${point.id}"]`) ? draw.find(`[data-source-point-id="${point.id}"]`).forEach(line => line.remove()) : null
      let controlPath = []
      if (piece.points[index - 1].type == "control") { // C
        controlPath = piece.points[index + 1] ? [point.x, point.y, piece.points[index + 1].x, piece.points[index + 1].y] : controlPath
      } else { // S
        controlPath = [point.x, point.y, piece.points[index - 1].x, piece.points[index - 1].y]
      }
      
      let controlLine = SVG()
      .line(controlPath)
      .stroke('blue')
      .addClass('control-line')
      .data("source-point-id", point.id)
      
      draw.add(controlLine)
      // renderedPath += ` L ${point.x} ${point.y}`
    }
    
    const domSegment = draw.find(`[data-point-id = "${point.id}"`)?.[0]
    if (domSegment) {
      if (!_.isEqual(AppOps.shallowCopy(domSegment.data("piece")), AppOps.shallowCopy(piece))){
        console.info(`Rhapsew [Info]: Rerendering piece: ${piece.id}`)
        draw.find('.segment').forEach(element => element.remove())
        draw.find('.segment-wrangler').forEach(element => element.remove())
        draw.add(segment)
        draw.add(segmentWrangler)
        piece.points.forEach(point => {
          renderPoint({id: point.id, data, point, piece})
        })
        // }
      }
    } else {
      draw.add(segment)
      draw.add(segmentWrangler)
      piece.points.forEach(point => {
        renderPoint({id: point.id, data, point, piece})
      })
    }
  })
  
  
}

function renderPoint (args:RenderPointArgs) {
  let data = args.data
  let id = args.id
  let point = args.point
  let pieceId = args.piece.id
  const draw = AppOps.initSVGCanvas(data)
  
  const domPoint = draw.find(`[data-id = "${point.id}"]`)[0]
  
  // console.info(`Rhapsew [Info]: Purging DOM point: ${id}`)
  draw.find(`[data-id = "${id}"]`).forEach(element => element.remove())
  // draw.find(`.selection-box`).forEach(element => element.remove())
  
  const renderedPoint = SVG()
  .circle()
  .attr({fill: 'black', cx: point.x, cy: point.y})
  .stroke({color:"hsla(0,0%,0%,0)", width:15})
  .size(7)
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