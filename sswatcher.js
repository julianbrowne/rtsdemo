/**
 *
 *  RTS Demo - Single Mongo Server Watcher
 *
**/

var http    = require('http');
var socket  = require('socket.io');
var mongo   = require('mongodb');
require('./lib/cursorextension.js').extendCursor(mongo);
var utils   = require('./lib/utils.js');

// mongo/demo settings

var mongoHost = 'localhost';
var mongoPort = 8001;
var dbname    = 'rtsdemo';
var collname  = 'statstore';

var wsPort  = 8011;

// start socket server

var socketsApp = http.createServer();
var io = socket.listen(socketsApp);
io.set('log level', 1);
socketsApp.listen(wsPort);

console.log("SS Watcher WS server running on ws://localhost:" + wsPort);

// create mongo connection and make a db

var mongoServer  = new mongo.Server(mongoHost, mongoPort, {});

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
