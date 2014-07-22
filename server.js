/**
 *  RTS Demo - Web Server
**/

var http     = require('http');
var content  = require('node-static');
var config   = require('./config/rtsdemo.json');

var www = new(content.Server)('public');

var handler = function (request, response) { 
    www.serve(request, response, function (err, res) { 
        if (err) { 
            console.error("RTS Demo: error serving %s - %s", request.url, err.message);
            response.writeHead(err.status, err.headers);
            response.end();
        }
        else
            console.log("RTS Demo: %s - %s", request.url, res.message);
    });
};

var server = http.createServer(handler);
server.listen(config.http.port);

console.log("RTS Demo: Server running on http://localhost:%s", config.http.port);
