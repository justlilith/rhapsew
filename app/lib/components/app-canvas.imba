import * as Helpers from '$lib/ts/helpers'


tag app-canvas
	<self.canvas@click=(Helpers.handleClick!)>
		<section>
			<p draggable="true"> "Test"
		
# CSS

css .canvas d:flex fld:column h:100% bgc:#666666
	section h:100% flg:100

export default <app-canvas>