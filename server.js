var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    nodeStatic = require('node-static'); // for serving files

// This will make all the files in the current folder
// accessible from the web
var fileServer = new nodeStatic.Server('./');

// This is the port for our web server.
// you will need to go to http://localhost:8080 to see it
app.listen(8080);

// Delete this row if you want to see debug messages
io.set('log level', 1);

// Array with some colors
var colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];
// ... in random order
colors.sort(function(a, b) {
    return Math.random() > 0.5;
});

// If the URL of the socket server is opened in a browser
function handler (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response); // this will return the correct file
    });
}

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

io.sockets.on('connection', function (socket) {
    // Do stuff on connect?
    var userName = false;
    var userColour = false;

    // echo the message
     socket.on('message', function (data) {
        if (userName === false) { // first message sent by user is their name
            // remember user name
            userName = htmlEntities(data);
            // get random color and send it back to the user
            userColour = colors.shift();
            socket.broadcast.emit('joined', JSON.stringify({
                name: userName,
                colour: userColour
            }));

            console.log((new Date()) + ' User is known as: ' + userName + ' with ' + userColour + ' colour.');
        }
        else { // log and broadcast the message
            console.log((new Date()) + ' Received Message from ' + userName + ': ' + data);

            // we want to keep history of all sent messages
//            var obj = {
//                time: (new Date()).getTime(),
//                text: htmlEntities(data.utf8Data),
//                author: userName,
//                color: userColor
//            };
//            history.push(obj);
//            history = history.slice(-100);

            // broadcast message to all connected clients
            socket.broadcast.emit('message', JSON.stringify({
                name: userName,
                message: data,
                colour: userColour
            }));
        }
    });
});