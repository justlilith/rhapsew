import * as PieceOps from '$lib/ts/helpers/pieceOps'
import * as AppOps from '$lib/ts/helpers/appOps'
import * as KeyboardOps from '$lib/ts/helpers/keyboardOps'
import context-menu from '$lib/components/context-menu'

# let points = [] # this is one piece
# each piece is an array of Points
# let data

tag app-canvas
	prop data
	def mount
		console.log "awakened"
		console.log data.parent
		AppOps.init data
		AppOps.initSVGCanvas data
		setInterval(&,100) do # renderLoop, 60-ish fps
			unless data.pieces.length == 0
				for piece of data.pieces
					PieceOps.renderPiece {piece, data}
					# piece.points.forEach do(point)
					# 	PieceOps.renderPoint {data, id: point.id, point}

		
	<self#canvas @click=(do (data = AppOps.handleClick {data, event: e}))
	@mousemove=(do (data = AppOps.handleMove {data, event: e}))
	@mousedown=(do (data = AppOps.handleMousedown {data, event: e}))
	@mouseup=(do (data = AppOps.handleMouseup {data, event: e}))
	@hotkey('esc')=(do (data = KeyboardOps.escape {data}))
	@hotkey('del')=(do (data = KeyboardOps.deleteKey {data}))
	>

		if data..menu
			<context-menu bind=data>
			
# CSS

css #canvas h:100% flg:100
global css .svg h:100% w:100%
global css .anchor zi:20 pos:relative
global css .anchor@hover fill:white
global css .piece zi:10 pos:relative

export default <app-canvas>