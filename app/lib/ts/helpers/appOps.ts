import { SVG } from '@svgdotjs/svg.js'
import { Point } from '$lib/ts/classes'
import * as PieceOps from '$lib/ts/helpers/pieceOps'

const TOPBARHEIGHT = 30

function handleClick (args) {
  if (args.event.target.classList.contains('svg')) {
    console.log(args.event)
    let points = []

    if (args?.points?.slice(-1)?.[0]?.active) {
      // args.points.slice(-1)[0].active = false
      points = [...args.data.pieces[0].points, PieceOps.addPoint(args)]
    }
    else {
      points = args.data.pieces[0].points ? [...args.data.pieces[0].points, PieceOps.addPoint(args)] : [PieceOps.addPoint(args)]
    }
    args.data.pieces[0].points = points
  }
  if (args.event.target.classList.contains('anchor')) {
    console.log(args.data)
    // args.data.pieces[0].slice(-1)[0].active = false
    console.log('finished')
  }
  return args.data
}

function handleMove (args) {
  if (args.data?.pieces[0]?.points?.length > 0) {
    if (args.data?.pieces[0]?.points?.slice(-1)?.[0]?.active){
      let draw = initSVGCanvas(args.data.parent)
      draw.find('.activeLine').forEach(element => element.remove())
      let mousePoint = SVG(`svg`).point(args.event.clientX, args.event.clientY)
      draw.add(SVG().line([args.data.pieces[0].points.slice(-1)[0].x, args.data.pieces[0].points.slice(-1)[0].y, mousePoint.x + 1, mousePoint.y + 1]).addClass('activeLine').stroke("red"))
    }
  }
  return args.data
}

function initSVGCanvas (args) {
  let draw = SVG(`svg`)
  if (!draw) {
    draw = SVG().addTo(args.parent).addClass(`svg`)
  }
  return draw
}

function writeToStatus () {
  
}

export {
  handleClick
  , handleMove
  , initSVGCanvas
  , writeToStatus
}