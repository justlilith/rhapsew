import * as PieceOps from '$lib/ts/helpers/pieceOps'
import * as AppOps from '$lib/ts/helpers/appOps'

tag context-menu
	prop data = {menuX: 0, menuY: 0}
	def mount
		console.log "menu mounted"
		console.log data
	def addPiece
		data = PieceOps.addPiece data
		AppOps.toggleContextMenu {data, state: 'off'}
		data.pieces[0].points[0].active = true
	# def deletePiece
	<self.menu[t:{data.menuY}px l:{data.menuX}px]>
		<span @click=(addPiece!)> "New Piece"
		# <span @click=(do PieceOps.removePiece)> "Delete Piece"

		# CSS

css .menu c:white bg:black pos:fixed d:flex fld:column p:0.5em fs:1em min-height:10px
	span d:block p:.5em bdb:thin solid gray6 cursor:pointer
	span@last bdb:none

export default <context-menu>