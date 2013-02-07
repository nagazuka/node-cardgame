'use strict';

(function(window, $, undefined) {

window.Card = Backbone.Model.extend({
});

window.CardList = Backbone.Collection.extend({
  model: Card
});

//window.cards = new CardList();

window.Player = Backbone.Model.extend({
});

window.PlayerList = Backbone.Collection.extend({
  model: Player
});

//window.players = new PlayerList();


window.PlayerMove = Backbone.Model.extend({
});

window.PlayerMoveList = Backbone.Collection.extend({
  model: PlayerMove
});

//window.playerMoves = new PlayerMoveList();

window.Game = Backbone.Model.extend({

  defaults: {
    view : null,
    handler : null,
    cards : [],
    players : [],
    playerMoves : [],
    playingOrder : [],
    selectedCard : null,
    playerName : null,
    playerTeam : null,
    cpuTeam : null
  },

  init: function() {
    this.view.drawBackground();
    this.initScores();
    this.start();
  },

  start: function() {
    this.handler.sendMessage({'command' : 'startGame', 'playerName' : this.playerName, 'playerTeam': this.playerTeam, 'opponentTeam': this.cpuTeam});
  },

  nextGame: function() {
    this.handler.sendMessage({'command' : 'nextGame', 'playerName' : this.playerName, 'playerTeam': this.playerTeam, 'opponentTeam': this.cpuTeam});
  },

  askFirstCards: function fn_askFirstCards () {
    this.handler.sendMessage({ 'command' : 'dealFirstCards', 'playerId' : this.get('humanPlayer').get('id')});
  },

  chooseTrump: function fn_chooseTrump (suit) {
    this.handler.sendMessage({'command' : 'chooseTrump', 'suit': suit, 'playerId' : this.get('humanPlayer').id});
  },

  chooseFakeTrump: function fn_chooseTrump () {
    this.handler.sendMessage({'command' : 'chooseTrump', 'playerId' : this.get('humanPlayer').id});
  },
  
  makeMove: function fn_makeMove (card) {
    this.handler.sendMessage({'command' : 'makeMove', 'rank' : card.get('rank'), 'suit': card.get('suit'), 'playerIndex' : 0, 'playerId' : this.get('humanPlayer').id});
    this.selectedCard = card;
    this.setCardClickHandler(this.noAction);
  },

  noAction: function fn_noAction (card) {
    this.view.drawText('Even geduld...', '');
  },

  sendReady: function() {
    this.handler.sendMessage({'command' : 'isReady'});
  },

  addCards: function(newCards) {
    var cards = this.get('cards');
    console.debug("Before addCards cards size: " + this.get('cards').length);
    cards = this.get('cards').concat(newCards);
    console.debug("After concat cards size: " + cards.length);
    //TODO: why the unique?
    cards = _.uniq(cards, false, function(c) {
      return c.get('suit') + '_' + c.get('rank');
    });
    console.debug("After uniq cards size: " + cards.length);
    this.set({'cards': cards});
    console.debug("After addCards cards size: " + this.get('cards').length);
  },

  sortCards: function() {
    var grouped = _.groupBy(this.cards, 'suit'); 
    _.each(grouped, function(cardList, index, list) {
      var sorted = _.sortBy(cardList, function(c) { return c.rank; });
      list[index] = sorted; 
    });
    var flattened = _.flatten(grouped);
    this.cards = flattened;
  },
  
  addPlayer: function(player) {
    if (player.get('isHuman')) {
      this.set({'humanPlayer': player});
      player.set({'name': this.playerName});
    } else {
      var team = player.get('team');
      var playerName = this.getRandomPlayerName(team);
      player.set({'name': playerName});
    }
    this.get('players').push(player);
  },

  getRandomPlayerName: function(team) {
    var nameList;
    if (team == 'Team Nederland') {
      nameList = names.MALE_NL;
    } else if (team == 'Team Suriname') {
      nameList = names.MALE_SU;
    }
    var  num = nameList.length;
    var index = Math.floor(Math.random() * num);
    return nameList[index];
  },

  getPlayerById: function(id) {
    var player = _.find(this.get('players'), function (p) { return p.id == id;});
    return player;
  },

  removeSelectedCard: function() {
    this.removeCard(this.selectedCard);
  },

  removeCard: function(card) {
    this.view.removePlayerCard(card);
    this.cards = _.without(this.cards, card);
   },

  clearCards: function() {
    this.view.clearPlayerCards();
    this.set({'cards':[]});
  },

  drawTrumpSuit: function(trumpSuit) {
    this.view.drawTrumpSuit(this.get('trumpSuit'));
  },
  
  drawText: function(text, subscript) {
    this.view.drawText(text, subscript);
  },

  drawError: function(heading, text) {
    this.view.drawError(heading, text);
  },

  clearError: function(text) {
    this.view.clearError(text);
  },

  drawPlayer: function(player) {
    this.view.drawPlayer(player);
  },

  clearMoves: function(moves) {
    this.view.clearPlayerMoves();
    this.set({'playerMoves': []});
  },
  
  addAndDrawMoves : function(moves) {
    console.debug('addAndDrawMoves');
    var self = this;
    var existingMoves = this.get('playerMoves');
    var currentStep = existingMoves.length;
    console.debug('addAndDrawMoves currentStep %d', currentStep);

    _.each(moves, function(move, index, list) {
      if (move.get('sequenceNumber') > currentStep) {
        self.get('playerMoves').push(move);
        self.view.drawPlayerMove(move);
      }
    });
  },
  
  initScores: function() {
    this.view.drawInitialScores([this.playerTeam, this.cpuTeam]);
  },

  updateScores: function(scores) {
    this.view.updateScores(scores);
  },

  handleFirstCards: function(cards) {
    this.addCards(cards);
    this.view.drawDeck();
    this.view.drawPlayerCards(this.get('cards'), this.playingOrder);

    var humanPlayer = this.get('humanPlayer');
    console.debug("this.playingOrder[0] %d humanPlayer id %d humanPlayer index %d", this.playingOrder[0], this.get('humanPlayer').get('id'), this.get('humanPlayer').get('index'));

    this.setCardClickHandler(this.noAction);
    if (this.playingOrder[0] == humanPlayer.get('index')) {
      this.drawText(messages[conf.lang].chooseTrumpHeading, "");
      this.view.drawTrumpSuits(this.chooseTrump);
      //this.setCardClickHandler(this.chooseTrump);
    } else {
      this.chooseFakeTrump();
    }
  },

  handleAllCards: function(cards, trumpSuit) {
    this.set({'trumpSuit': trumpSuit});
    this.drawTrumpSuit(trumpSuit);
    this.addCards(cards);
    this.view.drawPlayerCards(this.get('cards'), this.playingOrder);
    this.view.clearDeck();
    this.sendReady();
  },

  handleAskMove: function (playerMoves) {
    this.clearMoves();
    this.addAndDrawMoves(playerMoves);

    this.drawText(messages[conf.lang].yourTurn, "");
    this.setCardClickHandler(this.makeMove);
  },
  
  handleInvalidMove: function (response) {
    this.drawError(messages[conf.lang].invalidMoveHeading, messages[conf.lang].invalidMove); 
    this.setCardClickHandler(this.makeMove);
  },

  handleHandPlayed: function (playerMoves, winningPlayerId, scores) {
    this.removeSelectedCard();
    this.clearError();

    this.addAndDrawMoves(playerMoves);

    var winningPlayer = this.getPlayerById(winningPlayerId);
    if (winningPlayer.id == this.get('humanPlayer').id) {
      this.drawText(messages[conf.lang].youWinHand, messages[conf.lang].clickToAdvance);
    } else {
      this.drawText(winningPlayer.get('name') + messages[conf.lang].otherWinsHand, messages[conf.lang].clickToAdvance);
    }
    
    this.updateScores(scores);
    this.view.waitForNextHand();
  },  

  handleGameDecided: function (winningTeam, scores) {
    this.drawText(messages[conf.lang].gameDecided + winningTeam, "");
    this.updateScores(scores);
    this.view.waitForNextGame();
  },

  handleNextGame: function(cards) {
    this.clearCards();
    this.clearMoves();
    this.view.clearTrumpSuit();
    this.askFirstCards();
  },

  handleCardClicked : function(card) {
    this.cardClickHandler(card);
  },

  setCardClickHandler : function(handler) {
    console.debug("Setting cardClickHandler to: " + handler.name);
    this.cardClickHandler = handler;
  },
  
  setPlayerTeam: function(playerTeam) {
    this.playerTeam = playerTeam;
  },
  
  setCpuTeam: function(cpuTeam) {
    this.cpuTeam = cpuTeam;
  },
  
  setPlayerName: function(playerName) {
    if (playerName != null && playerName != '') {
      this.playerName = playerName;
    } else {
      var code = "" + (Math.floor(Math.random() * 2500) + 1);
      this.playerName = messages[conf.lang].playerPrefix + code;
    }
  },

  setView: function(view) {
    this.view = view;
  },

  setMessageHandler: function(handler) {
    this.handler = handler;
  }

});

})(window, jQuery);
