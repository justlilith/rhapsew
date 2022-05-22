import { G, Svg, SVG } from '@svgdotjs/svg.js'
import { Piece, Point } from '$lib/ts/classes'
import * as AppOps from '$lib/ts/helpers/appOps'
import * as Utilities from '$lib/ts/helpers/utilities'
import { nanoid } from 'nanoid'
// import * as History from '$lib/ts/helpers/HistoryManager'
import * as _ from 'lodash'



function addPiece(args: PieceArgs): State {
  let data: State = { ...args.data }
  let event = args.event

  console.info('Rhapsew [Info]: Adding a new piece')

  let newPiece: PieceT = { changed: true, points: [], name: "test", closed: false, id: nanoid(), mirrorLine: [], offset: null, mousedownSize: null, pathString: null, seamAllowance: 0 } // wait nvm
  newPiece.points[0] = addPoint({ data, event, pieceId: newPiece.id }) // trying this out
  data.pieces = data.pieces.concat(newPiece) // <- This works fine
  // data.selectedPiece = newPiece
  // data.selectedPiece = null


  data.selectedPiece = data.pieces.filter(piece => piece.id == newPiece.id)[0]
  // data.selectedPiece = data.pieces.slice(-1)[0]
  data.selectedPoint = data.selectedPiece.points[0]
  console.info(`Rhapsew [Info]: New piece added: ${data.selectedPiece.id}`)

  return data
}

function addPoint(args: AddPointArgs): PointT {
  const data = args.data
  const pieceId = args.pieceId
  const id = nanoid()
  const draw = AppOps.initSVGCanvas(args.data)
  const event = args.event
  const piece = data.pieces.filter(piece => piece.id == pieceId)[0]
  const parent = args.parent ?? null
  const type = args.type ?? "anchor"
  const coords = args.coords ?? SVG(`svg`).point(args.event.pageX, args.event.pageY)
  const pairId = args.pairId ?? null

  console.info(`Rhapsew [Info]: Adding a new point . . .`)

  const point = new Point({ ...coords, active: true, type, id, pieceId, parent, pairId })

  if (event.shiftKey) {
    let mousePoint = SVG(`svg`).point(event.clientX, event.clientY)
    let slack = 0.1
    let coords = { x: mousePoint.x, y: mousePoint.y }
    let ratio = Math.abs(data.selectedPoint.x - coords.x) / Math.abs(data.selectedPoint.y - coords.y)
    if (ratio > 1) { // horizontal
      point.y = piece.points.slice(-1)[0].y
    } else { //vertical
      point.x = piece.points.slice(-1)[0].x
    }
  }

  console.info(`Rhapsew [Info]: New point: ${point.id}`)

  return point
}

