import { SVG } from '@svgdotjs/svg.js'
import { Piece, Point } from '$lib/ts/classes'
import * as AppOps from '$lib/ts/helpers/appOps'
import { nanoid } from 'nanoid'
import * as History from '$lib/ts/helpers/HistoryManager'
import * as _ from 'lodash'

const TOPBARHEIGHT = 30

function addPiece (args:PieceArgs):State {
  let data:State = {...args.data}
  let event = args.event
  
  console.log('adding a new piece')
  console.log('current pieces', data.pieces)
  
  let newPiece:PieceT = {points: [], name: "test", closed: false, id: nanoid()} // wait nvm
  newPiece.points[0] = addPoint({data, event, pieceId: newPiece.id}) // trying this out
  data.pieces = data.pieces.concat(newPiece) // <- This works fine
  // data.selectedPiece = newPiece
  // data.selectedPiece = null
  
  
  data.selectedPiece = data.pieces.filter(piece => piece.id == newPiece.id)[0]
  // data.selectedPiece = data.pieces.slice(-1)[0]
  data.selectedPoint = data.selectedPiece.points[0]
  console.info(`Rhapsew [Info]: New piece added: ${data.selectedPiece.id}`)
  console.info("selected piece", data.selectedPiece)
  console.log('pieces', data.pieces)
  for (let piece of data.pieces) {
    console.log('piece', piece)
  }
  
  return data
}

function addPoint (args: AddPointArgs): PointT {
  const data = args.data
  const pieceId = args.pieceId
  const id = nanoid()
  const draw = AppOps.initSVGCanvas(args.data)
  const event = args.event
  const piece = data.pieces.filter(piece => piece.id == pieceId)[0]
  const parent = args.parent ?? null
  const type = args.type ?? "anchor"
  const coords = args.coords ?? SVG(`svg`).point(args.event.pageX, args.event.pageY)
  
  console.log(coords)

  const point = new Point({...coords, active: true, type, id, pieceId, parent})
  
  if (args.event.shiftKey) {
    // point.type = "control"
    point.x = piece.points.slice(-1)[0].x
    console.log('shift')
  }
  
  console.info(`Rhapsew [Info]: New point: ${point.id}`)
  
  return point
}

function findPreviousSegment (args:FindPreviousSegmentArgs):PointT {
  let data = args.data
  let piece = data.selectedPiece
  let point = piece.points.filter(point => point.id == data.selectedPoint.id)[0]
  let pointIndex = piece.points.indexOf(point)
  let prevSegment
  /**
  * Given a point and piece
  * search through the piece's points for the previous anchor
  * negative lookbehind?? (not regex tho)
  * is index - 1 an anchor?
  * if not, look for index - 2, etc
  */
  for (let index = pointIndex - 1; index > -1; index--) {
    if (piece.points[index].type == "anchor") {
      prevSegment = piece.points[index]
      break
    }
  }
  return prevSegment
}

