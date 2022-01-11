import app-statusbar from '$lib/components/app-statusbar'
import app-canvas from '$lib/components/app-canvas'
import app-top-bar from '$lib/components/app-top-bar'
import * as AppOps from '$lib/ts/helpers/appOps'
import * as History from '$lib/ts/helpers/HistoryManager'

let state\State =
	{
		currentTheme: 'dark'
		units: 'imperial'
		zoom: 1
		pieces: []
		status: "Idle"
		parent: '#canvas'
		menu: false
		selectedPiece: null
		selectedPoint: null
		menuX: null
		menuY: null
		moving: null
	}

History.set state
# History.limit 1000
History.subscribe do(e)
	console.log e.detail
	state = e.detail

tag app
	<self.app.{state.currentTheme}>
		<header>
			<app-top-bar bind=state>
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