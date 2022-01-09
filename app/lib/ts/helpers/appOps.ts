import { SVG } from '@svgdotjs/svg.js'
import * as PieceOps from '$lib/ts/helpers/pieceOps'
// import type { State } from 'app/lib/global'
import type { Element } from '@svgdotjs/svg.js'

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
          const newPoint = PieceOps.addPoint({...args, index: data.selectedPiece.points.length, pieceId: data.selectedPiece.id})
          // points = [...data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points, newPoint]
          points = [...data.selectedPiece.points, newPoint]
          // data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0].points = points
          // data.selectedPiece = data.pieces.filter(piece => piece.id == data.selectedPiece.id)[0]
          data.selectedPiece.points = points
          data.selectedPoint = data.selectedPiece.points.slice(-1)[0].id
        }
        else {
          data.selectedPiece = null
          data.pieces.forEach(piece => {
            piece.points.forEach(point => point.active = false)
          })
          console.log("clicked")
        }
      } else {
        data.selectedPiece = null
        data.pieces.forEach(piece => {
          piece.points.forEach(point => point.active = false)
        })
      }
    }
  }
  
  if (event.target.classList.contains('anchor')) {
    let domPointId = event.target.getAttribute('data-id')
    let domPoint: Point = event.target.getAttribute('data-point')
    let pieceId: string = event.target.getAttribute('data-pieceId')
    
    // data.selectedPiece = data.pieces.filter(piece => piece.id == pieceId)[0]
    data.selectedPoint = domPointId
    console.info(`Rhapsew [Info]: Selected point: ${data?.selectedPoint}`)
    console.info(`Rhapsew [Info]: data.selectedPiece.id: ${data?.selectedPiece.id}`)
    console.info(`Rhapsew [Info]: data.selectedPiece.points[0].id: ${data?.selectedPiece.points[0].id}`)
    console.info(data.selectedPiece.points)
    
    if (domPointId == data.selectedPiece.points[0].id) {
      data.selectedPiece.closed = true
      console.info(`Rhapsew [Info]: Closing piece: ${data.selectedPiece.id}`)
    }
    
    draw.find('.activeLine').forEach(element => element.remove())
    
    data.selectedPiece.points.forEach(point => point.id == domPointId ? point.active = true : point.active = false)
  }
  
  return data
}

interface HandleMouseArgs {
  data: State
  event: MouseEvent
}

function handleMousedown (args:HandleMouseArgs):State {
  let data = args.data
  let event = args.event
  console.info(`Rhapsew [Info]: Mousedown`)
  console.log(data?.selectedPiece?.points)
  console.log(event)
  

  if (event.target.classList.contains(`anchor`)) {
    let id = event.target.getAttribute('data-id')
    let domPoint:Point = JSON.parse(event.target.getAttribute('data-point'))
    let pieceId: string = event.target.getAttribute('data-pieceId')
    
    console.info(`Rhapsew [Info]: Point selected: ${id}`)
    console.log("pieces", data.pieces)
    console.log("selected piece pre filter", data.selectedPiece)
    data.selectedPiece = data.pieces.filter(piece => piece.id == pieceId)[0]
    console.log("selected piece", data.selectedPiece)
    data.selectedPoint = id
    data.moving = true
    console.info(`Rhapsew [Info]: Piece selected: ${data.selectedPiece.id}`)
    console.log(data.selectedPiece.points)
  }
  return data  
}

function handleMouseup (args:HandleMouseArgs):State {
  let data = args.data
  let event = args.event
  
  data.moving = false
  return data  
}


function handleMove (args:HandleMoveArgs) {
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
    let id = data.selectedPoint
    data.selectedPiece.points = data.selectedPiece.points.map(point => {
      if (point.id == id) {
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
    draw = SVG()
    .addTo(args.parent)
    .addClass(`svg`)
    .addClass('rhapsew-element')

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
  , handleMove
  , init
  , initSVGCanvas
  , shallowCopy
  , toggleContextMenu
  , writeToStatus
}