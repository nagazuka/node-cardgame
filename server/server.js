var app = require('http').createServer()
  , io = require('socket.io').listen(app)
  , game = require('./game')
  , config = require('../shared/config')

var port = config.network.port;
console.log("Server started, listening at port %d", port);
app.listen(port);

io.sockets.on('connection', function (socket) {
  socket.on('message', function (data) { 
    var json = JSON.parse(data);
    console.log('received message %s', json['command']);
    var command = json['command'] 
    console.log("command %s", command);
    if(typeof game[command] === 'function') {
      game[command](json, function(response) {
        var response = JSON.stringify(response);
        socket.send(response);
      }
      );
    } else {
      console.log('Command [%s] not found in game', command);
    }

  });
  socket.on('disconnect', function () { 
    console.log('disconnected');
  });
});
