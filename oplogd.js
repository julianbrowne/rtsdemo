
// variant of server.js that monitors oplog
// and returns new copies of documents

var http    = require('http');
var socket  = require('socket.io');
var mongo   = require('mongodb');
require('./lib/cursorextension.js').extendCursor(mongo);
var content = require('node-static');
var utils   = require('./lib/utils.js');

var dbname   = 'local';
var collname = 'oplog.rs';
var nodePort = 8011;
var rsNode1  = 8002;            // mongo server 1
var rsNode1  = 8003;            // mongo server 2

// create file handler for local http server

var file = new(content.Server)('./public/oplogd');
var handler = function (request, response) {
    request.addListener('end', function () { file.serve(request, response); });
}

// start socket server

var socketsApp = http.createServer(handler);
var io = socket.listen(socketsApp);
socketsApp.listen(nodePort);
console.log("HTTP server running on http://localhost:" + nodePort);

//  Create mongo connection to Replica Set
//
//  Running two-nodes
//      - first on 9001
//      - second on 9002
//      - rep set name 'rtsdemo'
//
//  Script to start the rep set is ${RTSDEMO}/mongodb/rs.start.sh
//

var repSet = new mongo.ReplSetServers([
        new mongo.Server('localhost', 8002, { auto_reconnect: true } ),
        new mongo.Server('localhost', 8003, { auto_reconnect: true } )
    ]
);

var dbConnection = new mongo.Db(dbname, repSet, {});

// Open db and wait for browser to connect

dbConnection.open(function(error,db){

    if(error)
    {
        console.error("Open database failed. Is the Replica Set up?");
        process.exit(1);
    }

    var coll = db.collection(collname);

    io.sockets.on('connection', function (socket) {
        console.log('Received browser connection.');
        utils.readAndSend(socket, coll, 'oplog-channel');
    });

});
