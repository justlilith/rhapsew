import { SVG } from '@svgdotjs/svg.js'
import { Point } from '$lib/ts/classes'
import * as PieceOps from '$lib/ts/helpers/pieceOps'

const TOPBARHEIGHT = 30

function toggleContextMenu (args) {
  switch (args.state) {
    case 'on':
    args.data.menu = true
    args.data.menuX = args.x
    args.data.menuY = args.y
    break
    case 'off':
    default:
    args.data.menu = false
  }
  return args.data
}

function handleClick (args) {
  console.log(args.event)
  if (args.event.target.classList.contains('svg')) {
    switch (args.event.button) {
      case 2:
      args.data = toggleContextMenu({data: args.data, state:'on', x:args.event.clientX, y:args.event.clientY})
      console.log('correct')
      let draw = initSVGCanvas(args.data.parent)
      draw.find('.activeLine').forEach(element => element.remove())
      try {
        args.data.pieces[0].points.slice(-1)[0].active = false
      } catch (e) {
        console.warn(e)
      }
      break
      case 0:
      default:
      args.data = toggleContextMenu({data: args.data, state:'off'})
      args.data.selectedPoint = null
      let points = []
      
      if (args.data.pieces.length == 0) {
        args.data.pieces = [PieceOps.addPiece(args.data)]
      }
      if (args?.points?.slice(-1)?.[0]?.active) {
        // args.points.slice(-1)[0].active = false
        points = [...args.data.pieces[0].points, PieceOps.addPoint(args)]
      }
      else {
        points = args.data?.pieces[0]?.points ? [...args.data.pieces[0].points, PieceOps.addPoint(args)] : [PieceOps.addPoint(args)]
      }
      args.data.pieces[0].points = points
    }
  }
  
  if (args.event.target.classList.contains('anchor')) {
    switch (args.data.pieces[0].points.slice(-1)[0].active) {
      case true:
      args.data.pieces[0].points.slice(-1)[0].active = false
      let draw = initSVGCanvas(args.data.parent)
      draw.find('.activeLine').forEach(element => element.remove())
      if (args.event.target.getAttribute('data-id') == args.data.pieces[0].points[0].id) {
        args.data.pieces[0].closed = true
      }
      case false:
      default:
      args.data.selectedPoint = args.event.target.getAttribute('data-id')
      console.log(args.data.selectedPoint)
    }
    console.log('finished')
  }
  
  return args.data
}

function handleMove (args) {
  if (args.data?.pieces[0]?.points?.slice(-1)?.[0]?.active) {
    let draw = initSVGCanvas(args.data.parent)
    draw.find('.activeLine').forEach(element => element.remove())
    let mousePoint = SVG(`svg`).point(args.event.clientX, args.event.clientY)
    draw.add(SVG().line([args.data.pieces[0].points.slice(-1)[0].x, args.data.pieces[0].points.slice(-1)[0].y, mousePoint.x + 5, mousePoint.y + 5]).addClass('activeLine').stroke("red"))
  }
  if (args.data.selectedPoint && args.data.moving) {
    
  }
  return args.data
}

function init (data) {
  document.querySelector('#canvas').addEventListener('contextmenu', (e) => {
    e.preventDefault()
    handleClick({event: e, data}) 
  })
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
  , init
  , initSVGCanvas
  , writeToStatus
}