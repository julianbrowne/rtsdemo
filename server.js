
var http    = require('http');
var socket  = require('socket.io');
var mongo   = require('mongodb');
require('./lib/cursorextension.js').extendCursor(mongo);
var content = require('node-static');
var utils   = require('./lib/utils.js');

var dbname   = 'rtsdemo';
var collname = 'statstore';
var nodePort = 8010;

// create file handler for local http server

var file = new(content.Server)('./public');
var handler = function (request, response) {
    request.addListener('end', function () { file.serve(request, response); });
}

// start socket server

var socketsApp = http.createServer(handler);
var io = socket.listen(socketsApp);
socketsApp.listen(nodePort);

console.log("HTTP server running on http://localhost:" + nodePort);

// create mongo connection and make a db

var mongoServer  = new mongo.Server('localhost', 8001, {});

var dbConnection = new mongo.Db(dbname, mongoServer, {});

// Open db and wait for browser to connect

dbConnection.open(function(error,db){

    if(error)
    {
        console.error("Error: Open database failed. Is mongod running?");
        process.exit(1);
    }

    var coll = db.collection(collname);

    io.sockets.on('connection', function (socket) {
        console.log('Received browser connection.');
        utils.readAndSend(socket, coll, 'stats-channel');
    });

});
