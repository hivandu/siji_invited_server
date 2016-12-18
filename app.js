var express = require('express'),
    app = express(),
    MongoClient = require('mongodb');
var server = require("http").Server(app);
var socket = require("socket.io").listen(server);

server.listen(89, '120.26.48.94');
console.log('Server running at 120.26.48.94:89');

//  connect to mongo
MongoClient.connect('mongodb://localhost:27017/siji_invited', function (err, db) {
    if (err) throw err;
	console.log('connected to mongo');

    /** socket on */
    // Run the server
    init();

    // Initialization
    function init() {
        setEventHandlers();
    }

    // Event handlers
    function setEventHandlers() {
        // Socket.IO
        socket.on("connection", onSocketConnection);
    }


    // New socket connection
    function onSocketConnection(socket) {
        console.log('Someone comes here!!!!');

        //  on visited
        socket.on('visited', onVisitedHandler);

        function onVisitedHandler (data) {
            var that = this;

            console.log('someone join to this game');

            //  update visitedNumber
            db.collection('visitedNumber').update({"visitedNumber": {$exists: 1}}, {$inc: {"visitedNumber": 1}});

            var visitedNumber = null;

            //  query visitedNumber
            db.collection("visitedNumber").find({"visitedNumber": {$exists: 1}}).toArray(function (err, docs) {
                visitedNumber = docs[0]['visitedNumber'];
                console.log('visited number: ', visitedNumber);

                // if in idlist length
                if (visitedNumber <= 117) {
                    //  calculate this user's id then return to client
                    db.collection("userList").find({"userList": {$exists: 1}}).toArray(function (err, docs) {
                        var userList = docs[0]["userList"];
                        var userid = userList[visitedNumber];

                        console.log('got id: ', userid);
                        that.emit('returnedId', userid);
                    });
                } else {
                    that.emit('returnedId', "发放结束");
                }
            });
        }
    }
});
