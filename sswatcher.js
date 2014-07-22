/**
 *  RTS Demo - Single Mongo Server Watcher
**/

var http    = require('http');
var socket  = require('socket.io');
var mongo   = require('mongodb');
var utils   = require('./lib/utils.js');
var config  = require('./config/rtsdemo.json');

var socketsApp = http.createServer();
var io = socket.listen(socketsApp);
io.set('log level', 1);
socketsApp.listen(config.watchers.single.websocket);

console.log("RTS Demo: SS Watcher WS server running on ws://localhost:%s", config.watchers.single.websocket);

// create mongo connection and make a db

var mongoServer  = new mongo.Server(config.mongodb.single.host, config.mongodb.single.port, {});

var dbConnection = new mongo.Db(config.mongodb.single.db, mongoServer, {});

// Open db and wait for browser to connect

dbConnection.open(function(error,db){

    if(error)
    {
        console.error("*** Error: Open database failed. Is mongod running?");
        process.exit(1);
    }

    var coll = db.collection(config.mongodb.single.collection);

    io.sockets.on('connection', function (socket) {
        console.log('RTS Demo: Received browser connection.');
        utils.readAndSend(socket, coll, 'stats-channel');
    });

});
