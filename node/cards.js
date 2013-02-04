var _ = require("underscore");

var values = _.range(2, 15)
var suits = ["SPADES", "CLUBS", "HEARTS", "DIAMONDS"]

var deck = [];

function Card(rank, suit) {
    this.rank = rank;
    this.suit = suit;
}

var createDeck = function() {
    _.each(values, function(value) {
      _.each(suits, function(suit) {
          var card = new Card(value, suit);
          deck.push(card);
      });
    });
};

var shuffleDeck = function() {
    deck = _.shuffle(deck);
};

var hasMoreCards = function() {
  return deck.length > 0;
};

var removeCards = function(n) {
    var removed = _.first(deck, n);
    deck = _.rest(deck, n);
    return removed;
};

module.exports = {
  createDeck: createDeck,
  shuffleDeck: shuffleDeck,
  hasMoreCards: hasMoreCards,
  removeCards: removeCards
}
