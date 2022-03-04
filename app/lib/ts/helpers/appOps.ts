import { SVG } from '@svgdotjs/svg.js'
import * as PieceOps from '$lib/ts/helpers/pieceOps'
// import type { State } from 'app/lib/global'
import type { Element } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.panzoom.js'
import { Point } from '../classes'
import * as HistoryManager from '$lib/ts/helpers/HistoryManager'

const TOPBARHEIGHT = 30



function clearScreen(args): State {
  let data: State = args.data

  let draw = initSVGCanvas(data)

  data.selectedPiece = null
  data.selectedPoint = null
  data.pieces = []

  draw.clear()
  return data
}

function exportSvg(args) {
  const data = args.data
  let draw = initSVGCanvas(data)
  let output = draw.svg((node: Element) => {
    if (node.hasClass('segment-wrangler') || node.hasClass('anchor') || node.hasClass('selection-box')) {
      return false
    }
    if (node.hasClass('piece')) {
      node.attr({ stroke: "black" })
    }
  })
  let svgPacket = { name: "" }
  // notify('downloading chat! c:', 1000)
  svgPacket.name = "Rhapsew — Document"
  const date = new Date()
  const filenameFinal = `${svgPacket.name} (from ${date.toDateString()}).svg`
  const file = new File([output], filenameFinal, {
    type: 'text/svg'
  })
  const download = document.createElement('a')
  download.setAttribute('id', file.name)
  download.setAttribute('download', filenameFinal)
  const link = URL.createObjectURL(file)
  download.setAttribute('href', link)
  document.body.append(download)
  download.click()
  download.onload = () => { URL.revokeObjectURL(link) }
  document.body.removeChild(download)
}

function handleClick(args: HandleClickArgs): { data: State, changed: boolean } {
  let data = args.data
  let event = args.event
  let changed = false
  const id = event.target.getAttribute('data-id') ?? null
  const type = (JSON.parse(event.target.getAttribute('data-point')) as PointT)?.type ?? null
  const point = (JSON.parse(event.target.getAttribute('data-point')) as PointT) ?? null

  let draw = initSVGCanvas(data)

  if (event.ctrlKey && type == 'control') {
    data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points = data.selectedPiece.points.filter(point => point.id != id)
    data.selectedPiece.points = data.selectedPiece.points.filter(point => point.id != id)
    changed = true
  }

  return { data, changed }
}


