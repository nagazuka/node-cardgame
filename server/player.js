"use strict";

var _ = require('underscore');

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
  var p1 = new Player('A1', 0, true, teams[0]);
  var p2 = new Player('B1', 1, false, teams[1]);
  var p3 = new Player('A2', 2, false, teams[0]);
  var p4 = new Player('B2', 3, false, teams[1]);
  
  var players = [p1, p2, p3, p4];
  return players;
}

var getHighestRankedCard = function(cards) {
  return _.max(cards, function(c) {
    return c.rank;
  });
}

var getLowestRankedCard = function(cards) {
  return _.min(cards, function(c) {
    return c.rank;
  });
}

var getHighestCardBySuit = function (cards, suit) {
  var sameSuitCards = _.where(cards, {'suit': suit});
  return getHighestRankedCard(sameSuitCards);
}

var beatsMove = function(winner, challenger, trumpSuit) {
  var winnerCard = winner.card;
  var challengerCard = challenger.card;
  console.log("Winner %j", winnerCard);
  console.log("Challenger %j", challengerCard);
  if (winnerCard.suit == challengerCard.suit) {
    return winnerCard.rank > challengerCard.rank;
  } else if (challengerCard.suit == trumpSuit) {
    return true; 
  } else {
    return false;
  }
};

var isMyTeamWinning = function(player, hand, trumpSuit) {
  if (hand.playerMoves.length > 0) {
    var winningMove = getWinningMove(hand);
    console.log("ismyteamwinning winningmove %j ", winningMove);
    var winningPlayer = winningMove.player;
    return (winningMove != null && player.team == winningPlayer.team);
  } else {
    return false;
  }
};

var getWinningMove = function(hand, trumpSuit) {
  var playerMoves = hand.playerMoves;
  var num = playerMoves.length;
  
  console.log("Looking for Winning move in hand %j", playerMoves);

  var winningMove = null;
  if (num == 1) {
    //first move is always winning moves
    console.log("First move winning");
    winningMove = playerMoves[0];
  } else if (num > 1) {
    console.log("Traversing other moves");
    winningMove = playerMoves[0];
    var i;
    var otherMoves = _.rest(playerMoves);
    for (i in otherMoves) {
      var move = otherMoves[i]; 
      var stillWinning = beatsMove(winningMove, move, trumpSuit); 
      console.log("beatsMove response %s", stillWinning);
      winningMove = stillWinning ? winningMove : move;
    }
  } else {
    //no moves yet played, so no winning move
    winningMove = null;
  }
  console.log("Winning move %j", winningMove);
  return winningMove;
}

//TODO: don't always use highest trump card, but keep slightly higher than required
//TODO: don't play highest card when somebody already cut with trump
var getNextMove = function(player, remainingCards, hand, trumpSuit) {
        console.log("getnextmove player %j ", player);
        var onWinningTeam = isMyTeamWinning(player, hand, trumpSuit);
        console.log("Is my team winning? Answer: %s", onWinningTeam);
        console.log("Remaining cards in getNextMove %j", remainingCards);
        var choice = null;
        if (hand.size() > 0) {
            var askedSuit = hand.getAskedSuit();
            console.log("Asked suit %s", askedSuit);
            var candidates = _.where(remainingCards, {'suit': askedSuit});
            var trumps = _.where(remainingCards, {'suit': trumps});
            console.log("Candidates %j", candidates);
            if (candidates.length > 0) {
                if (onWinningTeam) {
                  console.log("Has same suit and on winning team");
                  choice = getLowestRankedCard(candidates);
                } else {
                  console.log("Has same suit and NOT on winning team");
                  choice = getHighestRankedCard(candidates);
                }
            } else if (trumps.length > 0) {
                if (onWinningTeam) {
                  console.log("Has no same suit, has trump suit and on winning team");
                  var otherSuits = difference(remainingCards, trumps);
                  choice = getLowestRankedCard(otherSuits);
                } else {
                  console.log("Has no same suit, has trump suit and NOT on winning team");
                  choice = getHighestCardBySuit(remainingCards, trumpSuit);
                }
            } else {
              console.log("Has no same suit, has no trump suit");
              choice = getLowestRankedCard(remainingCards);
            }
        } else {
          choice = getLowestRankedCard(remainingCards);
        }
        console.log("choice %s", choice); 

        return choice;
};

module.exports = {
  Player: Player,
  createPlayers: createPlayers,
  getNextMove: getNextMove
}
