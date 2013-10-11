level-stream-iterator
==============

A Level Up module that Implements iterator syntax over a stream.
If you want to treat a level up db like a lazy stream. This module is for you. I currently efficient on demand I/O

It supports some useful methods that are more similar to file system I/O like (seek & hasNext) Which may make it a drop in replacement for
code bases that use file I/O module with those methods.

The choice to use a Stream Iterator rather than .pause and .resume methods is a personal choice.

As with all streams, this module does not currently support going backwards. However you can seek forward. I like this feature and it
arose out of the abstraction of the stream.

Refer To Tests for code examples.

API
==============

Instantiate with 
-------

``` js
var LevelIterator = require('level-stream-iterator')

// Instantiate with stream opts and db
var db = levelup('./mydb')
var streamOpts = {}
var iter = new LevelIterator(streamOpts, db)

})

//Instantiate with just db
var db = levelup('./myd')
var iter = new LevelIterator(db)
```

``` js
```

All data functions call the callback with  ( err , result )

All boolean function call the callback with ( result )

Seek calls the callback with true but getting the value is not necessary.

next | function ( cb ) 
-------
Gets the next item in the stream. Waits for readable event if no items current available, and stream has not ended

hasNext | function ( cb )
-------
Return true if there is another item. Can be achieved just by using next and checking if response === undefined

seek | function ( i, cb )
-------
@param i : How many items forward to seek

Seeks forward *i items

read | function ( i, cb )
-------
@param i : How many items to read

Returns *i items from the stream

Synchronous API
============

hasNextSync | function()
---------

seekSync | function()
---------
