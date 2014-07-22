
var readAndSend = function (socket, collection, channel) { 

    console.log('Initiating tailable cursor');

    var dataStream = collection.find({}, {tailable: true, awaitdata: true}).stream();

    dataStream.on('data', function(item) { 
        socket.emit(channel, item);
    });

    dataStream.on('error', function(error) { 
        console.error("RTS Demo: error serving %s", error);
    });

};

exports.readAndSend = readAndSend;
