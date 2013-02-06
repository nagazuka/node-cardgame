"use strict";

var _ = require('underscore'),
  database = require('./database'),
  players = require('./player'),
  cards = require('./cards'),
  rules = require('./rules');

//constants
var humanPlayerId = 'A1';

// Class definitions
var HandInfo = cards.HandInfo;
var Card = cards.Card;
var Deck = cards.Deck;
var PlayerMove = cards.PlayerMove;

// Game state variables
exports.GameState = function() {
  this.playingOrder = [0, 1, 2, 3];
  this.playerList = [];
  this.playerCards = {};
  this.trumpSuit;
  this.hand = new HandInfo();
  this.teamScores = {};
  this.deck;
}

//Exposed methods

exports.isReady = function(state, req, res) {
  if (rules.isGameDecided(state.teamScores)) {
      var winningTeam = rules.getWinningTeam(state.teamScores);
      console.log("Winning team: %j", winningTeam);
      processWin(state, winningTeam);
      var jsonResponse = {'response': 'gameDecided', 
        'scores': {'teamScore': state.teamScores},
        'winningTeam': winningTeam}
      res(jsonResponse);
  } else {
    state.hand = new HandInfo();
    askPlayers(state, res);
  }
}

exports.makeMove = function(state, req, res) {
  var playerId = req['playerId'];
  var player = getPlayerById(state, playerId);
  var playedCard = new Card(req['rank'], req['suit']);
  var remainingCards = getPlayerCards(state, player);

  var playerMove = new PlayerMove(player, playedCard);
  var isValidMove = rules.validatePlayerMove(state.hand, playerMove, state.trumpSuit, remainingCards);
  if (!isValidMove) {
    var response = {'response': 'invalidMove', 'playerId': req['playerId']}
    res(response);
  } else {
    state.hand.addPlayerMove(playerMove);
    removePlayerCardByMove(state, playerMove);
    askPlayers(state, res);
  }
}  

exports.startGame = function(state, req, res) {
  resetGame(state);
  state.deck = new Deck();
  state.deck.shuffleDeck();
  var teams = [req.playerTeam, req.opponentTeam];

  database.incr('game_id', function(err, data) {
    var gameId = data.toString(36);
    state.playerList = players.createPlayers(teams);
    clearTeamScores(state);
    var jsonResponse = {response:'startGame', gameId: gameId, players: state.playerList, playingOrder: state.playingOrder};
    res(jsonResponse);
  });
};

exports.nextGame = function(state, req, res) {
  var jsonResponse = {'response': 'nextGame'};
  jsonResponse['playingOrder'] = state.playingOrder;
  jsonResponse['resultCode'] = 'SUCCESS';

  clearGame(state);
  clearTeamScores(state);

  res(jsonResponse);
};


exports.dealFirstCards = function(state, req, res) {
  _.each(state.playerList, function(player) {
    console.log('player %j', player);
    var newCards = state.deck.removeCards(5); 
    console.log('player %j adding newCards %j', player, newCards);
    state.playerCards[player.id] = newCards;
  });

  if (!isHumanPlayerFirst(state)) {
    state.trumpSuit = decideTrump(state);
  }

  var firstCards = state.playerCards[humanPlayerId];
  var jsonResponse = { response:'dealFirstCards', cards: firstCards, trumpSuit: state.trumpSuit};
  res(jsonResponse);
};

exports.chooseTrump = function(state, req, res) {
  if (isHumanPlayerFirst(state)) {
    state.trumpSuit = req['suit'];
  }

  while (state.deck.hasMoreCards()) {
    _.each(state.playerList, function(player) {
      var newCards = state.deck.removeCards(4);
      console.log('player %j adding newCards %j', player, newCards);
      state.playerCards[player.id] = newCards.concat(state.playerCards[player.id]); 
    });
  } 

  var humanPlayerCards = state.playerCards[humanPlayerId];

  var jsonResponse = { response:'allCards', trumpSuit: state.trumpSuit, cards: humanPlayerCards};
  res(jsonResponse);

};

//Utility methods

var isHumanPlayerFirst = function(state) {
  console.log("isHumanPlayerFirst playingOrder[0]: %d", state.playingOrder[0]);
  console.log("isHumanPlayerFirst 0 == playingOrder[0]: %s", 0 == state.playingOrder[0]);
  console.log("isHumanPlayerFirst 0 === playingOrder[0]: %s", 0 === state.playingOrder[0]);

  return 0 == state.playingOrder[0];
};

var getPlayerById = function(state,id) {
  var result = _.find(state.playerList, function(player) {
    return player.id == id;
  });
  return result;
}

