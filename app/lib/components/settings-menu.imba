tag settings-menu
	prop data = {}

	def switchUnits unit
		data.units = unit
		switch unit
			when "metric"
				data.dpi = 37.795
			when "imperial"
				data.dpi = 96
	
	<self.self>
		<p> "Units"
		<button @click=(do (switchUnits "metric")) .{data.currentTheme}.{data.units == "metric" ? "enabled" : "disabled"}> "Metric"
		<button @click=(do (switchUnits "imperial")) .{data.currentTheme}.{data.units == "imperial" ? "enabled" : "disabled"}> "Imperial"
		<p> "DPI"
		<input type="text" bind=data.dpi>
		<p> "Theme"
		<button @click=(do (data.currentTheme = "dark")) .{data.currentTheme == "dark" ? "enabled" : "disabled"}> "Dark"
		<button @click=(do (data.currentTheme = "light")) .{data.currentTheme == "light" ? "enabled" : "disabled"}> "Light"
		<p> "Always Show Path Lengths"
		<button @click=(do (data.alwaysShowPathLengths = true)) .{data.alwaysShowPathLengths == true ? "enabled" : "disabled"}> "On"
		<button @click=(do (data.alwaysShowPathLengths = false)) .{data.alwaysShowPathLengths == false ? "enabled" : "disabled"}> "Off"

css .self c:white bgc:black zi:30 m:0px p:1em pos:absolute w:calc(100% - 2em)
	input bgc:black bd:thin solid gray2 c:gray2 p:0.5em
	button bd:none bd:thin solid gray2 p:0.5em
	button.enabled c:black bgc:gray2 fw:700
	button.disabled c:gray2 bgc:black bd:thin solid gray2


export default <settings-menu>