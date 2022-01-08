import { SVG } from '@svgdotjs/svg.js'
import * as PieceOps from '$lib/ts/helpers/pieceOps'
// import type { State } from 'app/lib/global'
import type { Element } from '@svgdotjs/svg.js'

const TOPBARHEIGHT = 30



function exportSvg (args) {
  const data = args.data
  let draw = initSVGCanvas(data)
  let output = draw.svg((node:Element) => {
    if (node.hasClass('piece-wrangler') || node.hasClass('anchor')) {
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

function handleClick (args:HandleClickArgs) {
  let data= args.data
  let event= args.event
  const id = event.target.getAttribute('data-id') ?? null
  
  let draw = initSVGCanvas(data)
  
  // console.log(event)
  
  if (event.target.classList.contains('svg')) {
    switch (event.button) {
      case 2: // right-click
      data = toggleContextMenu({data, state:'on', x:event.clientX, y:event.clientY})
      draw.find('.activeLine').forEach(element => element.remove())
      try {
        // data.pieces.forEach(piece => {
        //   piece.points.forEach(point => {
        //     point.active = false
        //   })
        // })
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
        if (!data.selectedPiece.closed) {
          points = [...data.selectedPiece.points, PieceOps.addPoint({...args, index: data.selectedPiece.points.length, pieceId:data.selectedPiece.id})]
          data.selectedPiece.points = points
        }
        else {
          data.selectedPiece = null
          data.pieces.forEach(piece => {
            piece.points.forEach(point => point.active = false)
            // PieceOps.renderPiece({data, piece})
          })
        }
      } else {
        data.selectedPiece = null
        data.pieces.forEach(piece => {
          piece.points.forEach(point => point.active = false)
          // PieceOps.renderPiece({data, piece})
        })
      }
    }
  }
  
  if (event.target.classList.contains('anchor')) {
    let id = event.target.getAttribute('data-id')
    let domPoint: Point = event.target.getAttribute('data-point')
    let pieceId: string = event.target.getAttribute('data-pieceId')
    
    data.selectedPiece = data.pieces.filter(piece => piece.id == pieceId)[0]
    data.selectedPoint = id
    console.info(`Rhapsew [Info]: Selected Point: ${data.selectedPoint}`)
    
    if (id == data.selectedPiece.points[0].id) {
      data.selectedPiece.closed = true
    }
    
    draw.find('.activeLine').forEach(element => element.remove())
    
    data.selectedPiece.points.forEach(point => point.id == id ? point.active = true : point.active = false)
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
    let id = event.target.getAttribute('data-id')
    let domPoint:Point = JSON.parse(event.target.getAttribute('data-point'))
    let pieceId: string = event.target.getAttribute('data-pieceId')
    
    console.info(`Rhapsew [Info]: Point selected: ${id}`)
    data.selectedPiece = data.pieces.filter(piece => piece.id == pieceId)[0]
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
  
  if (data?.selectedPiece?.points?.slice(-1)?.[0]?.active && data.selectedPiece.closed == false) {
    draw.find('.activeLine').forEach(element => element.remove())
    let mousePoint = SVG(`svg`).point(event.clientX, event.clientY)
    let activeLine = SVG()
    .line([data.selectedPiece.points.slice(-1)[0].x, data.selectedPiece.points.slice(-1)[0].y, mousePoint.x + 5, mousePoint.y + 5])
    .addClass('activeLine')
    .stroke("red")
    
    draw.add(activeLine)
  }
  
  if (data.selectedPoint && data.moving) {
    let id = data.selectedPoint
    data.selectedPiece.points = data.selectedPiece.points.map(point => {
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
  exportSvg
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