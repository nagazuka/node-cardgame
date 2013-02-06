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
  var p1 = new Player(1, 0, true, teams[0]);
  var p2 = new Player(2, 1, false, teams[0]);
  var p3 = new Player(3, 2, false, teams[1]);
  var p4 = new Player(4, 3, false, teams[1]);
  
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

//TODO: check whether teammate is making this hand, adjust strategy
//TODO: don't always use highest trump card, but keep slightly higher than required
//TODO: don't play highest card when somebody already cut with trump
var getNextMove = function(player, remainingCards, hand, trumpSuit) {
        var choice = null;
        if (hand.size() > 0) {
            var askedSuit = hand.getAskedSuit();
            var candidates = _.where(remainingCards, {'suit': askedSuit});
            if (candidates.length > 0) {
                choice = getHighestRankedCard(candidates)
            } else {
                choice = getHighestCardBySuit(remainingCards, trumpSuit);
            }
        }
 
        if (choice == null) {
            choice = getLowestRankedCard(remainingCards);
        }

        return choice;
};

module.exports = {
  Player: Player,
  createPlayers: createPlayers,
  getNextMove: getNextMove
}
