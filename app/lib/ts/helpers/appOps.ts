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
  let data= args.data
  let event= args.event
  // console.log(event)
  const id = event.target.getAttribute('data-id') ?? null
  if (event.target.classList.contains('svg')) {
    switch (event.button) {
      case 2: // right-click
      data = toggleContextMenu({data, state:'on', x:event.clientX, y:event.clientY})
      console.log('correct')
      let draw = initSVGCanvas(data)
      draw.find('.activeLine').forEach(element => element.remove())
      try {
        data.pieces.forEach(piece => {
          // piece.points.slice(-1)[0].active = false
        })
      } catch (e) {
        console.warn(e)
      }
      break
      case 0:
      default: // left-click
      data = toggleContextMenu({data, state:'off'})
      data.selectedPoint = null
      let points = []
      
      if (data.selectedPiece) {
        // data = PieceOps.addPiece({data, event})
        
        if (data.selectedPiece && args?.data?.pieces?.[0].points?.slice(-1)?.[0]?.active) {
          // args.points.slice(-1)[0].active = false
          points = [...data.pieces[0].points, PieceOps.addPoint({...args, index: data.pieces[0].points.length})]
          data.pieces[0].points = points
        }
        else {
          points = data?.pieces[0]?.points
          ? [...data.pieces[0].points, PieceOps.addPoint({...args, index: data.pieces[0].points.length})]
          : [PieceOps.addPoint({...args, index: 0})]
          data.pieces[0].points = points
        }
      }
    }
  }
  
  if (event.target.classList.contains('anchor')) {
    switch (data.pieces[0].points.slice(-1)[0].active) {
      case true:
      data.pieces[0].points.slice(-1)[0].active = false
      let draw = initSVGCanvas(data)
      draw.find('.activeLine').forEach(element => element.remove())
      if (event.target.getAttribute('data-id') == data.pieces[0].points[0].id) {
        data.pieces[0].closed = true
      }
      break
      case false:
      default:
      data.selectedPoint = event.target.getAttribute('data-id')
      console.log(`Rhapsew [Info]: Selected Point: ${data.selectedPoint}`)
      PieceOps.renderPoint({data:data, id:event.target.getAttribute('data-id'), point:data.pieces[0].points.filter(point => point.id == id)[0]})
    }
    console.log('finished')
  }
  
  return data
}

interface HandleMouseArgs {
  data: State
  event: MouseEvent
}

function handleMousedown (args:HandleMouseArgs) {
  let data = args.data
  let event = args.event

  if (event.target.classList.contains(`anchor`)) {
    console.log(data)
    let id = event.target.getAttribute('data-id')
    console.log(`Raphsew [Info]: Point selected: ${id}`)
    data.selectedPoint = id
    data.moving = true
  }
  return data  
}

function handleMouseup (args:HandleMouseArgs) {
  let data = args.data
  let event = args.event

  data.moving = false
  return data  
}


function handleMove (args:HandleMoveArgs) {
  let data = args.data
  let event = args.event

  let draw = initSVGCanvas(data)
  
  if (data?.pieces[0]?.points?.slice(-1)?.[0]?.active) {
    draw.find('.activeLine').forEach(element => element.remove())
    let mousePoint = SVG(`svg`).point(event.clientX, event.clientY)
    let activeLine = SVG()
    .line([data.pieces[0].points.slice(-1)[0].x, data.pieces[0].points.slice(-1)[0].y, mousePoint.x + 5, mousePoint.y + 5])
    .addClass('activeLine')
    .stroke("red")
    
    draw.add(activeLine)
  }
  
  if (data.selectedPoint && data.moving) {
    let id = data.selectedPoint
    // SVG().find(`[data-id = "${id}"]`)[0].remove()
    data.pieces[0].points = data.pieces[0].points.map(point => {
      if (point.id == data.selectedPoint) {
        point.x = SVG(`svg`).point(event.clientX, event.clientY).x
        point.y = SVG(`svg`).point(event.clientX, event.clientY).y
      }
      return point
    })
  }
  return data
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
  , handleMousedown
  , handleMouseup
  , handleMove
  , init
  , initSVGCanvas
  , toggleContextMenu
  , writeToStatus
}