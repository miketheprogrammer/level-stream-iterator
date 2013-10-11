var EventEmitter = require('events').EventEmitter
var util = require('util')
var LevelIterator = function(opts, db) {
    EventEmitter.call(this)
    if ( typeof opts.put == 'function' ) {
	db = opts
	options = {}
    } else {
	options = {}
    }
    this.readStream = db.createReadStream(options)
    this.readable = false
    this.ended = false
   
    this.buffer = []
    
    var ref = this;
    this.readStream.on('readable', function() {
	ref.readable = true
	ref.emit('readable')
    })
    
    this.readStream.on('end', function() {
	this.ended = false
	ref.emit('end')
    })
}

util.inherits(LevelIterator, EventEmitter)

LevelIterator.prototype._read = function() {
    return this.readStream.read()
}

LevelIterator.prototype.validateResult = function(result){
    return (result === null || result === undefined)
}

LevelIterator.prototype.read = function() {
    return this._read();
}

LevelIterator.prototype.next = function(cb) {
    if ( this.ended ) return cb(null, undefined)
    
    if ( this.readable ) {
	var result = this._read();
	if ( this.validateResult(result)  ) {
	    this.readable = false
	    return this.next(cb)
	}
	return cb(null, result)
    }

    var ref = this;
    var onEnd = function() { ref.next(cb) }
	
    this.readStream.once('readable', function() {
	ref.readable = true
	ref.readStream.removeListener('end', onEnd)
	ref.next(cb)
    })
    this.readStream.once('end', onEnd)
}

/* 
This method should not be used unless you know what your are doing
@refactor to use seek sync
*/
LevelIterator.prototype.hasNextSync = function() {
    if ( this.readable === false )
	throw new Error('Stream is not readable yet')
    while(true){
	if ( this.readable ) {
	    return !this.validateResult(this._read())
	}
    }
}


LevelIterator.prototype.seekSync = function(i, useBuffer) {
    i = (i || 1)
    useBuffer = useBuffer || ( useBuffer = false )
   
    if ( this.readable === false ) 
	throw new Error('Stream is not readable yet')

    while( true )
	if ( this.readable ) {
	    for ( var j = 0; j < i; j++){
		var value = this._read()
		if ( useBuffer )
		    this.buffer.push(value)
	    }
	    return
	}
}


module.exports = LevelIterator