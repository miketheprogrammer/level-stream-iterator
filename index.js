var EventEmitter = require('events').EventEmitter
var util = require('util')

/*
 * This API Exposes both Async and Sync Methods.
 * Sync Methods should be used with caution.
 * The Iterator class bubbles up some of the events of the underlying
   stream ( readable, end )
*/

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

    //Faster than bind
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
    if ( this.buffer.length > 0 )
	return this.buffer.splice(0,1)[0]
    return this.readStream.read()
}

LevelIterator.prototype.validateResult = function(result){
    return (result === null || result === undefined)
}

LevelIterator.prototype.read = function(i, cb, results) {
    var results = results || ( results = [] )

    var callback = function(err, res) {
	if ( err ) return cb(err)
	    
	results.push(res)

	if ( i > 0 ) this.read(i, cb, results)
	else cb(err, results)
    }

    i -= 1
    this.next(callback.bind(this))
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

LevelIterator.prototype._checkReadable = function() {
    if ( this.readable === false )
	throw new Error('Stream is not readable yet')
}


LevelIterator.prototype.hasNextSync = function(useBuffer) {
    useBuffer = useBuffer || ( useBuffer = true )

    this._checkReadable()
    while(true){
	if ( this.ended ) return false
	if ( this.readable ) {
	    var value = this._read()
	    var isValid = !this.validateResult(value)
	    if ( useBuffer && isValid ) this.buffer.push(value)
	    return isValid
	}
    }
}

LevelIterator.prototype.hasNext = function(cb, useBuffer) {
    useBuffer = useBuffer || ( useBuffer = true )
    
    var callback = function(err, res) {
	if ( useBuffer ) this.buffer.push(res)
	cb(!this.validateResult(res))

    }
    
    this.next(callback.bind(this))
}


LevelIterator.prototype.seekSync = function(i) {
    i = (i || 1)

    this._checkReadable()    
    while( true ) {
	if ( this.ended ) return false
	if ( this.readable ) {
	    for ( var j = 0; j < i; j++){
		this._read()
	    }
	    return
	}
    }
}

LevelIterator.prototype.seek = function(i, cb) {
    var callback = function() {
	if ( i > 0 )
	    this.seek(i, cb)
	else cb(true)
    }

    i -= 1;
    this.next(callback.bind(this))
}



module.exports = LevelIterator