function findPreviousSegment(args: FindPreviousSegmentArgs): PointT {
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


function generateBoundingBox(args: GenerateBoundingBoxArgs): G {
  let data = args.data
  let renderedPiece = args.piece
  let id = args.pieceId
  const draw = AppOps.initSVGCanvas(data)

  if (data.selectedPiece && id == data.selectedPiece.id) {
    let handleWidth = 10
    let bbox = renderedPiece.bbox()
    let extents = Utilities.findExtents({ data, piece: renderedPiece })
    const boundingBox = SVG()
      .rect(bbox.w, bbox.h)
      .x(extents.x)
      .y(extents.y)
      .stroke({
        color: 'white',
        width: 1
      })
      .fill('none')
      .data('bounding-box-id', id)
      .addClass('bounding-box')
      .addClass('rhapsew-element')

    let handleBottomRight = SVG()
      .rect(handleWidth, handleWidth)
      .x(extents.x + extents.width - (handleWidth / 2))
      .y(extents.y + extents.height - (handleWidth / 2))
      .stroke({
        color: 'white',
        width: 1
      })
      .fill('white')
      .data('bounding-box-id', id)
      .addClass('bounding-box-handle')
      .addClass('rhapsew-element')
    // .on('click', e => console.log(e))

    let handleBottomLeft = handleBottomRight
      .clone()
      .x(extents.x - (handleWidth / 2))
      .y(extents.y + extents.height - (handleWidth / 2))

    let handleTopLeft = handleBottomRight
      .clone()
      .x(extents.x - (handleWidth / 2))
      .y(extents.y - (handleWidth / 2))

    let handleTopRight = handleBottomRight
      .clone()
      .x(extents.x + extents.width - (handleWidth / 2))
      .y(extents.y - (handleWidth / 2))

    let marginBottomRight = SVG()
      .rect(handleWidth * 2, handleWidth * 2)
      // .stroke({
      //   color: 'white',
      //   width: 1
      // })
      .fill('hsla(0,0%,0%,0.0)')
      .x(extents.x + extents.width - (handleWidth * 2 / 2))
      .y(extents.y + extents.height - (handleWidth * 2 / 2))
      .data('bounding-box-id', id)
      .addClass('bounding-box-handle')
      .addClass('rhapsew-element')

    let marginBottomLeft = marginBottomRight
      .clone()
      .x(extents.x - (handleWidth * 2 / 2))
      .y(extents.y + extents.height - (handleWidth * 2 / 2))

    let marginTopLeft = marginBottomRight
      .clone()
      .x(extents.x - (handleWidth * 2 / 2))
      .y(extents.y - (handleWidth * 2 / 2))

    let marginTopRight = marginBottomRight
      .clone()
      .x(extents.x + extents.width - (handleWidth * 2 / 2))
      .y(extents.y - (handleWidth * 2 / 2))

    renderedPiece.add(boundingBox)
    renderedPiece.add(handleBottomRight)
    renderedPiece.add(handleBottomLeft)
    renderedPiece.add(handleTopLeft)
    renderedPiece.add(handleTopRight)
    renderedPiece.add(marginBottomRight)
    renderedPiece.add(marginBottomLeft)
    renderedPiece.add(marginTopLeft)
    renderedPiece.add(marginTopRight)
  }

  return renderedPiece
}


function generatePiece(args: GeneratePieceArgs): G {
  let data = args.data
  let piece = args.piece
  let mirrored = args.mirrored
  const draw = AppOps.initSVGCanvas(data)
  let renderedPiece: G = SVG().group()

  draw.find(`[data-piece-id="${piece.id}"]`).forEach(el => el.remove())
  renderedPiece.data('piece-id', piece.id)
  renderedPiece.addClass('rhapsew-piece')

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
      } else if (point1?.type == 'control' && point2?.type == 'control' && piece.closed) {
        pathString += ` C ${point1.x} ${point1.y} ${point2.x} ${point2.y} ${pointPieceOrigin.x} ${pointPieceOrigin.y}`
        // C
      } else if (point2 && point1?.type == 'control' && (point2?.type == 'anchor' || !point3)) {
        pathString += ` S ${point1.x} ${point1.y} ${point2.x} ${point2.y}`
        // S
      } else if (point1?.type == 'control' && piece.closed) {
        pathString += ` S ${point1.x} ${point1.y} ${pointPieceOrigin.x} ${pointPieceOrigin.y}`
        // S
      } else if (point1 && (point1?.type == "anchor" || !point2)) {
        pathString += ` L ${point1.x} ${point1.y}`
        // L
      } else if (piece.closed) {
        pathString += ` L ${pointPieceOrigin.x} ${pointPieceOrigin.y}`
        piece.pathString = pathString
        // L
      }
    }

    const segment = SVG()
      .path(pathString)
      .data("piece", piece)
      .data("point-id", point.id)
      .data("starting-point", point.id)
      .attr({ x: point.x, y: point.y, fill: "none" })
      .stroke({ color: "hsl(180, 100%, 50%)", width: 2 * (1 / data.zoom) })
      .addClass('segment')
      .addClass('rhapsew-element')

    const segmentWrangler = SVG()
      .path(pathString)
      .data("piece", piece)
      .data("point-id", point.id)
      .data("starting-point", point.id)
      .attr({ x: point.x, y: point.y, fill: "none" })
      .stroke({ color: "hsla(0, 0%, 0%, 0.1)", width: 10 * (1 / data.zoom) })
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
      .on('mouseover', (event: MouseEvent) => {
        let mousePoint = SVG(`svg`).point(event.clientX, event.clientY)
        let suffix = data.units == "imperial" ? "in" : "cm"
        let length = (segment.length() / data.dpi).toPrecision(5).toString() + suffix

        let text = SVG()
          .text(length)
          .attr({ x: mousePoint.x + 20, y: mousePoint.y + 25 })
          .font({
            family: 'sans-serif'
            , size: 12
            , anchor: 'left'
          })
          .addClass('hover-measure')
          .addClass('rhapsew-element')

        draw.find(`.hover-measure`).forEach(el => el.remove())
        draw.add(text)
      })
      .on('mouseout', (event) => {
        draw.find('.hover-measure').forEach(element => element.remove())
      })
      
      // const suffix = data.units == "imperial" ? "in" : "cm"
      // const length = (segment.length() / data.dpi).toPrecision(5).toString() + suffix

      // let annotation = SVG()
      //   .text(length)
      //   .attr({ x: segment.pointAt(segment.length()/2).x, y: segment.pointAt(segment.length()/2).y })
      //   .font({
      //     family: 'sans-serif'
      //     , size: 12
      //     , anchor: 'left'
      //   })
      //   .addClass('hover-measure')
      //   .addClass('rhapsew-element')

    if (point.type == 'control') { // C, S
      let parent = data.pieces.filter(p => p.id == piece.id)[0].points.filter(p => p.id == point.parent.id)[0]
      draw.find(`[data-control-line-id="${point.id}"]`) ? draw.find(`[data-control-line-id="${point.id}"]`).forEach(line => line.remove()) : null
      let controlPath = [point.x, point.y, parent.x, parent.y]

      let controlLine = SVG()
        .line(controlPath)
        .stroke('hsla(240, 100%, 50%, 0.5)')
        .data("parent-id", point.parent.id)
        .data("control-line-id", point.id)
        .addClass('control-line')
        .addClass('rhapsew-element')

      draw.add(controlLine)
    }

    const domSegment = draw.find(`[data-point-id = "${point.id}"`)?.[0]
    if (domSegment) {
      if (!_.isEqual(AppOps.shallowCopy(domSegment.data("piece")), AppOps.shallowCopy(piece))) {
        console.info(`Rhapsew [Info]: Rerendering piece: ${piece.id}`)
        draw.find('.rhapsew-element').forEach(element => element.remove())
        renderedPiece.add(segmentWrangler)
        renderedPiece.add(segment)
        if (data.alwaysShowPathLengths ) {
          // renderedPiece.add(annotation)
        }
      }
    } else {
      renderedPiece.add(segmentWrangler)
      renderedPiece.add(segment)
      if (data.alwaysShowPathLengths ) {
        // renderedPiece.add(annotation)
      }
    }
  })

  return renderedPiece
}


