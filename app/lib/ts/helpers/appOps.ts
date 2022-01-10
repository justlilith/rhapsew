import { SVG } from '@svgdotjs/svg.js'
import * as PieceOps from '$lib/ts/helpers/pieceOps'
// import type { State } from 'app/lib/global'
import type { Element } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.panzoom.js'
import { Point } from '../classes'

const TOPBARHEIGHT = 30



function clearScreen (args):State {
  let data:State = args.data
  
  let draw = initSVGCanvas(data)
  
  data.selectedPiece = null
  data.selectedPoint = null
  data.pieces = []
  
  draw.clear()
  return data
}

function exportSvg (args) {
  const data = args.data
  let draw = initSVGCanvas(data)
  let output = draw.svg((node:Element) => {
    if (node.hasClass('segment-wrangler') || node.hasClass('anchor')) {
      return false
    }
    if (node.hasClass('piece')) {
      node.attr({stroke: "black"})
    }
  })
  let svgPacket = {name: ""}
  // notify('downloading chat! c:', 1000)
  svgPacket.name = "Rhapsew — Document"
  const date = new Date()
  const filenameFinal = `${svgPacket.name} (from ${date.toDateString()}).svg`
  const file = new File([output], filenameFinal, {
    type: 'text/svg'
  })
  const download = document.createElement('a')
  download.setAttribute('id',file.name)
  download.setAttribute('download',filenameFinal)
  const link = URL.createObjectURL(file)
  download.setAttribute('href',link)
  document.body.append(download)
  download.click()
  download.onload = () => {URL.revokeObjectURL(link)}
  document.body.removeChild(download)
}

function handleClick (args:HandleClickArgs):State {
  let data= args.data
  let event= args.event
  const id = event.target.getAttribute('data-id') ?? null
  
  let draw = initSVGCanvas(data)
  
  console.log(event)
  console.log("data!!", data)
  
  return data
}

interface HandleMouseArgs {
  data: State
  event: MouseEvent
}

function handleMousedown (args:HandleMouseArgs):State {
  let data = args.data
  let event = args.event
  let draw = initSVGCanvas(data)
  
  console.info(`Rhapsew [Info]: Mousedown`)
  console.log(data?.selectedPiece?.points)
  console.log(event)
  
  
  if (event.target.classList.contains(`anchor`)) {
    let domPoint:PointT = JSON.parse(event.target.getAttribute('data-point'))
    let id = domPoint.id
    let pieceId: string = event.target.getAttribute('data-pieceId')
    
    data.selectedPiece = data.pieces.filter(piece => piece.id == pieceId)[0]
    data.selectedPoint = domPoint
    data.moving = true
    
    console.info(`Rhapsew [Info]: Selected point: ${data?.selectedPoint}`)
    console.info(`Rhapsew [Info]: data.selectedPiece.id: ${data?.selectedPiece.id}`)
    console.info(`Rhapsew [Info]: data.selectedPiece.points[0].id: ${data?.selectedPiece.points[0].id}`)
    
    if (id == data.selectedPiece.points[0].id && data.selectedPiece.points.length != 1) {
      data.selectedPiece.closed = true
      console.info(`Rhapsew [Info]: Closing piece: ${data.selectedPiece.id}`)
    }
    
    draw.find('.activeLine').forEach(element => element.remove())
    data.selectedPiece.points.forEach(point => point.id == id ? point.active = true : point.active = false)
  }
  
  
  
  if (event.target.classList.contains('svg')) {
    switch (event.button) {
      case 2: // right-click
      data = toggleContextMenu({data, state:'on', x:event.clientX, y:event.clientY})
      draw.find('.activeLine').forEach(element => element.remove())
      break
      case 0:
      default: // left-click
      data = toggleContextMenu({data, state:'off'})
      let points = []
      data.selectedPoint = null
      
      if (data.selectedPiece) {
        console.log("selected piece", data.selectedPiece)
        if (!data.selectedPiece.closed) {
          const newPoint = PieceOps.addPoint({...args, pieceId: data.selectedPiece.id})
          // points = [...data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points, newPoint]
          points = [...data.selectedPiece.points, newPoint]
          // data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points = points
          // data.selectedPiece = data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0]
          data.selectedPiece.points = points
          data.selectedPoint = data.selectedPiece.points.slice(-1)[0]
        }
        else {
          data.selectedPiece = null
          data.selectedPoint = null
          data.pieces.forEach(piece => {
            piece.points.forEach(point => point.active = false)
          })
          console.log("clicked")
        }
      } else {
        data.selectedPiece = null
        data.selectedPoint = null
        data.pieces.forEach(piece => {
          piece.points.forEach(point => point.active = false)
        })
      }
    }
  }
  
  return data  
}