function renderPiece (args:RenderPieceArgs):void {
  let data = args.data
  let piece = args.piece
  
  const draw = AppOps.initSVGCanvas(data)
  
  
  piece.points.forEach((point: PointT, index: number) => {
    let pathString = `M ${point.x} ${point.y}`
    
    const point0 = point
    const pointPieceOrigin = piece.points[0]
    const point1 = piece.points[index + 1] ?? null
    const point2 = piece.points[index + 2] ?? null
    const point3 = piece.points[index + 3] ?? null
    const point4 = piece.points[index + 4] ?? null
    
    if (point.type == "anchor") {
      if (point3 && point1?.type == 'control' && point2?.type == 'control' && (point3?.type == 'anchor' || !point4)) {
        pathString += ` C ${point1.x} ${point1.y} ${point2.x} ${point2.y} ${point3.x} ${point3.y}`
        // C
      } else if (point3 && point1?.type == 'control' && point2?.type == 'control' && piece.closed) {
        pathString += ` C ${point1.x} ${point1.y} ${point2.x} ${point2.y} ${pointPieceOrigin.x} ${pointPieceOrigin.y}`
        // C
      } else if (point2 && point1?.type == 'control' && (point2?.type == 'anchor' || !point3)) {
        pathString += ` S ${point1.x} ${point1.y} ${point2.x} ${point2.y}`
        // S
      } else if (!point2 && point1?.type == 'control' && piece.closed) {
        pathString += ` S ${point1.x} ${point1.y} ${pointPieceOrigin.x} ${pointPieceOrigin.y}`
        // S
      } else if (point1 && (point1?.type == "anchor" || !point2)) {
        pathString += ` L ${point1.x} ${point1.y}`
        // L
      } else if (!point1 && piece.closed) {
        pathString += ` L ${pointPieceOrigin.x} ${pointPieceOrigin.y}`
        // L
      }
    }
    
    const segment = SVG()
    .path(pathString)
    .data("piece", piece)
    .data("point-id", point.id)
    .data("starting-point", point.id)
    .attr({x: point.x, y: point.y, fill:"none"})
    .stroke({color:"hsl(180, 100%, 50%)", width:2})
    .addClass('segment')
    .addClass('rhapsew-element')
    
    const segmentWrangler = SVG()
    .path(pathString)
    .data("piece", piece)
    .data("point-id", point.id)
    .data("starting-point", point.id)
    .attr({x: point.x, y: point.y, fill:"none"})
    .stroke({color:"hsla(0, 0%, 0%, 0.1)", width:10})
    .addClass('segment-wrangler')
    .addClass('rhapsew-element')
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
    .on('mouseover', (event:MouseEvent) => {
      let mousePoint = SVG(`svg`).point(event.clientX, event.clientY)
      let length = segment.length().toPrecision(5).toString()
      
      let text = SVG()
      .text(length)
      .attr({x: mousePoint.x + 20, y: mousePoint.y + 25})
      .font({
        family: 'sans-serif'
        , size: 12
        , anchor: "left"
      })
      .addClass('hover-measure')
      .addClass('rhapsew-element')
      
      draw.add(text)
    })
    .on('mouseout', (event) => {
      draw.find('.hover-measure').forEach(element => element.remove())
    })
    
    // draw.add(segment)
    // draw.add(segmentWrangler)
    
    if (point.type == 'control') { // C, S
      let parent = data.pieces.filter(p => p.id == piece.id)[0].points.filter(p => p.id == point.parent.id)[0]
      draw.find(`[data-parent-id="${parent.id}"]`) ? draw.find(`[data-parent-id="${parent.id}"]`).forEach(line => line.remove()) : null
      let controlPath = [point.x, point.y, parent.x, parent.y]
      
      let controlLine = SVG()
      .line(controlPath)
      .stroke('hsla(240, 100%, 50%, 0.5)')
      .data("parent-id", point.parent.id)
      .addClass('control-line')
      .addClass('rhapsew-element')
      
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

function renderPoint (args:RenderPointArgs):void {
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
  .data('id', id)
  .data('point', point)
  .data('pieceId', pieceId)
  .addClass('anchor')
  .addClass('rhapsew-element')
  
  draw.add(renderedPoint)
  const domSelectionBox = draw.find(`.selection-box`)[0]
  
  const selectionBox = SVG()
  .rect()
  .attr({fill:"none", width: 20, height: 20, x: point.x -10, y: point.y -10})
  .stroke({color:"hsla(0,0%,0%,0.5)", width:2})
  .data('id', id)
  .addClass('selection-box')
  .addClass('rhapsew-element')
  
  if (data.selectedPoint) {
    switch (data.selectedPoint.id == id) {
      case true:
      if (domSelectionBox) {
        domSelectionBox.remove()
      }
      draw.add(selectionBox)
      break
      default:
    }
  }
}

function wipe (data:State) {
  const draw = AppOps.initSVGCanvas(data)
  draw.find('.rhapsew-element').forEach(element => element.remove())
}


export {
  addPiece
  , addPoint
  , findPreviousSegment
  , renderPiece
  , renderPoint
  , wipe
}