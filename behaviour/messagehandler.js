var WEB_SOCKET_SWF_LOCATION = "behaviour/lib/WebSocketMain.swf";

function MessageHandler() {
}

MessageHandler.prototype = {

  connect: function() {
    var self = this;

    this.socket = io.connect(conf.network.wsURL);
    this.socket.on('connect', function () {
        game.start();
        console.debug("Websocket opened, game started");

        self.socket.on('message', function (msg) {
          self.receiveMessage(msg);
          });
        });

    this.socket.on('disconnect', function () {
        console.debug("Websocket closed, game suspended");
        $('#disconnectModal').modal('show');
    }); 

  },
  
  sendMessage: function(message) {
    var messageStr = JSON.stringify(message);
    this.socket.send(messageStr);

    console.debug("Sent: " + messageStr);
  },

  receiveMessage : function(msg) {
    console.debug("Receiveed: %s" ,msg);

    var json = JSON.parse(msg);
    var handlerName = json.response;
    var functionCall = this[handlerName];

    //check whether handler function exists
    if (typeof functionCall != 'function') {
        console.error('Unknown response: ' + handlerName);
    } else {
        console.debug('Calling method handler: ' + handlerName);
    }

    //call handler function
    this[handlerName](json);
  },
  
  startGame: function (response) {
    var self = this;
    var playerList = response.players;
    //TODO send as method paramter
    game.playingOrder = response.playingOrder;
    _.each(response.players, function (p) {
      console.debug('p: ' + p.isHuman);
      var player = new Player({'id': p.id, 'index': p.index, 'isHuman': p.isHuman, 'team': p.team});
      game.addPlayer(player);
      game.drawPlayer(player);
    });
    game.askFirstCards();
  },

  nextGame: function(response) {
    //TODO send as method paramter
    game.playingOrder = response.playingOrder;
    game.handleNextGame();
  },

  dealFirstCards: function (response) {
    var cards = this.transformCards(response.cards);
    game.handleFirstCards(cards);
  },

  allCards: function (response) {
    var cards = this.transformCards(response.cards);
    var trumpSuit = response.trumpSuit
    game.handleAllCards(cards, trumpSuit);
  },

  askMove: function (response) {
    var playerMoves = this.transformPlayerMoves(response.hand);
    game.handleAskMove(playerMoves);
  },

  invalidMove: function (response) {
    game.handleInvalidMove();
  },

  handPlayed: function (response) {
    var playerMoves = this.transformPlayerMoves(response.hand);
    var winningPlayerId = response.winningPlayerId;
    var scores = response.scores;

    game.handleHandPlayed(playerMoves, winningPlayerId, scores);
  },

  gameDecided: function (response) {
    var winningTeam = response.winningTeam;
    var scores = response.scores;

    game.handleGameDecided(winningTeam, scores);
  },
  
  exception: function (response) {
    game.drawText(messages[conf.lang].errorMessage);
    console.error(response.resultMessage);
  },
  
  transformPlayerMoves : function (hand) {
    var self = this;
    var moves = [];
    var sorted = _.sortBy(hand, function(playerMove) { return playerMove.sequenceNumber; });
    _.each(sorted, function(move) {
        var jsonCard = move['card'];
        var seqNo = move['sequenceNumber'];
        var card = new Card(jsonCard);
        var player = game.getPlayerById(move['playerId']);
        
        moves.push(new PlayerMove({'player': player, 'card': card, 'sequenceNumber': seqNo}));
    });
    return moves;
  },

  transformCards : function (cards) {
    return _.map(cards, function (c) { 
      return new Card({'rank': c.rank, 'suit': c.suit});
    });
  }
};
