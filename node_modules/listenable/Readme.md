node-listenable
===============
listenable is a super simple event emitter

Install
-------

    npm install listenable


API
---

```js
var listenable = new Listenable // new instance

// add event listener
listenable.on(eventName, fn)

// add event listener that only triggers once
listenable.once(eventName, fn)

// remove specific event listener (will remove all listeners that === fn)
listenable.off(eventName, fn)

// remove all listeners for a name
listenable.off(eventName)

// trigger an event (additional arguments are passed to the listeners)
listenable.emit(eventName[, args...])

// get listeners for an event
listenable.listeners.eventName // null or potentially empty Array of listeners
```

Examples
--------
```js
var Listenable = require('listenable')

var listenable = new Listenable

listenable.on('foo', function(arg) {
    console.log("foo "+arg+" just happened!")
})

listenable.emit('foo', 1)
listenable.off('foo')
listenable.emit('foo', 2)

```

License
-------
listenable is open source software under the [zlib license][LICENSE].