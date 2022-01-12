import * as HistoryManager from '../ts/helpers/HistoryManager'
import * as PieceOps from '$lib/ts/helpers/pieceOps'
import * as AppOps from '$lib/ts/helpers/appOps'


tag context-menu
	prop data
	def mount
		console.log "menu mounted"
		console.log data

	def addPiece(event)
		for piece of data.pieces
			console.log piece
		data = PieceOps.addPiece {data, event}
		HistoryManager.append (AppOps.toggleContextMenu {data, state: 'off'})
	
	# def deletePiece

	<self.context-menu[opacity@off:0 ease:0.25s] ease>
		if data
			<section.menu[t:{data.menuY}px l:{data.menuX}px] id="contextmenu">
				<div.menu-item>
					<span.material-icons-outlined> "checkroom"
					<span @click=(addPiece e)> "New Piece"
			
		# <span @click=(do PieceOps.removePiece)> "Delete Piece"

		# CSS

css .menu c:gray4 bg:black pos:fixed d:flex fld:column p:0.5em fs:1em min-height:10px
	.menu-item d:flex fld:row ai:center p:.5em bdb:thin solid gray6 cursor:pointer
	.menu-item@hover c:white
	.menu-item@last bdb:none
	.material-icons-outlined pr:.5em fs:.875em

export default <context-menu>