
/*
       Copyright 2012 ObjectLabs Corp.  

       MIT License

       Permission is hereby granted, free of charge, to any person
       obtaining a copy of this software and associated documentation files
       (the "Software"), to deal in the Software without restriction,
       including without limitation the rights to use, copy, modify, merge,
       publish, distribute, sublicense, and/or sell copies of the Software,
       and to permit persons to whom the Software is furnished to do so,
       subject to the following conditions:  

       The above copyright notice and this permission notice shall be
       included in all copies or substantial portions of the Software. 

       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
       EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
       MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
       NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
       BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
       ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
       CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
       SOFTWARE. 

       TITLE
       Tractor Push: Node.js, socket.io, Ruby, MongoDB tailed cursor
       demo
       index.html - main client code.  Opens up a socket.io connection
       to server and displays returned data dynamically.

       by Ben Wen, ObjectLabs

       ObjectLabs is the maker of MongoLab.com a cloud, hosted MongoDb
       service
*/

extendCursor = function(mongoObj) {

    Cursor = mongoObj.Cursor;

    Cursor.prototype.intervalEach = function(interval, callback) {
        var self = this;
        if (!callback) {
            throw new Error('callback is mandatory');
        }

        if(this.state != Cursor.CLOSED) {
        //FIX: stack overflow (on deep callback) (cred: https://github.com/limp/node-mongodb-native/commit/27da7e4b2af02035847f262b29837a94bbbf6ce2)
        setTimeout(function(){
            // Fetch the next object until there is no more objects
            self.nextObject(function(err, item) {        
            if(err != null) return callback(err, null);

            if(item != null) {
                callback(null, item);
                self.intervalEach(interval, callback);
            } else {
                // Close the cursor if done
                self.state = Cursor.CLOSED;
                callback(err, null);
            }

            item = null;
            });
        }, interval);
        } else {
        callback(new Error("Cursor is closed"), null);
        }
    };
}

exports.extendCursor = extendCursor;