function generateSeamAllowance(args) {
  let data = args.data
  let piece = args.piece
  
  const draw = AppOps.initSVGCanvas(data)
  let renderedPiece = draw.find(`g[data-piece-id=${piece.id}]`)[0]

  if (piece.seamAllowance != 0) {
    let offset = SVG().path(piece.pathString)

    offset
      .data("piece", piece)
      .attr({ fill: "none" })
      .stroke({ color: "hsl(80, 100%, 50%)", width: piece.seamAllowance })
      .addClass('seam-allowance')
      .addClass('rhapsew-element')

    let maskData = offset
      .clone()
      .stroke({ color: "hsl(30, 100%, 0%)", width: piece.seamAllowance - 2 })
      .fill('black')
    let mask = SVG().mask().add(maskData)
    offset.maskWith(mask)

    renderedPiece.add(offset)
  }
}


function renderPiece(args: RenderPieceArgs): void {
  let data = args.data
  let piece = args.piece
  const draw = AppOps.initSVGCanvas(data)

  data = setMirrorLine({ data, piece })

  console.info(`Rhapsew [Info]: Rerendering!`)

  let renderedPiece = generatePiece({ data, piece })

  if (piece.mirrorLine?.[0] && piece.mirrorLine?.[1]) {
    const rotateValue = Utilities.findAngle({ mode: 'horizontal', point1: piece.mirrorLine[0], point2: piece.mirrorLine[1] })
    const mirroredPiece = renderedPiece.clone().transform({
      flip: 'x'
      , origin: { x: piece.mirrorLine[0].x, y: piece.mirrorLine[0].y }
      , rotate: rotateValue * -2
    })
    renderedPiece.add(mirroredPiece)
  }

  renderedPiece = generateBoundingBox({ data, piece: renderedPiece, pieceId: piece.id })

  draw.add(renderedPiece)

  if (piece.mirrorLine?.[0] && piece.mirrorLine?.[1]) {
    const point1 = piece.mirrorLine[0]
    const point2 = piece.mirrorLine[1]
    const line = draw.find(`[data-mirror-line-id="${piece.id}"]`)[0]
    line ? line.remove() : null
    let mirrorPath = [point1.x, point1.y, point2.x, point2.y]
    let mirrorLine = SVG()
      .line(mirrorPath)
      .stroke({ color: 'hsla(30, 100%, 50%, 0.5)', width: 2 * (1 / data.zoom) })
      .data("mirror-line-id", piece.id)
      .addClass('mirror-line')
      .addClass('rhapsew-element')

    draw.add(mirrorLine)
  }

  piece.points.forEach(point => {
    renderPoint({ id: point.id, data, point, piece, renderedPiece })
  })

  generateSeamAllowance({data, piece})

  piece.changed = false
}


