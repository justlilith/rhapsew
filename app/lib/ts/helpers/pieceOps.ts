import { SVG } from '@svgdotjs/svg.js'
import { Piece, Point } from '$lib/ts/classes'
import * as AppOps from '$lib/ts/helpers/appOps'
import { nanoid } from 'nanoid'

const TOPBARHEIGHT = 30

function addPiece (data) {
  data.pieces.concat(new Piece())
  return data
}

function addPoint (args) {
  // console.log(args.event)
  const id = nanoid()
  const draw = AppOps.initSVGCanvas(args)
  var coords = SVG(`svg`).point(args.event.pageX, args.event.pageY)
  draw.add(SVG().circle().attr({fill: 'black', cx: coords.x, cy: coords.y}).size(10).addClass('anchor').data('id', id))
  if (args.activePoint) {
    draw.add(SVG().path())
  }
  const point = new Point({...coords, active: true, id})
  switch (args.event.altKey) {
    case true:
    point.type = "handle"
    break
    case false:
    break
    default:
  }
  // const point = new Point({...coords, type:"handle"})
  return point
}

function movePoint (args) {

}

function renderPiece (args) {
  const draw = AppOps.initSVGCanvas(args)
  draw.find('.piece').forEach(element => element.remove())

  let renderedPath = `M ${args.points[0].x} ${args.points[0].y}`
  // args.points = args.points.slice(1)
  args.points.forEach((point, index) => {
    if (index - 1 >= 0){
      // const dx = point.x - args.points[index -1].x
      // const dy = point.y - args.points[index -1].y
      switch (point?.type) {
        case "handle":
        if (args.points[index + 1]) {
          renderedPath += ` S ${point.x} ${point.y} ${args.points[index +1].x} ${args.points[index +1].y}`
        } else {
          renderedPath += ` L ${point.x} ${point.y}`
        }
        if (args.points[index -1]) {
          let controlPath = [point.x, point.y, args.points[index -1].x, args.points[index -1].y]
          draw.add(SVG().line(controlPath).stroke('blue'))

        }
        break
        case false:
        default:
        renderedPath += ` L ${point.x} ${point.y}`
      }
    }
  })
  if (args.closed) {
    renderedPath += ` z`
  }
  draw.find('.piece').forEach(element => element.remove())
  draw.add(SVG().path(renderedPath).attr({x: args.points[0].x, y: args.points[0].y, fill:"none", stroke:"cyan"}).addClass('piece'))
}


export {
  addPiece
  , addPoint
  , movePoint
  , renderPiece
}