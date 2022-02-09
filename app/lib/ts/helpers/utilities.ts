import * as AppOps from '$lib/ts/helpers/appOps'
import type { G } from '@svgdotjs/svg.js'

let storage = window.localStorage


function fetchFromStorage(key: string) {
  let error = null
  let fetched = null
  try {
    fetched = JSON.parse(storage.getItem(key))
  } catch (e) {
    error = `Rhapsew [Info]: Unable to retrieve ${key} from localStorage. 🥺`
  }
  if (fetched == null) {
    error = `Rhapsew [Info]: Unable to retrieve ${key} from localStorage. 🥺`
  }
  return { error, fetched }
}

function findAngle(args: FindAngleArgs): number {
  const x1: number = args.point2.x - args.point1.x
  const y1: number = args.point2.y - args.point1.y
  const mode: string = args.mode
  let angle = 0

  switch (mode) {
    case 'horizontal': {
      angle = Math.atan2(x1, y1) * (180 / Math.PI)
      break
    }
    case 'vertical':
    default: {
      angle = Math.atan2(x1, y1) * (180 / Math.PI)
      console.log(angle)
      break
    }
  }
  return angle
}


function findExtents(args) {
  let data: State = args.data
  let piece: G = args.piece
  return {
    x: parseInt(piece.x().toString())
    , y: parseInt(piece.y().toString())
    , width: parseInt(piece.width().toString())
    , height: parseInt(piece.height().toString()) }
}


function saveToStorage(args) {
  let error = null
  let payload = JSON.stringify(args.value)
  try {
    storage.setItem(args.key, payload)
  } catch (e) {
    error = e
  }
  return { error }
}


export {
  fetchFromStorage
  , findAngle
  , findExtents
  , saveToStorage
}