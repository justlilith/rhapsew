import { SVG } from '@svgdotjs/svg.js'
import { Point } from '$lib/ts/classes'
import * as PieceOps from '$lib/ts/helpers/pieceOps'
// import type { State } from 'app/lib/global'

const TOPBARHEIGHT = 30

function shallowCopy (arg) {
  return JSON.parse(JSON.stringify(arg))
}

function toggleContextMenu (args) {
  switch (args.state) {
    case 'on':
    args.data.menu = true
    args.data.menuX = args.x ?? 0
    args.data.menuY = args.y ?? 0
    break
    case 'off':
    default:
    args.data.menu = false
  }
  return args.data
}

interface HandleClickArgs {
  event: MouseEvent
  data: State
}
function handleClick (args:HandleClickArgs) {
  console.log(args.event)
  const id = args.event.target.getAttribute('data-id') ?? null
  if (args.event.target.classList.contains('svg')) {
    switch (args.event.button) {
      case 2:
      args.data = toggleContextMenu({data: args.data, state:'on', x:args.event.clientX, y:args.event.clientY})
      console.log('correct')
      let draw = initSVGCanvas(args.data)
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
        args.data.pieces = PieceOps.addPiece(args.data).pieces
      }
      if (args?.data?.pieces?.[0].points?.slice(-1)?.[0]?.active) {
        // args.points.slice(-1)[0].active = false
        points = [...args.data.pieces[0].points, PieceOps.addPoint({...args, index: args.data.pieces[0].points.length})]
      }
      else {
        points = args.data?.pieces[0]?.points
        ? [...args.data.pieces[0].points, PieceOps.addPoint({...args, index: args.data.pieces[0].points.length})]
        : [PieceOps.addPoint({...args, index: 0})]
      }
      args.data.pieces[0].points = points
    }
  }
  
  if (args.event.target.classList.contains('anchor')) {
    switch (args.data.pieces[0].points.slice(-1)[0].active) {
      case true:
      args.data.pieces[0].points.slice(-1)[0].active = false
      let draw = initSVGCanvas(args.data)
      draw.find('.activeLine').forEach(element => element.remove())
      if (args.event.target.getAttribute('data-id') == args.data.pieces[0].points[0].id) {
        args.data.pieces[0].closed = true
      }
      break
      case false:
      default:
      args.data.selectedPoint = args.event.target.getAttribute('data-id')
      console.log(`Rhapsew [Info]: Selected Point: ${args.data.selectedPoint}`)
      PieceOps.renderPoint({data:args.data, id:args.event.target.getAttribute('data-id'), point:args.data.pieces[0].points.filter(point => point.id == id)[0]})
    }
    console.log('finished')
  }
  
  return args.data
}

interface HandleMoveArgs {
  data: State
  event: MouseEvent
}

function handleMove (args:HandleMoveArgs) {
  let draw = initSVGCanvas(args.data)
  
  if (args.data?.pieces[0]?.points?.slice(-1)?.[0]?.active) {
    draw.find('.activeLine').forEach(element => element.remove())
    let mousePoint = SVG(`svg`).point(args.event.clientX, args.event.clientY)
    let activeLine = SVG()
    .line([args.data.pieces[0].points.slice(-1)[0].x, args.data.pieces[0].points.slice(-1)[0].y, mousePoint.x + 5, mousePoint.y + 5])
    .addClass('activeLine')
    .stroke("red")
    
    draw.add(activeLine)
  }
  
  if (args.data.selectedPoint && args.data.moving) {
    let id = args.data.selectedPoint
    // SVG().find(`[data-id = "${id}"]`)[0].remove()
    args.data.pieces[0].points = args.data.pieces[0].points.map(point => {
      if (point.id == args.data.selectedPoint) {
        point.x = SVG(`svg`).point(args.event.clientX, args.event.clientY).x
        point.y = SVG(`svg`).point(args.event.clientX, args.event.clientY).y
      }
      return point
    })
  }
  return args.data
}

function init (data) {
  document.querySelector('#canvas').addEventListener('contextmenu', (e:MouseEvent) => {
    e.preventDefault()
    handleClick({event: e, data}) 
  })
}

function initSVGCanvas (args:State) {
  let draw = SVG(`svg`)
  if (!draw) {
    draw = SVG().addTo(args.parent).addClass(`svg`)
  }
  return draw
}

function writeToStatus () {
  
}

export {
  shallowCopy
  , handleClick
  , handleMove
  , init
  , initSVGCanvas
  , toggleContextMenu
  , writeToStatus
}