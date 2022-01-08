import * as PieceOps from '$lib/ts/helpers/pieceOps'
import * as AppOps from '$lib/ts/helpers/appOps'

tag app-top-bar
	<self.self>
		<span.logo> "Rhapsew"
		<section.menu>
			<div.menu-item @click=(do (AppOps.exportSvg {data}))>
				<span> "Export"
			<div.menu-item>
				<span> "Help"

# CSS

css .self c:gray4 bg:black d:flex p:0.5em fld:row h:30px j:flex-start ai:center
	.logo fs:1.5em c:white
	.logo@after content:" (rɑːp-soʊ)" fs:.625em va:top c:gray7
	.logo@hover@after content:" (rɑːp-soʊ)" fs:.625em va:top c:white
	.menu d:flex fld:row pl:2em fs:.875em
	.menu-item p:0 1em
		span cursor:pointer
	.menu-item@first bdl:none p:0 .5em

export default <app-top-bar>