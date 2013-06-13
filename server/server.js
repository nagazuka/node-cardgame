var app = require('http').createServer()
  , io = require('socket.io').listen(app)
  , game = require('./game')
  , config = require('../shared/config')

//Class definitions
var GameState = game.GameState;

//Config server port
var port = config.network.port;
console.log("Server started, listening at port %d", port);
app.listen(port);

//config Socket.IO
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file

//Start Socket.IO listener
io.sockets.on('connection', function (socket) {
  var state = new GameState();
  socket.on('message', function (data) { 
    try {

      var json = JSON.parse(data);
      console.log('received message %s', json['command']);
      var command = json['command'];
      console.log("command %s", command);

      if(typeof game[command] === 'function') {
        game[command](state, json, function(response) {
          var response = JSON.stringify(response);
          socket.send(response);
        }
        );
      } else {
        console.log('Command [%s] not found in game', command);
      } 

    } catch (err) {
      console.log("ERROR: Unexpected exception occured: %s", err.message);
      console.log(err.stack);
      var errorResponse = {response: "exception", resultMessage: "SERVER ERROR: " + err.message};
      var response = JSON.stringify(errorResponse);
      socket.send(response);
    }

  });
  socket.on('disconnect', function () { 
    console.log('disconnected');
  });
});
