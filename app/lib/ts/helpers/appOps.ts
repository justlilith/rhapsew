import { SVG } from '@svgdotjs/svg.js'
import * as PieceOps from '$lib/ts/helpers/pieceOps'
// import type { State } from 'app/lib/global'
import type { Element } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.panzoom.js'
import { Point } from '../classes'
import * as HistoryManager from '$lib/ts/helpers/HistoryManager'

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
    data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points.forEach(point => point.id == id ? point.active = true : point.active = false)
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
      // this area right here, officer
      data = toggleContextMenu({data, state:'off'})
      let points = []
      // data.selectedPoint = null
      
      if (data.selectedPiece) {
        if (!data.selectedPiece.closed) {
          const newPoint = PieceOps.addPoint({...args, pieceId: data.selectedPiece.id})
          // points = [...data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points, newPoint]
          points = [...data.selectedPiece.points, newPoint]
          // data.selectedPiece = data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0]
          // no circular references — update both
          data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points = points
          data.selectedPiece.points = points
          data.selectedPoint = data.selectedPiece.points.slice(-1)[0]
        }
        else {
          data.selectedPiece = null
          data.selectedPoint = null
          data.pieces.forEach(piece => {
            piece.points.forEach(point => point.active = false)
          })
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
  let draw = initSVGCanvas(data)
  
  draw.find('.spark-guide').forEach(element => element.remove())
  
  data.moving = false
  return data  
}


function handleMousemove (args:HandleMoveArgs) {
  let data = args.data
  let event = args.event
  
  let draw = initSVGCanvas(data)
  const slack = 5
  const currentCoords = SVG(`svg`).point(event.clientX, event.clientY)
  const allPoints = data.pieces.map(piece => piece.points).flat()
  const verticalNeighbor = allPoints.filter(point => point.x + slack >= currentCoords.x && point.x - slack <= currentCoords.x && point.id != data.selectedPoint.id)[0]
  const horizontalNeighbor = allPoints.filter(point => point.y + slack >= currentCoords.y && point.y - slack <= currentCoords.y && point.id != data.selectedPoint.id)[0]
  
  draw.find('.spark-guide').forEach(element => element.remove())
  
  if (!data.menu && data?.selectedPiece?.points?.slice(-1)?.[0]?.active && data.selectedPiece.closed == false) {
    draw.find('.activeLine').forEach(element => element.remove())
    draw.find('.spark-guide').forEach(element => element.remove())
    
    let coords = {x: verticalNeighbor?.x ?? currentCoords.x, y: horizontalNeighbor?.y ?? currentCoords.y}
    if (event.shiftKey) {
      let ratio = Math.abs(data.selectedPoint.x - coords.x) / Math.abs(data.selectedPoint.y - coords.y)
      if (ratio > 1) { // horizontal
        coords = {x: coords.x, y: data.selectedPiece.points.slice(-1)[0].y}
      } else { //vertical
        coords = {x: data.selectedPiece.points.slice(-1)[0].x, y: coords.y}
      }
    }
    let activeLine = SVG()
    .line([data.selectedPiece.points.slice(-1)[0].x, data.selectedPiece.points.slice(-1)[0].y, coords.x + 5, coords.y + 5])
    .addClass('activeLine')
    .addClass('rhapsew-element')
    .stroke("red")
    
    draw.add(activeLine)
    
    if (verticalNeighbor) {
      let sparkGuide = SVG().line([currentCoords.x, -1500, verticalNeighbor.x, 1500]).addClass('spark-guide').addClass('rhapsew-element').stroke({color: "hsl(180, 100%, 50%)"})
      draw.add(sparkGuide)
    }
    if (horizontalNeighbor) {
      let sparkGuide = SVG().line([-1500, currentCoords.y, 1500, horizontalNeighbor.y]).addClass('spark-guide').addClass('rhapsew-element').stroke({color: "hsl(180, 100%, 50%)"})
      draw.add(sparkGuide)
    }
  }
  
  if (data.selectedPoint && data.moving) {
    let id = data.selectedPoint.id
    data.selectedPiece.points = data.selectedPiece.points.map(point => {
      if (point.id == id) {
        point.x = verticalNeighbor?.x ?? currentCoords.x
        point.y = horizontalNeighbor?.y ?? currentCoords.y
        draw.find('.spark-guide').forEach(element => element.remove())
        
        if (verticalNeighbor) {
          let sparkGuide = SVG().line([currentCoords.x, -1500, verticalNeighbor.x, 1500]).addClass('spark-guide').addClass('rhapsew-element').stroke({color: "hsl(180, 100%, 50%)"})
          draw.add(sparkGuide)
        }
        if (horizontalNeighbor) {
          let sparkGuide = SVG().line([-1500, currentCoords.y, 1500, horizontalNeighbor.y]).addClass('spark-guide').addClass('rhapsew-element').stroke({color: "hsl(180, 100%, 50%)"})
          draw.add(sparkGuide)
        } 
      }
      return point
    })
  }
  
  if (event.ctrlKey && data.selectedPoint) {
    // data.selectedPiece.points
    /* 
    * How do you wanna do this?
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
    
    /**
    * Okay, so
    * := insert a new control point after the current point
    * := set the points array in the filtered piece
    * := assign the new point to/as selected
    * := set the x y of the old point to its old position
    */
    
    let currentPiece = data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0]
    let currentPoint = currentPiece.points.filter(point => point.id == data.selectedPoint.id)[0]
    let pointIndex = data.selectedPiece.points.indexOf(currentPoint) // returns -1 if not present!!
    
    let previousSegment = PieceOps.findPreviousSegment({data, point: currentPoint})
    let previousSegmentIndex = data.selectedPiece.points.indexOf(previousSegment)
    
    const previousPositionPoint = (HistoryManager.previous() as State)
    .selectedPiece
    .points
    .filter(point => point.id == currentPoint.id)[0];
    
    const coords = {x: previousPositionPoint?.x, y: previousPositionPoint?.y}
    
    if (currentPoint.type == "anchor") {
      
      // range.length /* 1 or 2 */ 
      let range = data.selectedPiece.points.slice(previousSegmentIndex, pointIndex)
      
      const after = data.selectedPiece.points.slice(pointIndex + 1)
      
      // data.selectedPoint = {...data.selectedPoint, x: coords.x, y: coords.y}
      currentPoint.x = coords.x
      currentPoint.y = coords.y
      currentPiece.points.filter(point => point.id == currentPoint.id)[0] = {...currentPoint, x: coords.x, y: coords.y}
      
      let newPoint = PieceOps.addPoint({event, data, type: "control", pieceId: currentPiece.id, parent: currentPoint})
      let newPairedControlPoint = PieceOps.addPoint({event, data, type: "control", pieceId: currentPiece.id, parent: currentPoint, pairId: newPoint.id})
      newPoint.pairId = newPairedControlPoint.id
      
      const before = currentPiece.points.slice(0, pointIndex)
      
      switch (range.length) {
        case 3: {// C
          const finalPointsArray = [...before, newPairedControlPoint, currentPoint, newPoint, ...after]
          currentPiece.points = finalPointsArray
          currentPiece.points.filter(point => point.id == currentPoint.id)[0].x = coords.x
          currentPiece.points.filter(point => point.id == currentPoint.id)[0].y = coords.y
          
          data.selectedPiece = currentPiece
          data.selectedPoint = currentPiece.points[data.selectedPiece.points.indexOf(newPoint)]
          break
        }
        case 2: {// S <- this is the case that hasn't been built yet ^_^
          const finalPointsArray = [...before, newPairedControlPoint, currentPoint, newPoint, ...after]
          currentPiece.points = finalPointsArray
          currentPiece.points.filter(point => point.id == currentPoint.id)[0].x = coords.x
          currentPiece.points.filter(point => point.id == currentPoint.id)[0].y = coords.y
          
          data.selectedPiece = currentPiece
          data.selectedPoint = currentPiece.points[data.selectedPiece.points.indexOf(newPoint)]
          break
        }
        case 1: {// L
          // insert new control point with current segment as parent segment after current point
          // const before = data.selectedPiece.points.slice(previousSegmentIndex, previousSegmentIndex + 1)
          const finalPointsArray = [...before, newPairedControlPoint, currentPoint, newPoint, ...after]
          currentPiece.points = finalPointsArray
          currentPiece.points.filter(point => point.id == currentPoint.id)[0].x = coords.x
          currentPiece.points.filter(point => point.id == currentPoint.id)[0].y = coords.y
          
          data.selectedPiece = currentPiece
          data.selectedPoint = currentPiece.points[data.selectedPiece.points.indexOf(newPoint)]
          
          break
        }
        case 0: {// M
          // insert new control point after current point
          const finalPointsArray = [...before, currentPoint, newPoint, ...after, newPairedControlPoint]
          currentPiece.points = finalPointsArray
          currentPiece.points.filter(point => point.id == currentPoint.id)[0].x = coords.x
          currentPiece.points.filter(point => point.id == currentPoint.id)[0].y = coords.y
          
          data.selectedPiece = currentPiece
          data.selectedPoint = currentPiece.points[data.selectedPiece.points.indexOf(newPoint)]
          break
        }
        default:
        break
      }
    } else { // "control"
      let pairedPoint = currentPiece.points.filter(point => point.pairId == currentPoint.id)[0]
      const distanceX = currentPoint.x - currentPoint.parent.x
      const distanceY = currentPoint.y - currentPoint.parent.y
      if (pairedPoint) {
        pairedPoint.x = currentPoint.parent.x - distanceX
        pairedPoint.y = currentPoint.parent.y - distanceY
      }
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
    .viewbox('0 0 100 1')
    .size('0in','0in')
    .panZoom({panning: false, zoomMin: 0.01, zoomMax: 20})
    .zoom(1)
    
    draw.on('zoom', (event) => {
      // console.log(event)
      // data.zoom = event.detail.level
      // draw.fire('rhapsewZoom', event)
      window.dispatchEvent(new CustomEvent('rhapsewZoom', event))
      
    })
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