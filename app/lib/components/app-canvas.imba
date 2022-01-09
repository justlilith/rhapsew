import * as PieceOps from '$lib/ts/helpers/pieceOps'
import * as AppOps from '$lib/ts/helpers/appOps'
import * as KeyboardOps from '$lib/ts/helpers/keyboardOps'
import context-menu from '$lib/components/context-menu'

tag app-canvas
	prop data
	def mount
		console.info "Rhapsew [Info]: App started! 🤍"
		# AppOps.init data
		AppOps.initSVGCanvas data
		setInterval(&,100) do # renderLoop, 60-ish fps
			unless data.pieces.length == 0
				for piece of data.pieces
					PieceOps.renderPiece {piece, data}
					# piece.points.forEach do(point)
					# 	PieceOps.renderPoint {data, id: point.id, point}

	def handleMousedown(e\MouseEvent)
		# console.log e
		if (e.target.classList.contains('rhapsew-element'))
			data = AppOps.handleMousedown {data, event: e}
		
	def handleClick(e\MouseEvent)
		# console.log e
		if (e.target.classList.contains('rhapsew-element'))
			data = AppOps.handleClick {data, event: e}
		
	def handleMouseup(e\MouseEvent)
		# console.log e
		if (e.target.classList.contains('rhapsew-element'))
			data = AppOps.handleMouseup {data, event: e}

	<self#canvas
	@click=(do (handleClick e))
	@contextmenu.prevent=(do (handleClick e))
	@mousemove=(do (data = AppOps.handleMove {data, event: e}))
	@mousedown=(do (handleMousedown e)) # how to fix this . . .
	@mouseup=(do (handleMouseup e))
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