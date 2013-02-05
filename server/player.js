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
  sameSuitCards = _.where(cards, {'suit': suit});
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
