"use strict";

var _ = require("underscore");

//Constant definitions
var maximumMoves = 4;
var values = _.range(2, 15);
var suits = ["SPADES", "CLUBS", "HEARTS", "DIAMONDS"];

function Card(rank, suit) {
    this.rank = rank;
    this.suit = suit;
}

function PlayerMove(player, card) {
  this.player = player;
  this.card = card;
  this.sequenceNumber = -1;
};

function Deck() {
  this.cards = [];
  this.createDeck();
}

Deck.prototype.createDeck = function() {
    var self = this;
    _.each(values, function(value) {
      _.each(suits, function(suit) {
          var card = new Card(value, suit);
          self.cards.push(card);
      });
    });
};

Deck.prototype.shuffleDeck = function() {
    this.cards = _.shuffle(this.cards);
};

Deck.prototype.hasMoreCards = function() {
  return this.cards.length > 0;
};

Deck.prototype.removeCards = function(n) {
    console.log("Deck size before remove %d", this.cards.length);
    var removed = _.first(this.cards, n);
    this.cards = _.rest(this.cards, n);
    console.log("Deck size after remove %d", this.cards.length);
    return removed;
};


function HandInfo() {
  this.playerMoves = [];
  this.count = 0;
}

HandInfo.prototype.getStep = function() {
  return this.playerMoves.length;
}

HandInfo.prototype.isComplete = function() {
  return this.playerMoves.length == maximumMoves;
}

HandInfo.prototype.size = function() {
  return this.playerMoves.length;
}

HandInfo.prototype.getAskedSuit = function() {
  if (this.playerMoves.length > 0) {
    return this.playerMoves[0].card.suit;
  }
}

HandInfo.prototype.addPlayerMove = function(move) {
        this.count++;
        move.sequenceNumber = this.count;
        this.playerMoves.push(move)
};

module.exports = {
  HandInfo: HandInfo,
  Card: Card,
  Deck: Deck,
  PlayerMove: PlayerMove
}
