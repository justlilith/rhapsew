tag app-top-bar
	<self.self>
		<span> "Rhapsew"

# CSS

css .self c:white bg:black d:flex p:0.5em fld:row fs:1.5em h:30px
	span@after content:" (rɑːp-soʊ)" fs:.625em va:top c:gray7
	span@hover@after content:" (rɑːp-soʊ)" fs:.625em va:top c:white

export default <app-top-bar>