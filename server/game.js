"use strict";

var _ = require('underscore'),
  database = require('./database'),
  players = require('./player'),
  cards = require('./cards'),
  rules = require('./rules');

// Class definitions
var HandInfo = require('./handinfo');
var Card = cards.Card;
var Deck = cards.Deck;
var PlayerMove = cards.PlayerMove;

// Game state variables
var humanPlayerIndex = 0;
var playingOrder = [0, 1, 2, 3];
var playerList = [];
var playerCards = {};
var trumpSuit;
var hand = new HandInfo();
var teamScores = {};
var deck;

//Exposed methods

exports.isReady = function(req, res) {
  if (rules.isGameDecided(teamScores)) {
      var winningTeam = getWinningTeam();
      console.log("Winning team: %j", winningTeam);
      processWin(winningTeam);
      var jsonResponse = {'response': 'gameDecided', 
        'scores': {'teamScore': teamScores},
        'winningTeam': winningTeam}
      res(jsonResponse);
  } else {
    hand = new HandInfo();
    askPlayers(res);
  }
}

exports.makeMove = function(req, res) {
  var playerId = req['playerId'];
  var player = getPlayerById(playerId);
  var playedCard = new Card(req['rank'], req['suit']);
  var remainingCards = getPlayerCards(player);

  var playerMove = new PlayerMove(player, playedCard);
  var isValidMove = rules.validatePlayerMove(hand, playerMove, trumpSuit, playerCards);
  if (!isValidMove) {
    response = {'response': 'invalidMove', 'playerId': req['playerId']}
    res(response);
  } else {
    hand.addPlayerMove(playerMove);
    removePlayerCardByMove(playerMove);
    askPlayers(res);
  }
}  

exports.startGame = function(req, res) {
  resetGame();
  deck = new Deck();
  deck.shuffleDeck();
  var teams = [req.playerTeam, req.opponentTeam];

  database.incr('game_id', function(err, data) {
    var gameId = data.toString(36);
    playerList = players.createPlayers(teams);
    var jsonResponse = {response:'startGame', gameId: gameId, players: playerList, playingOrder: playingOrder};
    res(jsonResponse);
  });
};

exports.dealFirstCards = function(req, res) {
  _.each(playerList, function(player) {
    console.log('player %j', player);
    var newCards = deck.removeCards(5); 
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
  if (isHumanPlayerFirst()) {
    trumpSuit = req['suit'];
  }

  while (deck.hasMoreCards()) {
    _.each(playerList, function(player) {
      var newCards = deck.removeCards(4);
      console.log('player %j adding newCards %j', player, newCards);
      playerCards[player.index] = newCards.concat(playerCards[player.index]); 
    });
  } 

  var humanPlayerCards = playerCards[humanPlayerIndex];

  var jsonResponse = { response:'allCards', trumpSuit: trumpSuit, cards: humanPlayerCards};
  res(jsonResponse);

};

//Utility methods

var isHumanPlayerFirst = function() {
  console.log("isHumanPlayerFirst playingOrder[0]: %d", playingOrder[0]);
  console.log("isHumanPlayerFirst 0 == playingOrder[0]: %s", 0 == playingOrder[0]);
  console.log("isHumanPlayerFirst 0 === playingOrder[0]: %s", 0 === playingOrder[0]);

  return 0 == playingOrder[0];
};

var getPlayerById = function(id) {
  var result = _.find(playerList, function(player) {
    return player.id == id;
  });
  return result;
}

var getPlayerByIndex = function(index) {
  var result = _.find(playerList, function(player) {
    return player.index == index;
  });
  return result;
}

var decideTrump = function() {
  var firstPlayerIndex = playingOrder[0];
  var firstCards = playerCards[firstPlayerIndex];
  return firstCards[0].suit;
}

var getStartingPlayer = function() {
  return getPlayerByIndex(playingOrder[0]);
}

var processWin = function(winningTeam) {
  var currentStartingPlayer = getStartingPlayer()
    if (currentStartingPlayer.team == winningTeam) {
      console.log("Current starting player is in winning team, not changing playing order")
    } else  {
      console.log("Winning is opposing team, advancing playing order");
      advancePlayingOrder();
    }
};

var askPlayers = function(res) {
  console.log("Asking all players for their move");
  var jsonResponse = {'response': 'handPlayed'}

  while (!hand.isComplete()) {
    var player = getNextPlayer(hand.getStep());
    console.log("Asking player with id %s for move", player.id)

    // if human, ask asynchronously via websocket
    if (player.isHuman == true) {
      var message = {};
      message['response'] = 'askMove';
      message['hand'] = convertHand(hand);
      res(message);
      break;
    } else {
      var remainingCards = getPlayerCards(player);
      var card = players.getNextMove(player, remainingCards, hand, trumpSuit);

      hand.addPlayerMove(new PlayerMove(player, card));
      console.log("Player with id %s played %j", player.id, card);

      removePlayerCard(player, card);
    }
  }

  if (hand.isComplete()) {
    console.log("Hand is complete, deciding winner now");
    var winningMove = rules.decideWinner(hand, trumpSuit);
    var winningPlayer = winningMove.player;

    console.log("Winner is %s\n", winningPlayer);

    registerWin(winningPlayer);
    var scoreList = {'teamScore': teamScores};

    changePlayingOrder(winningPlayer);

    jsonResponse['hand'] = convertHand(hand);
    jsonResponse['winningCard'] = winningMove.card;
    jsonResponse['winningPlayerId'] = winningPlayer.id;
    jsonResponse['scores'] = scoreList;
    res(jsonResponse);
  } 
  
};

var advancePlayingOrder = function() {
  console.log("oldPlayingOrder %j", playingOrder);
  var newPlayingOrder = _.rest(playingOrder, 1).concat(_.first(playingOrder));
  console.log("newPlayingOrder %j", newPlayingOrder);
  playingOrder = newPlayingOrder;
};

var changePlayingOrder = function(player) {
  while (player.index != playingOrder[0]) {
    advancePlayingOrder(); 
  }
};

var getNextPlayer = function(step) {
  console.log("step %d", step);
  var index = playingOrder[step];
  console.log("index %d", index);
  var player = getPlayerByIndex(index);
  console.log("player %j", player);
  return player;
};

var getPlayerCards = function(player) {
  return playerCards[player.index];
};

var removePlayerCard = function(player, card) {
  var cards = playerCards[player.index];
  console.log("player cards size %d", cards.length);
  var filtered = _.filter(cards, function(c) {
    return !(c.rank == card.rank && c.suit == card.suit);
  }); 
  console.log("filtered size %d", filtered.length);
  playerCards[player.index] = filtered;
};

var removePlayerCardByMove = function(playerMove) {
  var player = playerMove.player;
  var card = playerMove.card;
  removePlayerCard(player, card);
};

var registerWin = function(player) {
  var team = player.team;
  if (team in teamScores) {
    teamScores[team] = teamScores[team] + 1;
  } else {
    teamScores[team] = 1;
  }
};

var getWinningTeam = function(player) {
  return _.max(scores);
};

var convertHand = function(hand) {
  var playerMoves = hand.playerMoves;
  _.map(playerMoves, function(move) {
    move.playerId = move.player.id;
  });
  return hand.playerMoves;
};

var resetGame = function() {
  playingOrder = [0, 1, 2, 3];
  playerList = [];
  playerCards = {};
  teamScores = {};
  trumpSuit = undefined;
  hand = new HandInfo();
};
