import app-statusbar from '$lib/components/app-statusbar'
import app-canvas from '$lib/components/app-canvas'
import app-top-bar from '$lib/components/app-top-bar'
import settings-menu from '$lib/components/settings-menu'
import * as AppOps from '$lib/ts/helpers/appOps'
import * as History from '$lib/ts/helpers/HistoryManager'
import * as Utilities from '$lib/ts/helpers/utilities'

let state\State =
	{
		anchorClicked: false
		canvasClicked: false
		currentTheme: 'dark'
		currentCoords: null
		units: 'imperial'
		zoom: 1
		dpi: 96
		pieces: []
		status: "Idle"
		parent: '#canvas'
		menu: false
		settingsMenu: false
		selectedPiece: null
		selectedPoint: null
		menuX: null
		menuY: null
		mousedown: false
		moving: null
		panning: false
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

	<self.app.{state.currentTheme}>
		<header>
			<app-top-bar bind=state>
			if state..settingsMenu
				<settings-menu[y@in:-300px y@out:-500px] bind=state ease>
		<section.content>
			<app-canvas bind=state>
		<footer>
			<app-statusbar bind=state>

imba.mount <app>

# CSS

global css html
	ff:sans
css .app d:flex fld:column m:auto ta:left min-height:100vh
	.content flg:100 d:flex fld:column

css .dark bg:gray7 c:white
css .light bg:gray2 c:black