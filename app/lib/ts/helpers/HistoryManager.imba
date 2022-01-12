let history = []
let current-index = 0
let history-limit

def update
	let event = new CustomEvent 'history-manager-change', {"ok"}
	document.dispatchEvent event

def shallowCopy data
	return JSON.parse(JSON.stringify(data))

def append data
	if history[current-index + 1]
		history = history.slice 0, current-index + 1
	console.log "appending"
	console.log JSON.stringify(shallowCopy (history.slice -1)[0])
	if history-limit && history.length == history-limit
		history.shift!
	history.push data
	current-index += 1
	let event = new CustomEvent 'history-manager-change', {detail: shallowCopy history[current-index]}
	document.dispatchEvent event

def limit number
	history-limit = number

def previous
	history[current-index - 1]

def next
	history[current-index + 1]

def undo
	if history[current-index - 1]
		current-index -= 1
		let event = new CustomEvent 'history-manager-change', {detail: shallowCopy history[current-index]}
		document.dispatchEvent event

def redo
	if history[current-index + 1]
		current-index += 1
		let event = new CustomEvent 'history-manager-change', {detail: shallowCopy history[current-index]}
		document.dispatchEvent event

def set data
	history = [data]

def subscribe callbackFunction
	document.addEventListener('history-manager-change',&) do(e)
		callbackFunction e

export {
	append
	, previous
	, next
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