function handleMousedown(args: HandleMouseArgs): State {
  let data = args.data
  let event = args.event
  let draw = initSVGCanvas(data)
  let currentCoords = draw.point(event.clientX, event.clientY)
  let classesAtPoint = document
  .elementsFromPoint(event.clientX, event.clientY)
  .map(el=> el.classList.toString().split(" "))
  .flat()
  .filter(str => str != "")

  console.info(`Rhapsew [Info]: Mousedown`)
  // console.info(classesAtPoint)
  data.mousedown = true
  data.lockScale = true

  if (event.target.classList.contains(`anchor`)) {
    switch (event.button) {
      case 2: {
        data.anchorClicked = false
        data.canvasClicked = true
        data = toggleContextMenu({ data, state: 'on', x: event.clientX, y: event.clientY })
        draw.find('.activeLine').forEach(element => element.remove())
        let pieceId: string = event.target.getAttribute('data-pieceId')
        let point: PointT = JSON.parse(event.target.getAttribute('data-point'))
        data.selectedPiece = data.pieces.filter(piece => piece.id == pieceId)[0]
        data.selectedPoint = data.pieces.filter(piece => piece.id == pieceId)[0].points.filter(p => p.id == point.id)[0]
        break
      }
      case 0:
      default: {
        data.anchorClicked = true
        data.canvasClicked = false
        data = toggleContextMenu({ data, state: 'off', x: event.clientX, y: event.clientY })
        draw.find('.activeLine').forEach(element => element.remove())

        let domPoint: PointT = JSON.parse(event.target.getAttribute('data-point'))
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
    }
  }

  // console.log(event.target.classList)

  if (classesAtPoint.includes('bounding-box-handle') && data.currentTool == "piece") {
    console.log('handle!')
    data.resizing = true
    data.moving = false
    data.pieceMoving = false
    data.mousedownCoords = currentCoords
    const domPiece = draw.find(`[data-piece-id="${data.selectedPiece.id}"]`)[0]
    data.pieces.filter(p => p.id == data.selectedPiece.id)[0].mousedownSize = { width: parseFloat(domPiece.width().toString()), height: parseFloat(domPiece.height().toString()), x: parseFloat(domPiece.x().toString()), y: parseFloat(domPiece.y().toString()) }
    data.pieces.filter(p => p.id == data.selectedPiece.id)[0].points.forEach(point => {
      let offset = {
        x: point.x - currentCoords.x
        , y: point.y - currentCoords.y
      }
      point.offset = offset
      point.mousedownCoords = { x: point.x, y: point.y }
    })
  }

  if (event.target.classList.contains('segment') || event.target.classList.contains('segment-wrangler')) {
    const pointId = event.target.getAttribute('data-point-id')
    console.log('here!')
    console.log(event.target)
    console.log(event.target.getAttribute('data-point-id'))
    let domSegment = draw.find(`[data-starting-point-id="${pointId}"]`)[0]
    let newPoint = PieceOps.addPoint({
      event
      , data
      , pieceId: data.selectedPiece.id
      , coords: { x: currentCoords.x, y: currentCoords.y }
    })
    const previous = data.selectedPiece.points.slice(0, data.selectedPiece.points.indexOf(data.selectedPiece.points.filter(point => point.id == pointId)[0]) + 1)
    const after = data.selectedPiece.points.slice(data.selectedPiece.points.indexOf(data.selectedPiece.points.filter(point => point.id == pointId)[0]) + 1, data.selectedPiece.points.length + 1)
    data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points = [...previous, newPoint, ...after]
    data.selectedPoint = data.selectedPiece.points.filter(point => point.id == newPoint.id)[0]
  }

  if (event.target.classList.contains('svg') || event.target.classList.contains('spark-guide')) {
    data.canvasClicked = true
    data.anchorClicked = false
    switch (event.button) {
      case 2: // right-click
        data = toggleContextMenu({ data, state: 'on', x: event.clientX, y: event.clientY })
        draw.find('.activeLine').forEach(element => element.remove())
        break
      case 0:
      default: // left-click
        // this area right here, officer
        data = toggleContextMenu({ data, state: 'off' })
        let points = []
        // data.selectedPoint = null
        // data.selectedPiece = null
        let domPiece = draw.find(`.rhapsew-piece`)
        domPiece.forEach(dp => {
          if (dp.inside(currentCoords.x, currentCoords.y)) {
            data.selectedPiece = data.pieces.filter(piece => piece.id == dp.data('piece-id'))[0]
            data.pieceMoving = true
            data.selectedPiece.points.forEach(point => {
              let offset = {
                x: point.x - currentCoords.x
                , y: point.y - currentCoords.y
              }
              point.offset = offset
            })
          }
        })

        if (data.selectedPiece) {
          if (data.selectedPiece.closed == false) { // piece is open
            const newPoint = PieceOps.addPoint({ ...args, pieceId: data.selectedPiece.id })
            // points = [...data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points, newPoint]
            points = [...data.selectedPiece.points, newPoint]
            // data.selectedPiece = data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0]
            // no circular references — update both
            data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points = points
            data.selectedPiece.points = points
            data.selectedPoint = data.selectedPiece.points.slice(-1)[0]
          }
          else { // piece is closed
            data.selectedPiece = null
            data.selectedPoint = null
            let domPiece = draw.find(`.rhapsew-piece`)
            domPiece.forEach(dp => {
              if (dp.inside(currentCoords.x, currentCoords.y)) {
                data.selectedPiece = data.pieces.filter(piece => piece.id == dp.data('piece-id'))[0]
              }
            })
            data.pieces.forEach(piece => {
              piece.points.forEach(point => point.active = false)
            })
          }
        } else {
          data.selectedPiece = null
          data.selectedPoint = null
          data.pieceMoving = false
          data.pieces.forEach(piece => {
            piece.points.forEach(point => point.active = false)
          })
        }
    }
  }

  return data
}


function handleMousemove(args: HandleMoveArgs) {
  let data = args.data
  let event = args.event
  let piece = data.pieces.filter(p => p.id == data?.selectedPiece?.id)[0] ?? null
  let draw = initSVGCanvas(data)

  const slack = 5
  const currentCoords = SVG(`svg`).point(event.clientX, event.clientY)
  const allPoints = data.pieces.map(piece => piece.points).flat()
  const verticalNeighbor = allPoints.filter(point => point.x + slack >= currentCoords.x && point.x - slack <= currentCoords.x && point.id != data.selectedPoint?.id)[0]
  const horizontalNeighbor = allPoints.filter(point => point.y + slack >= currentCoords.y && point.y - slack <= currentCoords.y && point.id != data.selectedPoint?.id)[0]

  draw.find('.spark-guide').forEach(element => element.remove())

  if (!data.contextMenu && data?.selectedPiece?.points?.slice(-1)?.[0]?.active && data.selectedPiece.closed == false) {
    draw.find('.activeLine').forEach(element => element.remove())
    draw.find('.spark-guide').forEach(element => element.remove())

    let coords = { x: verticalNeighbor?.x ?? currentCoords.x, y: horizontalNeighbor?.y ?? currentCoords.y }
    if (event.shiftKey) {
      let ratio = Math.abs(data.selectedPoint.x - coords.x) / Math.abs(data.selectedPoint.y - coords.y)
      if (ratio > 1) { // horizontal
        coords = { x: coords.x, y: data.selectedPiece.points.slice(-1)[0].y }
      } else { //vertical
        coords = { x: data.selectedPiece.points.slice(-1)[0].x, y: coords.y }
      }
    }
    let activeLine = SVG()
      .line([data.selectedPiece.points.slice(-1)[0].x, data.selectedPiece.points.slice(-1)[0].y, coords.x + 5, coords.y + 5])
      .addClass('activeLine')
      .addClass('rhapsew-element')
      .stroke("red")

    draw.add(activeLine)

    if (verticalNeighbor) {
      let sparkGuide = SVG().line([verticalNeighbor.x, -1500, verticalNeighbor.x, 1500]).addClass('spark-guide').addClass('rhapsew-element').stroke({ color: "hsl(180, 100%, 50%)" })
      draw.add(sparkGuide)
    }
    if (horizontalNeighbor) {
      let sparkGuide = SVG().line([-1500, horizontalNeighbor.y, 1500, horizontalNeighbor.y]).addClass('spark-guide').addClass('rhapsew-element').stroke({ color: "hsl(180, 100%, 50%)" })
      draw.add(sparkGuide)
    }
  }

  if (data.resizing && data.selectedPiece) {
    console.info(`Rhapsew [Info]: Resizing!`)
    let domPiece = draw.find(`[data-piece-id="${data.selectedPiece.id}"]`)[0]
    const currentWidth = currentCoords.x - parseFloat(domPiece.x().toString())
    const currentHeight = currentCoords.y - parseFloat(domPiece.y().toString())
    const domPieceCenter = { x: parseFloat(domPiece.width().toString()) / 2, y: parseFloat(domPiece.height().toString()) / 2 }
    const pieceCenter = { x: (piece.mousedownSize.width / 2) + piece.mousedownSize.x, y: (piece.mousedownSize.height / 2) + piece.mousedownSize.y }
    let quadrant = [(pieceCenter.x > data.mousedownCoords.x) ? 0 : 1, (pieceCenter.y > data.mousedownCoords.y) ? 0 : 1]
    let pieceDidGrow = {
      x: (quadrant[0] == 0) ? pieceCenter.x - data.mousedownCoords.x < pieceCenter.x - currentCoords.x : data.mousedownCoords.x + pieceCenter.x < currentCoords.x + pieceCenter.x,
      y: (quadrant[1] == 0) ? pieceCenter.y - data.mousedownCoords.y < pieceCenter.y - currentCoords.y : data.mousedownCoords.y + pieceCenter.y < currentCoords.y + pieceCenter.y
    }
    let dX = Math.abs(data.mousedownCoords.x - currentCoords.x) * (pieceDidGrow.x ? 1 : -1) * 2
    let dY = Math.abs(data.mousedownCoords.y - currentCoords.y) * (pieceDidGrow.y ? 1 : -1) * 2

    // 0.5, 1.0, 1.5, etc
    let scaleX = (piece.mousedownSize.width + dX) / piece.mousedownSize.width
    let scaleY = (piece.mousedownSize.height + dY) / piece.mousedownSize.height

    let currentPiece = data.pieces.filter(p => p.id == data.selectedPiece.id)[0]

    if (data.lockScale) {
      currentPiece.points.forEach(p => {
        p.x = (scaleX * (p.mousedownCoords.x - pieceCenter.x)) + pieceCenter.x
        p.y = (scaleX * (p.mousedownCoords.y - pieceCenter.y)) + pieceCenter.y
      })
    } else {
      currentPiece.points.forEach(p => {
        p.x = (scaleX * (p.mousedownCoords.x - pieceCenter.x)) + pieceCenter.x
        p.y = (scaleY * (p.mousedownCoords.y - pieceCenter.y)) + pieceCenter.y
      })
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
          let sparkGuide = SVG().line([currentCoords.x, -1500, verticalNeighbor.x, 1500]).addClass('spark-guide').addClass('rhapsew-element').stroke({ color: "hsl(180, 100%, 50%)" })
          draw.add(sparkGuide)
        }
        if (horizontalNeighbor) {
          let sparkGuide = SVG().line([-1500, currentCoords.y, 1500, horizontalNeighbor.y]).addClass('spark-guide').addClass('rhapsew-element').stroke({ color: "hsl(180, 100%, 50%)" })
          draw.add(sparkGuide)
        }
      }
      return point
    })
  }

  if (data.pieceMoving) {
    let selectedPiece = draw.find(`[data-piece-id="${data.selectedPiece.id}"]`)[0]
    // selectedPiece.x(currentCoords.x + data.selectedPiece.offset.x)
    // selectedPiece.y(currentCoords.y + data.selectedPiece.offset.y)
    data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points = data.selectedPiece.points.map(point => {
      point.x = point.offset.x + currentCoords.x
      point.y = point.offset.y + currentCoords.y
      return point
    })
  }

  if (event.ctrlKey && data.selectedPoint && event.button == 0 && data.anchorClicked) {
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

    let previousSegment = PieceOps.findPreviousSegment({ data, point: currentPoint })
    let previousSegmentIndex = data.selectedPiece.points.indexOf(previousSegment)

    const previousPositionPoint = (HistoryManager.previous() as State ?? data)
      .selectedPiece
      .points
      .filter(point => point.id == currentPoint?.id)[0];

    const coords = { x: previousPositionPoint?.x, y: previousPositionPoint?.y }

    if (currentPoint.type == "anchor") {

      // range.length /* 1 or 2 */ 
      let range = data.selectedPiece.points.slice(previousSegmentIndex, pointIndex)

      const after = data.selectedPiece.points.slice(pointIndex + 1)

      // data.selectedPoint = {...data.selectedPoint, x: coords.x, y: coords.y}
      currentPoint.x = coords.x
      currentPoint.y = coords.y
      currentPiece.points.filter(point => point.id == currentPoint.id)[0] = { ...currentPoint, x: coords.x, y: coords.y }

      let newPoint = PieceOps.addPoint({ event, data, type: "control", pieceId: currentPiece.id, parent: currentPoint })
      let newPairedControlPoint = PieceOps.addPoint({ event, data, type: "control", pieceId: currentPiece.id, parent: currentPoint, pairId: newPoint.id })
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

  if (data.panning && data.mousedown && event.buttons == 1) {
    pan({ currentCoords: { x: event.clientX, y: event.clientY }, data })
    // data.panning = false
  }

  data.currentCoords = { x: event.clientX, y: event.clientY }
  return data
}


function handleMouseup(args: HandleMouseArgs): State {
  let data = args.data
  let event = args.event
  let draw = initSVGCanvas(data)

  draw.find('.spark-guide').forEach(element => element.remove())
  draw.find(`.bounding-box`).forEach(el => {
    if (el.data('bounding-box-id') != data?.selectedPiece?.id) {
      el.remove()
    }
  })

  data.moving = false
  data.mousedown = false
  data.pieceMoving = false
  data.resizing = false
  return data
}


function init(data) {
  document.querySelector('#canvas').addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault()
    handleClick({ event: e, data })
  })
}

