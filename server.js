/**
 *
 *  RTS Demo - Web Server
 *
**/

var http     = require('http');
var content  = require('node-static');
var demoPort = 8010;

// create file handler for local http server

var file = new(content.Server)('./public');

var handler = function (request, response) {
    request.addListener('end', function () { file.serve(request, response); });
}

http.createServer(handler)
    .listen(demoPort);

console.log("HTTP RTS Demo server running on http://localhost:" + demoPort);
