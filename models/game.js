var GamePlayer = require("./game_player");
var Utils = require("../utils");
var Round = require("../models/round");

module.exports = Game = {

    NUMBER_OF_CARDS_TO_DRAW: 10,
    NUMBER_OF_PTS_FOR_WIN: 3,

    app: undefined,
    id: undefined,

    players: [],
    spectators: [],

    decks: [],
    allBlackCards: [],
    allWhiteCards: [],
    cardsDraw: [],

    currentBlackCard: undefined,
    currentCardCzar: undefined,

    currentRound: undefined,
    roundNumber: 0,

    isGameStarted: false,
    isGameHaveAWinner: false,

    isPasswordNeeded: false,
    password: undefined,

    initialize: function (app) {

        this.players = [];
        this.spectators = [];
        this.decks = {};
        this.allBlackCards = [];
        this.allWhiteCards = [];

        this.isGameStarted = false;
        this.isPasswordNeeded = false;

        this.app = app;
        this.id = this._generateId();

    },

    isStarted: function () {
        return this.isGameStarted;
    },

    startRound: function (number) {
        var round = Object.create(Round);
        round.initialize(this, number);
        this.currentRound = round;
        console.log("round "+number+" initialized");

        round.drawWhiteCards();
        round.drawRoundBlackCard();
        round.pickRoundCardCzar();
    },

    getCurrentRound: function () {
        return this.currentRound;
    },

    setPassword: function (password) {
        this.password = password;
        this.isPasswordNeeded = true;
    },

    setPlayerReady: function (token, bool) {
        for(var i=0;i<this.players.length;i++){
            if (this.players[i].getUser().getToken() == token){
                this.players[i].setReady(bool)
            }
        }
    },

    getId: function () {
        return this.id;
    },

    getApp: function () {
        return this.app;
    },

    startGame: function () {
        var utils = Object.create(Utils);

        if(utils.allPlayersReady(this.players)){
            this.isGameStarted = true;
            utils.emitToAllPlayers(this.players, "game_start");
            this.startRound(this.roundNumber);
            this.sendGameDataToAllGameUsers();
        }
    },

    getCurrentCzar: function () {
        return this.players[this.currentCardCzar];
    },

    gameIsFinished: function () {
        for (var i=0;i<this.players.length;i++){
            if (this.players[i].getScore() >= this.NUMBER_OF_PTS_FOR_WIN){
                this.isGameHaveAWinner = true;
                console.log("game finished");
                return true;
            }
        }
        return false;
    },

    changeCardCzar: function () {
        if(typeof this.currentCardCzar != "undefined"){
            if(this.players.length < this.currentCardCzar+1){
                this.currentCardCzar = this.currentCardCzar+1; // Increment the value of the cardCzar
            }else{
                this.currentCardCzar = 0; // if CardCzar is the last, take the first
            }
        }else{
            this.currentCardCzar = this._getRandomPlayerId(); // If no cardCzar exist, take a random one
        }
        this.players[this.currentCardCzar].setCardCzar(true);
        return this.players[this.currentCardCzar];
    },

    getCurrentBlackCard: function () {
        return this.currentBlackCard;
    },

    getPlayers: function () {
        return this.players;
    },

    _getRandomPlayerId: function () {
        return Math.floor(Math.random() * this.players.length);
    },

    addDeck: function (id) {
        var cardManager = this.getApp().getCardManager();
        if (cardManager.doesDeckExist(id) && typeof this.decks[id] == "undefined") {
            this.decks[id] = cardManager.getDeck(id);
            console.log("deck "+this.decks[id].getName()+" (id: "+id+" ) added to the game.");
        }
        this.fillCardsArray();
    },

    fillCardsArray: function () {
        this.fillBlackCardsArray();
        this.fillWhiteCardsArray();
    },

    fillBlackCardsArray: function () {
        this.allBlackCards = [];

        for (var deck_id in this.decks) {
            var deck = this.decks[deck_id];
            this.allBlackCards = this.allBlackCards.concat(deck.getBlackCards());
        }
    },

    fillWhiteCardsArray: function () {
        this.allWhiteCards = [];

        for (deck_id in this.decks) {
            var deck = this.decks[deck_id];
            this.allWhiteCards = this.allWhiteCards.concat(deck.getWhiteCards());
        }
    },

    sendGameDataToAllGameUsers: function () {
        var utils = Object.create(Utils);
        var gamedata = this._getGameData();

        utils.emitToAllPlayers(this.players, "game_data", gamedata);
        utils.emitToAllPlayers(this.spectators, "game_data", gamedata);

    },

    _getGameData: function () {
        var player_data = [];
        var spectator_data = [];

        for (var i = 0; i < this.players.length; i++) {
            var player = this.players[i];
            player_data.push(player.getPublicGameData());
        }

        for (var i = 0; i < this.spectators.length; i++) {
            spectator_data.push(this.spectators[i].getName());
        }

        return {
            password: this.isPasswordNeeded ? this.password : false,
            spectators: spectator_data,
            players: player_data,
            round: this.roundNumber
        };
    },

    addUser: function (user, spectating) {
        var self = this;

        if (this.isPasswordNeeded) {

            user.getSocket().emit("game_password_require", true);
            user.getSocket().on("game_password", function (password) {
                if (password == self.password) {
                    self._addUserToGame(user, spectating);
                    user.getSocket().removeAllListeners("game_password");
                } else {
                    user.getSocket().emit("game_password_incorrect", true);
                }
            });

        } else {
            this._addUserToGame(user, spectating);
        }

    },

    drawBlackCard: function () {
        this.currentBlackCard = this.allBlackCards[Math.floor(Math.random()*this.allBlackCards.length)];
        this._sendBlackCard();

        return this.currentBlackCard;
    },

    _sendBlackCard: function () {
        var blackCardData = this.currentBlackCard;
        var utils = Object.create(Utils);

        utils.emitToAllPlayers(this.players, "black_card_draw", blackCardData);
    },

    /**
     * Draw one or many white cards
     *
     * @param gameplayer
     * @param number
     */
    drawWhiteCard: function (gameplayer, number) {
        // Shuffle the white cards
        var utils = Object.create(Utils);
        this.allWhiteCards = utils.shuffle(this.allWhiteCards);

        var cardDraw = this.allWhiteCards.splice(0,number);
        this.cardsDraw.concat(cardDraw);
        gameplayer.addWhiteCards(cardDraw);

        gameplayer.getUser().getSocket().emit('white_cards_draw', gameplayer.getWhiteCards());
    },

    /**
     * Draw a card until the hand of the player is full (10 cards)
     *
     * @param gameplayer
     */
    fillHand: function (gameplayer) {
        var cardsToDraw = this.NUMBER_OF_CARDS_TO_DRAW - gameplayer.getWhiteCards().length;
        this.drawWhiteCard(gameplayer, cardsToDraw);

        console.log('draw '+cardsToDraw+" card(s).");
    },

    _addUserToGame: function (user, spectating) {
        if (spectating) {
            this.spectators.push(user);
            user.getSocket().emit("game_spectate", true);
        } else {
            var gameplayer = Object.create(GamePlayer);
            gameplayer.setUser(user);
            this.players.push(gameplayer);
            user.getSocket().emit("game_join", this.getId());
        }
    },

    _generateId: function () {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();

    }

}
