var database = require('./database');
var players = require('./player');
var db = database.client;

exports.startGame = function(req, res) {
    var teams = [req.playerTeam, req.opponentTeam];

    db.incr('game_id', function(err, data) {
      var gameId = data.toString(36);
      console.log("Game ID: %s", gameId);

      var playerList = players.createPlayers(teams);

      var jsonResponse = { response:'startGame', gameId: gameId, players: playerList};
      res(jsonResponse);
      //res.send(JSON.stringify(jsonResponse));
    });
};

exports.firstCards = function(req, res) {
    res.send({id:req.params.id, name: "The Name", description: "description"});
};