function renderPoint(args: RenderPointArgs): void {
  let data = args.data
  let id = args.id
  let point = args.point
  let pieceId = args.piece.id
  let renderedPiece = args.renderedPiece
  const draw = AppOps.initSVGCanvas(data)

  const domPoint = draw.find(`[data-id = "${point.id}"]`)[0]

  // console.info(`Rhapsew [Info]: Purging DOM point: ${id}`)
  draw.find(`[data-id = "${id}"]`).forEach(element => element.remove())
  // draw.find(`.selection-box`).forEach(element => element.remove())

  const renderedPoint = SVG()
    .circle()
    .attr({ fill: 'black', cx: point.x, cy: point.y })
    .stroke({ color: "hsla(0,0%,0%,0)", width: 15 })
    .size(7 * (1 / data.zoom))
    .data('id', id)
    .data('point', point)
    .data('pieceId', pieceId)
    .addClass('anchor')
    .addClass('rhapsew-element')

  renderedPiece.add(renderedPoint)
  const domSelectionBox = draw.find(`.selection-box`)[0]

  const selectionBox = SVG()
    .rect()
    .attr({ fill: "none", width: 20, height: 20, x: point.x - 10, y: point.y - 10 })
    .stroke({ color: "hsla(0,0%,0%,0.5)", width: 2 })
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

function setMirrorLine(args: SetMirrorLineArgs) {
  let data: State = args.data
  let event: Event = args.event
  let piece = args.piece
  const resetPoint = args.resetPoint ?? null
  const clear = args.clear ?? false

  if ((piece.mirrorLine?.[0] == null || piece.mirrorLine?.[1] != null) && resetPoint) {
    data.pieces.filter(p => p.id == piece.id)[0].mirrorLine = [resetPoint, null]
  }
  else if (piece.mirrorLine[0] && resetPoint) {
    data.pieces.filter(p => p.id == piece.id)[0].mirrorLine = [piece.mirrorLine[0], resetPoint]
  }
  if (piece.mirrorLine[0] && piece.mirrorLine[1]) {
    piece.mirrorLine = [
      data.pieces.filter(p => p.id == piece.id)[0].points.filter(p => p.id == piece.mirrorLine[0].id)[0]
      , data.pieces.filter(p => p.id == piece.id)[0].points.filter(p => p.id == piece.mirrorLine[1].id)[0]
    ]
  }
  if (clear) {
    piece.mirrorLine = []
    const draw = AppOps.initSVGCanvas(data)
    draw.find(`[data-mirror-line-id="${piece.id}"]`)
      .forEach(el => el.remove())
  }

  piece.changed = true
  return data
}


function wipe(data: State) {
  const draw = AppOps.initSVGCanvas(data)
  draw.find('.rhapsew-element').forEach(element => element.remove())
  // Utilities.saveToStorage({})
}


export {
  addPiece
  , addPoint
  , findPreviousSegment
  , renderPiece
  , renderPoint
  , setMirrorLine
  , wipe
}