
var readAndSend =function (socket, collection, channel)
{
    console.log('Initiating tailable cursor.');

    collection.find({}, {'tailable': 1 }, function(err, cursor) {

        console.log('Cursor initiated.');

        cursor.intervalEach(300, function(error, item) {

            if(error)
                console.error('Error : ' + error);

            if(item != null)
            {
                socket.emit(channel, item);
            }
        });

    });

};

exports.readAndSend = readAndSend;
