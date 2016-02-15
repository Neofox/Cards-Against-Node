var CardManager = require("./card_manager");
var Game = require("../models/game");

module.exports = App = {

    io: undefined,
    users: {},
    game: undefined,
    cardManager: undefined,

    initialize: function (io) {

        this.cardManager = Object.create(CardManager);
        this.cardManager.initialize();

        console.log('card manager initialized.');

        this.createGame();

        this.io = io;

    },

    getCardManager: function () {
        return this.cardManager;
    },

    getIO: function () {
        return this.io;
    },

    error: function (error) {
        console.error(error);
    },

    getGame: function(){
        return this.game;
    },

    createGame: function () {
        this.game = Object.create(Game);
        this.game.initialize(this);

        return this.game;
    },

    deleteGame: function () {
        delete this.game;
    }



};
