import * as PieceOps from '$lib/ts/helpers/pieceOps'
import * as AppOps from '$lib/ts/helpers/appOps'

# let points = [] # this is one piece
# each piece is an array of Points
# let data

tag app-canvas
	# prop data
	def mount
		console.log "awakened"
		console.log data.parent
		AppOps.initSVGCanvas data
		
	# <self#canvas @click.prevent=(do points = points.concat (PieceOps.addPoint {parent: '#canvas', event:e, pieceId:12}); console.log points)
	<self#canvas @click.prevent=(do (data = AppOps.handleClick {event: e, data}))
	# @mousemove=(do AppOps.handleMove({points: data.pieces[0].points, event: e, parent: '#canvas'}))
	@mousemove=(do (data = AppOps.handleMove {data, event: e}))
	>
		<button @click.prevent=(do PieceOps.renderPiece {points: data.pieces[0].points})> "render"
		<button @mousemove=(do PieceOps.renderPiece {points: data.pieces[0].points})> "render"
# CSS

css #canvas h:100% flg:100
global css .svg h:100% w:100%

export default <app-canvas>