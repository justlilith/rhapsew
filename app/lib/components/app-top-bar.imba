import * as HistoryManager from '../ts/helpers/HistoryManager'
import * as PieceOps from '$lib/ts/helpers/pieceOps'
import * as AppOps from '$lib/ts/helpers/appOps'

tag app-top-bar
	<self.self>
		<span.logo> "Rhapsew"
		<section.menu>
			<div.menu-item>
				<button>
					<span.material-icons-outlined> "construction"
					<span> "Tools"
			<div.menu-item @click=(do (HistoryManager.undo!))>
				<button>
					<span.material-icons-outlined> "undo"
					<span> "Undo"
			<div.menu-item>
				<button  @click=(do (HistoryManager.redo!))>
					<span.material-icons-outlined> "redo"
					<span> "Redo"
			<div.menu-item @click=(do (HistoryManager.append (AppOps.clearScreen {data})))>
				<button>
					<span.material-icons-outlined> "clear_all"
					<span> "Clear"
			<div.menu-item @click=(do (AppOps.exportSvg {data}))>
				<button>
					<span.material-icons-outlined> "file_download"
					<span> "Export"
			<div.menu-item>
				<button>
					<span.material-icons-outlined> "settings"
					<span> "Settings"
			<div.menu-item>
				<button>
					<span.material-icons-outlined> "help_outline"
					<span> "Help"

# CSS

css .self c:gray4 bg:black d:flex p:0.5em fld:row h:30px j:flex-start ai:center
	.logo fs:1.5em c:white
	.logo@after content:" (rɑːp-soʊ)" fs:.625em va:top c:gray7
	.logo@hover@after content:" (rɑːp-soʊ)" fs:.625em va:top c:white
	.menu d:flex fld:row pl:2em fs:.875em
	button bd:none bg:none c:gray4 fs:1em d:flex fld:row va:middle
	button@hover c:white
	.menu-item p:0 1em va:middle d:flex fld:row ai:center
		span cursor:pointer
	.menu-item@first bdl:none p:0 .5em
	.material-icons-outlined pr:.25em fs:1.25em

export default <app-top-bar>