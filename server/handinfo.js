var _ = require('underscore');

var maximumMoves = 4;

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

module.exports = HandInfo;
