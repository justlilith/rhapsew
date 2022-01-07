import { SVG } from '@svgdotjs/svg.js'
import { Piece, Point } from '$lib/ts/classes'
import * as AppOps from '$lib/ts/helpers/appOps'
import { nanoid } from 'nanoid'

const TOPBARHEIGHT = 30

function addPiece (data:State|any) {
  data.pieces = data.pieces.concat(new Piece())
  return data
}

type addPointArgs = {
  event: MouseEvent
  data: State
}
function addPoint (args:addPointArgs) {
  // console.log(args.event)
  const id = nanoid()
  const draw = AppOps.initSVGCanvas(args.data)
  let coords = SVG(`svg`).point(args.event.pageX, args.event.pageY)
  // draw.add(SVG().circle().attr({fill: 'black', cx: coords.x, cy: coords.y}).size(10).addClass('anchor').data('id', id))
  
  
  // if (args.activePoint) {
  //   draw.add(SVG().path())
  // }
  const point = new Point({...coords, active: true, id})
  switch (args.event.altKey) {
    case true:
    point.type = "handle"
    break
    case false:
    break
    default:
  }
  
  // renderPoint({id, data: args.data, point})
  // const point = new Point({...coords, type:"handle"})
  return point
}

function movePoint (args) {
  
}

interface RenderPieceArgs {
  data: State
  piece: Piece  
}
function renderPiece (args:RenderPieceArgs) {
  const draw = AppOps.initSVGCanvas(args.data)
  draw.find('.piece').forEach(element => element.remove())
  
  let renderedPath = `M ${args.piece.points[0].x} ${args.piece.points[0].y}`
  // args.points = args.points.slice(1)
  args.piece.points.forEach((point, index) => {
    if (index - 1 >= 0){
      // const dx = point.x - args.points[index -1].x
      // const dy = point.y - args.points[index -1].y
      switch (point?.type) {
        case "handle":
        if (args.piece.points[index + 1]) {
          renderedPath += ` S ${point.x} ${point.y} ${args.piece.points[index +1].x} ${args.piece.points[index +1].y}`
        } else {
          renderedPath += ` L ${point.x} ${point.y}`
        }
        if (args.piece.points[index -1]) {
          draw.find(`[data-sourcePointId="${point.id}"]`) ? draw.find(`[data-sourcePointId="${point.id}"]`).forEach(line => line.remove()) : null
          let controlPath = [point.x, point.y, args.piece.points[index -1].x, args.piece.points[index -1].y]
          let controlLine = SVG().line(controlPath).stroke('blue').addClass('control-line').data("sourcePointId",point.id)
          draw.add(controlLine)
        }
        break
        default:
        renderedPath += ` L ${point.x} ${point.y}`
      }
    }
  })
  if (args.piece.closed) {
    renderedPath += ` z`
  }
  draw.find('.piece').forEach(element => element.remove())
  const renderedPiece = SVG()
  .path(renderedPath)
  .attr({x: args.piece.points[0].x, y: args.piece.points[0].y, fill:"none", stroke:"cyan"})
  .addClass('piece')
  .click((event) => {
    addPoint({event, data: args.data})
  })
  draw.add(renderedPiece)
}

type RenderPointArgs = {
  id: string
  data: State
  point: Point
}
function renderPoint (args:RenderPointArgs) {
  const draw = AppOps.initSVGCanvas(args.data)
  
  const domPoint = draw.find(`[data-id = "${args.point.id}"]`)[0]
  
  if (!domPoint || domPoint.data('point').x != args.point.x || domPoint.data('point').y != args.point.y) {
    console.log('purging')
    // .forEach(element => element.remove())
    draw.find(`[data-id = "${args.id}"]`).forEach(element => element.remove())
    draw.find(`.selection-box`).forEach(element => element.remove())
    
    const renderedPoint = SVG()
    .circle()
    .attr({fill: 'black', cx: args.point.x, cy: args.point.y})
    .stroke({color:"hsla(0,0%,0%,0)", width:15})
    .size(10)
    .addClass('anchor')
    .data('id', args.id)
    .data('point', args.point)
    
    draw.add(renderedPoint)
  }
  const domSelectionBox = draw.find(`.selection-box`)[0]
  
  const selectedPoint = SVG()
  .rect()
  .attr({fill:"none", width: 20, height: 20, x: args.point.x -10, y: args.point.y -10})
  .stroke({color:"hsla(0,0%,0%,0.5)", width:2})
  .addClass('selection-box')
  .data('id', args.id)
  
  switch (args.data.selectedPoint == args.id) {
    case true:
    if (domSelectionBox) {
      domSelectionBox.remove()
    }
    draw.add(selectedPoint)
    break
    default:
    // console.log('point selected')
  }
}


export {
  addPiece
  , addPoint
  , movePoint
  , renderPiece
  , renderPoint
}