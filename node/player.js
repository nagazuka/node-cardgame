function Player(id, index, isHuman, team) {
   this.id = id;
   this.index = index;
   this.isHuman = isHuman;
   this.team = team;
}

var createPlayer = function (id, index, isHuman, team) {
  return new Player(id, index, isHuman, team);
  //return {'id': id, 'index': index, 'isHuman': isHuman, 'team': team};
}

var createPlayers = function(teams) {
  var i;
  var players = [];
  for(i = 0; i < 4; i++) {
    var isHuman = i == 2;
    var teamName = i % 2 == 0 ? teams[0]  : teams[1]; 
    var player = createPlayer(i+1, i, isHuman, teamName);
    players.push(player);
  } 
  return players;
}

module.exports = {
  createPlayers: createPlayers
}
