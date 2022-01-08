import * as PieceOps from '$lib/ts/helpers/pieceOps'
import * as AppOps from '$lib/ts/helpers/appOps'


tag context-menu
	prop data
	# def mount
	# 	console.log "menu mounted"
	# 	console.log data

	def addPiece(event)
		data = PieceOps.addPiece {data, event}
		console.log("imba data", data.pieces)
		data = AppOps.toggleContextMenu {data, state: 'off'}
	# def deletePiece

	<self>
		if data
			<section.menu[t:{data.menuY}px l:{data.menuX}px] id="contextmenu">
				<span @click=(addPiece)> "New Piece"
			
		# <span @click=(do PieceOps.removePiece)> "Delete Piece"

		# CSS

css .menu c:white bg:black pos:fixed d:flex fld:column p:0.5em fs:1em min-height:10px
	span d:block p:.5em bdb:thin solid gray6 cursor:pointer
	span@hover c:cyan4
	span@last bdb:none

export default <context-menu>