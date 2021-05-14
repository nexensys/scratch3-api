var Listenable = require('./listenable')

var assert = require('assert')

var l = new Listenable

var fooCount = 0
var fooArgs = 0

function onFoo(arg) {
    fooCount++
    fooArgs += arg
}

l.on('foo', onFoo)

l.emit('foo', 1)
l.off('foo')
l.emit('foo', 2)

assert.equal(1, fooCount)
assert.equal(1, fooArgs)

l.once('foo', onFoo)

l.emit('foo')
assert.equal(2, fooCount)
l.emit('foo')
assert.equal(2, fooCount)


l.once('foo', onFoo)
l.off('foo', onFoo)

l.emit('foo')
assert.equal(2, fooCount)


var bars = []
l.on('bar', function(arg) {
    bars.push(arg)
})

l.emit('bar', 1)
l.emit('bar', 2)
l.emit('bar', 3)

assert.deepEqual(bars, [1,2,3])

var bars2 = []
function onBar(arg) {
    bars2.push(arg)
}
l.on('bar', onBar)
l.emit('bar', 4)
l.emit('bar', 5)
l.emit('bar', 6)


assert.deepEqual(bars, [1,2,3,4,5,6])
assert.deepEqual(bars2, [4,5,6])

l.off('bar', onBar)

l.emit('bar', 7)

assert.deepEqual(bars, [1,2,3,4,5,6,7])
assert.deepEqual(bars2, [4,5,6])

l.off('bar')

l.emit('bar', 8)

assert.deepEqual(bars, [1,2,3,4,5,6,7])
assert.deepEqual(bars2, [4,5,6])