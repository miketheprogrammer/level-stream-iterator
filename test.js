var levelup = require('levelup')
var LevelIterator = require('./index')
var db = levelup('./testdb1')
var assert = require('assert')

describe('Iterator Class', function(){
    it('Should Construct', function() {
	var iter = new LevelIterator(db)
	assert(iter instanceof LevelIterator)
	assert(iter.readStream !== undefined)
	assert(iter.readable === false)
	assert(iter.ended === false)
    })

    beforeEach(function(done) {
	for ( var i=0; i < 4; i++ ) {
	    db.put(i, 'string'+i)
	}

	db.put(4, 'string4', function() {
	    done()
	})
    })

    describe('Iterator.next', function() {
	it('Should return the next in the sequence', function(done){
	    var iter = new LevelIterator(db)
	    iter.next(function(err, result) {
		assert(result.value === 'string0')
		iter.next(function(err, result) {
		    assert(result.value === 'string1')
		    done()
		})
	    })
	})
    })

    describe('Iterator.hasNext', function() {
	it('Should return true if there is another record else false',
	   function(done){
	       var iter = new LevelIterator(db)
	       iter.hasNext(function(err, res) {
		   if ( err ) done(err)
		   if ( res ) {
		       iter.next(function(err, res) {
			   assert(res.key === '0')
			   assert(res.value === 'string0')
			   done()
		       })
		   }
	       })
	   })
    })

    describe('Iterator.hasNextSync', function() {
	it('Should return true if there is another record else false',
	   function(done){
	       var iter = new LevelIterator(db)
	       iter.on('readable', function() {
		   assert(iter.hasNextSync() === true)
		   iter.next(function(){})
	       })
	       iter.on('end', function() {
		   assert(iter.hasNextSync() === false)
		   done()
	       })
	       
	   })

	it('Should store skipped results in buffer', function(done){
	    var iter = new LevelIterator(db)
	    iter.once('readable', function() {
		setTimeout(function() {
		    iter.hasNextSync()
		    iter.next(function(err, res) {
			assert(res.key === '0')
			assert(res.value === 'string0')
			done()
		    })
		},10)
	    })
	})

    })

    describe('Iterator.seek', function() {
	it('Should seek 2 places forward', function(done) {
	    var iter = new LevelIterator(db)
	    iter.seek(2, function() {
		iter.next(function(err, res) {
		    assert(res.key === '2')
		    assert(res.value === 'string2')
		    done()
		})
	    })
	})
    })

    describe('Iterator.seekSync', function() {
	it('Should seek 2 places forward', function(done) {
	    var iter = new LevelIterator(db)
	    iter.once('readable', function() {
		setTimeout(function() {
		    iter.seekSync(2)
		    iter.next(function(err, res) {
			assert(res.value === 'string2')
			assert(res.key === '2')
			done()
		    })
		}, 10)
	    })
	})
    })
})