function handleMouseup (args:HandleMouseArgs):State {
  let data = args.data
  let event = args.event
  
  data.moving = false
  return data  
}


function handleMousemove (args:HandleMoveArgs) {
  let data = args.data
  let event = args.event
  
  let draw = initSVGCanvas(data)
  
  if (data?.selectedPiece?.points?.slice(-1)?.[0]?.active && data.selectedPiece.closed == false) {
    draw.find('.activeLine').forEach(element => element.remove())
    let mousePoint = SVG(`svg`).point(event.clientX, event.clientY)
    let activeLine = SVG()
    .line([data.selectedPiece.points.slice(-1)[0].x, data.selectedPiece.points.slice(-1)[0].y, mousePoint.x + 5, mousePoint.y + 5])
    .addClass('activeLine')
    .addClass('rhapsew-element')
    .stroke("red")
    
    draw.add(activeLine)
  }
  
  if (data.selectedPoint && data.moving) {
    let id = data.selectedPoint.id
    data.selectedPiece.points = data.selectedPiece.points.map(point => {
      if (point.id == id) {
        point.x = SVG(`svg`).point(event.clientX, event.clientY).x
        point.y = SVG(`svg`).point(event.clientX, event.clientY).y
      }
      return point
    })
  }
  
  if (event.ctrlKey && data.selectedPoint) {
    // data.selectedPiece.points
    /** How do you wanna do this?
    * 
    * assume no intermediate control points
    * assume M 0 0
    * click + ctrl -> M 0 0 S 100 100 0 100
    * 2 points to 3 points
    * [0, 1] -> [0, new, 1]
    * segment points = [points[0], new, points[1]]
    * 
    * if intermediate control points
    * click ctrl -> 3 points to 4 points
    * [0, 1, 2] -> [0, 1, new, 2]
    * It's always the second to last of an array...
    * 
    * how do we get the points of a segment??
    * what about the first point?
    * 
    * A segment's id is the same as the anchor point that begins it!
    * get the previous segment and check it
    * 
    * Don't forget that control points have different behavior
    * 
    * What about ctrl+click? Because this is only for ctrl+drag!!
    */
    
    let point = data.selectedPiece.points.filter(point => point.id == data.selectedPoint.id)[0]
    let pointIndex = data.selectedPiece.points.indexOf(point) // returns -1 if not present!!
    let previousSegment = PieceOps.findPreviousSegment({data, point})
    let previousSegmentIndex = 0
    if (previousSegmentIndex) {
      previousSegmentIndex = data.selectedPiece.points.indexOf(previousSegment)
    }
    if (point.type == "anchor") {
      let range = data.selectedPiece.points.slice(previousSegmentIndex, pointIndex)
      // console.log(range)
      // range.length /* 1 or 2 */ 
      switch (range.length) {
        case 3: // C
        break
        case 2: // S
        break
        case 1: // L
        // insert new control point with current segment as parent segment
        const newPoint = PieceOps.addPoint({event, data, pieceId: data.selectedPiece.id, parent: data.selectedPoint})
        break
        case 0: // M
        // console.log(data)
        data.selectedPiece.points = data.selectedPiece.points.concat(PieceOps.addPoint({event, data, pieceId: data.selectedPiece.id}))
        data.selectedPiece.points[1].type = 'control'
        data.selectedPoint = data.selectedPiece.points[1]
        default:
        break
      }
    } else { // "control"
      
    }
    
  }
  
  return data
}

function init (data) {
  document.querySelector('#canvas').addEventListener('contextmenu', (e:MouseEvent) => {
    e.preventDefault()
    handleClick({event: e, data}) 
  })
}

function initSVGCanvas (data:State) {
  let draw = SVG(`svg`)
  if (!draw) {
    draw = SVG()
    .addTo(data.parent)
    .addClass(`svg`)
    .addClass('rhapsew-element')
    .viewbox(0,0,1000,100)
    .panZoom({panning: false, zoomMin: 0.01, zoomMax: 20})
    .zoom(1)
    
    draw.on('zoom', (event) => {
      // console.log(event)
      // data.zoom = event.detail.level
      // draw.fire('rhapsewZoom', event)
      window.dispatchEvent(new CustomEvent('rhapsewZoom', event))
      
    })
    // window.addEventListener('rhapsewZoom', e => console.log("whoa", e))
    
  }
  return draw
}

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

function writeToStatus () {
  
}

export {
  clearScreen
  , exportSvg
  , handleClick
  , handleMousedown
  , handleMouseup
  , handleMousemove
  , init
  , initSVGCanvas
  , shallowCopy
  , toggleContextMenu
  , writeToStatus
}