function initSVGCanvas(data: State): Element {
  let draw = SVG(`svg`)
  if (!draw) {
    draw = SVG()
      .addTo(data.parent)
      .addClass(`svg`)
      .addClass('rhapsew-element')
      .viewbox('0 0 100 1')
      // .size('100','100')
      .panZoom({ panning: false, zoomMin: 0.01, zoomMax: 20 })
      .zoom(1)
    // .animate()

    draw.on('zoom', (event) => {
      // console.log(event)
      // data.zoom = event.detail.level
      // draw.fire('rhapsewZoom', event)
      window.dispatchEvent(new CustomEvent('rhapsewZoom', event))

    })
  }
  return draw
}


function pan(args: PanArgs) {
  let data = args.data
  let currentCoords = args.currentCoords
  let draw = initSVGCanvas(args.data)
  let viewBox: string = draw.attr('viewBox')
  let viewBoxArray = viewBox.split(' ').map(coord => parseInt(coord))
  viewBoxArray[0] = viewBoxArray[0] + data.currentCoords.x - currentCoords.x
  viewBoxArray[1] = viewBoxArray[1] + data.currentCoords.y - currentCoords.y
  draw.attr('viewBox', viewBoxArray.join(' '))
}

function shallowCopy(arg) {
  return JSON.parse(JSON.stringify(arg))
}

function switchTools(args): State {
  let data = args.data
		switch (args.tool) {
			case "anchor":
				data.currentTool = "anchor"
				data.status = "Anchor"
				data.topMenu = null
				break
			case "piece":
				data.currentTool = "piece"
				data.status = "Piece"
				data.topMenu = null
				break
			case "annotate":
				data.currentTool = "annotate"
				data.status = "Annotate"
				data.topMenu = null
				break
    }
  return data
}

function toggleContextMenu(args) {
  switch (args.state) {
    case 'on':
      args.data.contextMenu = true
      args.data.menuX = args.x ?? 0
      args.data.menuY = args.y ?? 0
      break
    case 'off':
    default:
      args.data.contextMenu = false
  }
  return args.data
}

function writeToStatus() {

}

export {
  clearScreen
  , exportSvg
  , handleClick
  , handleMousedown
  , handleMousemove
  , handleMouseup
  , init
  , initSVGCanvas
  , pan
  , shallowCopy
  , switchTools
  , toggleContextMenu
  , writeToStatus
}