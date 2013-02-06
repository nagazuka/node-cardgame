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

//TODO: check whether teammate is making this hand, adjust strategy
//TODO: don't always use highest trump card, but keep slightly higher than required
//TODO: don't play highest card when somebody already cut with trump
var getNextMove = function(player, remainingCards, hand, trumpSuit) {
        console.log("Remaining cards in getNextMove %j", remainingCards);
        var choice = null;
        if (hand.size() > 0) {
            var askedSuit = hand.getAskedSuit();
            console.log("Asked suit %s", askedSuit);
            var candidates = _.where(remainingCards, {'suit': askedSuit});
            var trumps = _.where(remainingCards, {'suit': trumps});
            console.log("Candidates %j", candidates);
            if (candidates.length > 0) {
                console.log("Has same suit");
                choice = getHighestRankedCard(candidates)
            } else if (trumps.length > 0) {
                console.log("Has no same suit, has trump suit");
                choice = getHighestCardBySuit(remainingCards, trumpSuit);
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
