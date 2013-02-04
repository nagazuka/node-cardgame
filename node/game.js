var _ = require("underscore");
var database = require('./database');
var players = require('./player');
var cards = require('./cards');

var humanPlayerIndex = 0;
var playingOrder = [2, 3, 0, 1];
var playerList = [];
var playerCards = {};
var trumpSuit;

exports.startGame = function(req, res) {
  cards.createDeck();
  cards.shuffleDeck();

  var teams = [req.playerTeam, req.opponentTeam];

  database.incr('game_id', function(err, data) {
    var gameId = data.toString(36);
    playerList = players.createPlayers(teams);
    var jsonResponse = {response:'startGame', gameId: gameId, players: playerList, playingOrder: playingOrder};
    res(jsonResponse);
  });
};

var isHumanPlayerFirst = function() {
  return humanPlayerIndex == playingOrder[0];
};

var getPlayerById = function(id) {
  var result = _.find(players, function(player) {
    return player.id == id;
  });
  return result;
}

var decideTrump = function() {
  var firstPlayerIndex = playingOrder[0];
  var firstCards = playerCards[firstPlayerIndex];
  return firstCards[0].suit;
}

exports.dealFirstCards = function(req, res) {
  _.each(playerList, function(player) {
    console.log('player %j', player);
    var newCards = cards.removeCards(5); 
    console.log('player %j adding newCards %j', player, newCards);
    playerCards[player.index] = newCards;
  });

  if (!isHumanPlayerFirst()) {
    trumpSuit = decideTrump();
  }

  var firstCards = playerCards[humanPlayerIndex];
  
  var jsonResponse = { response:'dealFirstCards', cards: firstCards, trumpSuit: trumpSuit};
  res(jsonResponse);
};

exports.chooseTrump = function(req, res) {

  if (!isHumanPlayerFirst()) {
    trumpSuit = req['suit'];
  }

  while (cards.hasMoreCards()) {
    _.each(playerList, function(player) {
      var newCards = cards.removeCards(4);
      console.log('player %j adding newCards %j', player, newCards);
      playerCards[player.index] = newCards.concat(playerCards[player.index]); 
    });
  } 

  var humanPlayerCards = playerCards[humanPlayerIndex];

  var jsonResponse = { response:'allCards', trumpSuit: trumpSuit, cards: humanPlayerCards};
  res(jsonResponse);

};

