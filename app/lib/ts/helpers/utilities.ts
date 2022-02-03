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

export {
  findAngle
}