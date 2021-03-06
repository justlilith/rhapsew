import * as HistoryManager from '../ts/helpers/HistoryManager'
import * as PieceOps from '$lib/ts/helpers/pieceOps'
import * as AppOps from '$lib/ts/helpers/appOps'
import * as KeyboardOps from '$lib/ts/helpers/keyboardOps'
import context-menu from '$lib/components/context-menu'



tag app-canvas
	prop data\State

	def mount
		console.info "Rhapsew [Info]: App started! 🤍"
		AppOps.initSVGCanvas data
		window.addEventListener('rhapsewZoom', &) do(e)
			handleZoom e
		setInterval(&,15) do # renderLoop; 20 == 50fps, 100 == 10fps
			# PieceOps.wipe data
			unless data.pieces.length == 0
				for piece of data.pieces
					if piece.changed
						PieceOps.renderPiece {piece, data}
		# setInterval(&,1000) do
		# 	console.log data

	def force-render
		# AppOps.cleanCanvas
		for piece of data.pieces
			piece.changed = true


	def handleZoom(event)
		# console.log event
		# console.log data.zoom
		data.zoom = event.detail.level
		imba.commit!
	
	def handleMousedown(e\MouseEvent)
		# console.log e
		if (e.target.classList.contains('rhapsew-element'))
			data = (AppOps.handleMousedown {data, event: e})

	def handleClick(e\MouseEvent)
		# console.log e
		if (e.target.classList.contains('rhapsew-element'))
			let changed = false
			{ data, changed } = (AppOps.handleClick {data, event: e})
			if changed
				HistoryManager.append (data)
			 
	def handleMouseup(e\MouseEvent)
		# console.log e
		data.panning = false
		if (e.target.classList.contains('rhapsew-element'))
			HistoryManager.append (AppOps.handleMouseup {data, event: e})

	<self#canvas
	# @keypress=(console.log)
	@click=(do (handleClick e))
	@rhapsewZoom=(do (handleZoom e))
	@paste=(do(e) (HistoryManager.append await AppOps.pastePiece {data, event: e}) )
	@contextmenu.prevent=(do (handleClick e))
	@mousemove=(do (data = AppOps.handleMousemove {data, event: e}))
	@mousedown=(do (handleMousedown e))
	@mouseup=(do (handleMouseup e))
	@hotkey('a')=(do (data = AppOps.switchTools {data, tool: "anchor"}))
	@hotkey('p')=(do (data = AppOps.switchTools {data, tool: "piece"}))
	@hotkey('esc')=(do (HistoryManager.append (KeyboardOps.escape {data})))
	@hotkey('del')=(do (HistoryManager.append (KeyboardOps.deleteKey {data}); force-render!))
	@hotkey('backspace')=(do (HistoryManager.append (KeyboardOps.deleteKey {data}); force-render!))
	@hotkey('ctrl+z')=(do (PieceOps.wipe data; HistoryManager.undo!; force-render!))
	@hotkey('ctrl+shift+z')=(do (PieceOps.wipe data; HistoryManager.redo!; force-render!))
	@hotkey('ctrl+y')=(do (PieceOps.wipe data; HistoryManager.redo!; force-render!))
	# @hotkey('space')=(do (data.currentTool = 'pan'))
	@hotkey('space').repeat=(do (if data.mousedown then data.panning = true; data.status = 'Panning'))
	@hotkey('ctrl').repeat=(do (if data.mousedown then data.lockScale = false else data.lockScale = true))
	@hotkey('ctrl+c')=(do (data = await AppOps.copyPiece {data, piece:data..selectedPiece}))
	# @hotkey('ctrl+v')=(do (window.dispatchEvent(new Event('paste'))) )
	# @hotkey('ctrl+v')=(do(e) (data = await AppOps.pastePiece {data, event: e}) )
	# @hotkey('del')=(do (data = KeyboardOps.deleteKey {data}))
	>

		if data..contextMenu
			<context-menu bind=data>
			
# CSS

css #canvas h:100% flg:100 d:flex fld:column
global css .svg h:100% w:100% flg:100
global css .anchor zi:20 pos:relative
global css .bounding-box-handle zi:25 pos:relative
global css .anchor@hover fill:white
global css .piece zi:10 pos:relative

export default <app-canvas>