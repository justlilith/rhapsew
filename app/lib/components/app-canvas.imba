import * as PieceOps from '$lib/ts/helpers/pieceOps'
import * as AppOps from '$lib/ts/helpers/appOps'
import context-menu from '$lib/components/context-menu'

# let points = [] # this is one piece
# each piece is an array of Points
# let data

tag app-canvas
	# prop data
	def mount
		console.log "awakened"
		console.log data.parent
		AppOps.init data
		AppOps.initSVGCanvas data
		setInterval(&,20) do # renderLoop
			unless data.pieces.length == 0
				data.pieces.forEach do(piece)
					PieceOps.renderPiece {data, piece}
					piece.points.forEach do(point)
						PieceOps.renderPoint {data, id: point.id, point}

		
	<self#canvas @click=(do (data = AppOps.handleClick {event: e, data}))
	# @mousemove=(do AppOps.handleMove({points: data.pieces[0].points, event: e, parent: '#canvas'}))
	@mousemove=(do (data = AppOps.handleMove {data, event: e}))
	@mousedown=(do (if data.selectedPoint then data.moving = true))
	@mouseup=(do (data.moving = false))
	>
		# <button @click.prevent=(do PieceOps.renderPiece {points: data.pieces[0].points})> "render"
		# <button @mousemove=(do PieceOps.renderPiece {points: data.pieces[0].points})> "render"

		if data..menu == true
			<context-menu bind=data>
# CSS

css #canvas h:100% flg:100
global css .svg h:100% w:100%

export default <app-canvas>