

tag app-statusbar
	prop data # = {zoom:100, status: 'Idle'}
	<self.self>
		if data
			<span.welcome> "Welcome 🤍"
			<section.console>
				<span.prompt> "user@rhapsew~$:"
				<input placeholder="Execute function . . .">
			<span.status> data.status
			<span.zoom-level>
				<span.material-icons-outlined> "magnifying_glass"
				<span> Math.floor(data.zoom * 100), "%"

# CSS

css .self c:gray4 bg:black p:0.5em d:flex fld:row fs:1em
	.welcome pr:1em fs .875em
	.status w:25% p: 0 0.5em ta:center
	.console pl:.5em bgc:black c:white flg:100 bd:thin solid gray6 ff:monospace,mono d:flex fld:row ai:center ml:1em
	.prompt pr:.25em c:gray4 d:inline-block
	input bgc:black c:white bd:none fs:1em ff:monospace,mono d:inline-block flg:100 ai:top va:top
	# input@focus h:200px
	.zoom-level ta:center ai:center d:flex fld:row

export default <app-statusbar>