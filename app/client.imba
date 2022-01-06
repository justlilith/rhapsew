import app-statusbar from '$lib/components/app-statusbar'
import app-canvas from '$lib/components/app-canvas'
import app-top-bar from '$lib/components/app-top-bar'

let state =
	{
		currentTheme:'dark'
	}

tag app
	<self.app.{state.currentTheme}>
		<header>
			<app-top-bar>
		<section.content>
			<app-canvas>
		<footer>
			<app-statusbar>

imba.mount <app>

# CSS

global css html
	ff:sans
css .app d:flex fld:column m:auto ta:left min-height:100vh
	.content flg:100
	
css .dark bg:gray7 c:white