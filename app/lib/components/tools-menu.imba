import * as AppOps from '$lib/ts/helpers/appOps'

tag tools-menu
	prop data = {}
	
	<self.self>
		<button @click=(do (data = AppOps.switchTools {data, tool: "anchor"})) .{data.currentTheme}>
			<span.material-icons-outlined> "gps_fixed"
			<span> "Anchor"
		<button @click=(do (data = AppOps.switchTools {data, tool: "piece"})) .{data.currentTheme}>
			<span.material-icons-outlined> "checkroom"
			<span> "Piece"
		# <button @click=(do (switchTools "piece")) .{data.currentTheme}>
		# 	<span.material-icons-outlined> "construction"
		# 	"Annotate"

css .self c:white bgc:black zi:30 pos:relative m:0px p:1em pos:absolute w:calc(100% - 2em)
	button bd:none p:0.5em c:gray2 bg:none mr:2em # bd: thin solid red
	button span va:middle
	.material-icons-outlined pr:.25em fs:1.25em



export default <tools-menu>