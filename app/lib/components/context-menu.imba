tag context-menu
	prop data = {menuX: 0, menuY: 0}
	def mount
		console.log "menu mounted"
		console.log data
	<self.menu[t:{data.menuY}px l:{data.menuX}px]> # Why is this value so large
		<span> "New Piece"
		<span> "Delete Piece"

		# CSS

css .menu c:white bg:black pos:fixed d:flex fld:column p:0.5em fs:1em min-height:100px
	span d:block p:.5em

export default <context-menu>