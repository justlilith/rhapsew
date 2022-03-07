import app-statusbar from '$lib/components/app-statusbar'
import app-canvas from '$lib/components/app-canvas'
import app-top-bar from '$lib/components/app-top-bar'
import settings-menu from '$lib/components/settings-menu'
import tools-menu from '$lib/components/tools-menu'
import * as AppOps from '$lib/ts/helpers/appOps'
import * as History from '$lib/ts/helpers/HistoryManager'
import * as Utilities from '$lib/ts/helpers/utilities'

let state\State =
	{
		anchorClicked: false
		canvasClicked: false
		contextMenu: false
		currentCoords: null
		currentTheme: 'dark'
		currentTool: "anchor"
		dpi: 96
		lockScale: true
		menuX: null
		menuY: null
		mousedown: false
		mousedownCoords: null
		moving: null
		panning: false
		parent: '#canvas'
		pieceMoving: false
		pieces: []
		resizing: false
		selectedPiece: null
		selectedPoint: null
		status: "Idle"
		topMenu: null
		units: 'imperial'
		zoom: 1
	}

History.set state
# History.limit 1000
History.subscribe do(e)
	state = e.detail
	# console.log state
	Utilities.saveToStorage { key: 'data', value: state}

tag app
	def mount
		let test = Utilities.fetchFromStorage 'data'
		test.error ? console.log(test.error) : state = test.fetched
		state.pieces.map do(p)
			p.changed = true
		History.set state

	<self
	.app
	.{state.currentTheme}
	.{state.panning == true ? 'panning' : null}>
		<header>
			<app-top-bar bind=state>
			if state..topMenu == 'settings'
				<settings-menu[y@in:-300px y@out:-500px] bind=state ease>
			if state..topMenu == 'tools'
				<tools-menu[y@in:-300px y@out:-500px] bind=state ease>
		<section.content
		.{state.currentTool == 'anchor' ? 'anchor' : (state.currentTool == 'piece' ? 'piece' : (state.currentTool == 'pan' ? 'pan' : null))}
		>
			<app-canvas bind=state>
		<footer>
			<app-statusbar bind=state>

imba.mount <app>

# CSS

global css html
	ff:sans

css	.app d:flex fld:column m:auto ta:left min-height:100vh
css .anchor cursor:crosshair
css .pan cursor:grab
css .panning cursor:grabbing
css .content flg:100 d:flex fld:column
css .dark bg:gray7 c:white
css .light bg:gray2 c:black