var getPlayerByIndex = function(state, index) {
  var result = _.find(state.playerList, function(player) {
    return player.index == index;
  });
  return result;
}

var decideTrump = function(state) {
  var player = getStartingPlayer(state);
  var firstCards = state.playerCards[player.id];
  return firstCards[0].suit;
}

var getStartingPlayer = function(state) {
  return getPlayerByIndex(state, state.playingOrder[0]);
}

var processWin = function(state, winningTeam) {
  var currentStartingPlayer = getStartingPlayer(state)
    if (currentStartingPlayer.team == winningTeam) {
      console.log("Current starting player is in winning team, not changing playing order")
    } else  {
      console.log("Winning is opposing team, advancing playing order");
      advancePlayingOrder(state);
    }
};

var askPlayers = function(state,res) {
  console.log("Asking all players for their move");
  var jsonResponse = {'response': 'handPlayed'}

  while (!state.hand.isComplete()) {
    var player = getNextPlayer(state, state.hand.getStep());
    console.log("Asking player with id %s for move", player.id)

    // if human, ask asynchronously via websocket
    if (player.isHuman == true) {
      var message = {};
      message['response'] = 'askMove';
      message['hand'] = convertHand(state, state.hand);
      res(message);
      break;
    } else {
      var remainingCards = getPlayerCards(state, player);
      var card = players.getNextMove(player, remainingCards, state.hand, state.trumpSuit);

      state.hand.addPlayerMove(new PlayerMove(player, card));
      console.log("Player with id %s played %j", player.id, card);

      removePlayerCard(state, player, card);
    }
  }

  if (state.hand.isComplete()) {
    console.log("Hand is complete, deciding winner now");
    var winningMove = rules.decideWinner(state.hand, state.trumpSuit);
    var winningPlayer = winningMove.player;

    console.log("Winner is %s\n", winningPlayer);

    registerWin(state, winningPlayer);
    var scoreList = {'teamScore': state.teamScores};

    changePlayingOrder(state, winningPlayer);

    jsonResponse['hand'] = convertHand(state, state.hand);
    jsonResponse['winningCard'] = winningMove.card;
    jsonResponse['winningPlayerId'] = winningPlayer.id;
    jsonResponse['scores'] = scoreList;
    res(jsonResponse);
  } 
  
};

var advancePlayingOrder = function(state) {
  console.log("oldPlayingOrder %j", state.playingOrder);
  var newPlayingOrder = _.rest(state.playingOrder, 1).concat(_.first(state.playingOrder));
  console.log("newPlayingOrder %j", newPlayingOrder);
  state.playingOrder = newPlayingOrder;
};

var changePlayingOrder = function(state,player) {
  while (player.index != state.playingOrder[0]) {
    advancePlayingOrder(state); 
  }
};

var getNextPlayer = function(state,step) {
  console.log("step %d", step);
  var index = state.playingOrder[step];
  console.log("index %d", index);
  var player = getPlayerByIndex(state, index);
  console.log("player %j", player);
  return player;
};

var getPlayerCards = function(state, player) {
  var cards = state.playerCards[player.id];
  return cards;
};

var removePlayerCard = function(state, player, card) {
  var cards = state.playerCards[player.id];
  console.log("player cards size %d", cards.length);
  var filtered = _.filter(cards, function(c) {
    return !(c.rank == card.rank && c.suit == card.suit);
  }); 
  console.log("filtered size %d", filtered.length);
  state.playerCards[player.id] = filtered;
};

var removePlayerCardByMove = function(state, playerMove) {
  var player = playerMove.player;
  var card = playerMove.card;
  removePlayerCard(state, player, card);
};

var registerWin = function(state,player) {
  var team = player.team;
  if (team in state.teamScores) {
    state.teamScores[team] = state.teamScores[team] + 1;
  } else {
    state.teamScores[team] = 1;
  }
};

var clearTeamScores = function(state,player) {
  var team;
  var allTeams = _.pluck(state.playerList, "team");
  var i;
  for (i in allTeams) {
    var team = allTeams[i];
    state.teamScores[team] = 0;
  } 
};

var convertHand = function(state, hand) {
  var playerMoves = hand.playerMoves;
  _.map(playerMoves, function(move) {
    move.playerId = move.player.id;
  });
  return hand.playerMoves;
};

var resetGame = function(state) {
  state.playingOrder = [0, 1, 2, 3];
  state.playerList = [];
  clearGame(state);
};

var clearGame = function(state) {
  state.deck = new Deck();
  state.deck.shuffleDeck();
  state.playerCards = {};
  state.teamScores = {};
  state.trumpSuit = undefined;
  state.hand = new HandInfo();
};
