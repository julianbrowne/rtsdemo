/**
 *
 *  RTS Demo - Replica Set Watcher
 *
**/

var http    = require('http');
var socket  = require('socket.io');
var mongo   = require('mongodb');
require('./lib/cursorextension.js').extendCursor(mongo);
var utils   = require('./lib/utils.js');

// mongo/demo settings

var mongoHost = 'localhost';
var mongoPrt1 = 8002;
var mongoPrt2 = 8003;
var dbname    = 'local';
var collname  = 'oplog.rs';

var wsPort  = 8012;

// start socket server

var socketsApp = http.createServer();
var io = socket.listen(socketsApp);
io.set('log level', 1);
socketsApp.listen(wsPort);

console.log("SS Watcher WS server running on ws://localhost:" + wsPort);

//  Create mongo connection to Replica Set

var repSet = new mongo.ReplSetServers([
        new mongo.Server(mongoHost, mongoPrt1, { auto_reconnect: true } ),
        new mongo.Server(mongoHost, mongoPrt2, { auto_reconnect: true } )
    ]
);

var dbConnection = new mongo.Db(dbname, repSet, {});

// Open db and wait for browser to connect

dbConnection.open(function(error,db){

    if(error)
    {
        console.error("Error: Open database failed. Is the Replica Set up?");
        process.exit(1);
    }

    var coll = db.collection(collname);

    io.sockets.on('connection', function (socket) {
        console.log('Received browser connection.');
        utils.readAndSend(socket, coll, 'oplog-channel');
    });

});
