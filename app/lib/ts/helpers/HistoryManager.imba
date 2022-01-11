let history = []
let current-index = 0
let history-limit

def update
	let event = new CustomEvent 'history-manager-change', {"ok"}
	document.dispatchEvent event

def append data
	console.log "appending"
	if history-limit && history.length == history-limit
		history.shift!
	history.push data
	current-index += 1
	let event = new CustomEvent 'history-manager-change', {detail: history[current-index]}
	document.dispatchEvent event

def limit number
	history-limit = number

def undo
	if history[current-index - 1]
		current-index -= 1
		let event = new CustomEvent 'history-manager-change', {detail: history[current-index]}
		document.dispatchEvent event

def redo
	if history[current-index + 1]
		current-index += 1
		let event = new CustomEvent 'history-manager-change', {detail: history[current-index]}
		document.dispatchEvent event

def set data
	history = [data]

def subscribe callbackFunction
	document.addEventListener('history-manager-change',&) do(e)
		callbackFunction e

export {
	append
	, limit
	, undo
	, redo
	, set
	, subscribe
}
###

Okay, so let's think about this
we want something like Svelte: a fn that triggers when the data changes
So an eventListener?

UX:
history.subscribe( state => {
	data = state
})

history.append(data)
history.undo!
history.redo!

###