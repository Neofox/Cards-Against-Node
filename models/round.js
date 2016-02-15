var Utils = require("../utils");

module.exports = Round = {

    game: undefined,
    number: 0,

    roundCzar: undefined,
    roundBlackCard: undefined,
    whiteCardPlayed: {},

    winner: undefined,
    endRound: false,

    initialize: function (game, number) {

        this.game = game;
        this.number = number;
    },

    getRoundNumber: function () {
        return this.number;
    },

    // Fill all players hands
    drawWhiteCards: function () {
        var players = this.game.getPlayers();
        for(var i=0;i<players.length;i++){
            this.game.fillHand(players[i]);
            console.log('Hand of '+players[i].getUser().getName()+' filled.');

        }
        console.log('All hand are filled.');
    },

    drawRoundBlackCard: function () {
        this.roundBlackCard = this.game.drawBlackCard();
        console.log('Black card draw. '+this.roundBlackCard.getText());
    },

    pickRoundCardCzar: function () {
        this.currentCardCzar = this.game.changeCardCzar();
        console.log('new cardCzar : '+this.currentCardCzar.getUser().getName());
    },

    // Player  cards_ids is an array of cards played
    pickWhiteCards: function (token, cards_ids) {
        var utils = Object.create(Utils);
        var gameplayer = utils.getGameplayerByToken(token, this.game.getPlayers());
        var cardsPlay = gameplayer.playACard(cards_ids);

        this.whiteCardPlayed[gameplayer.getUser().getName()] = cardsPlay;
        for(var i=0;i<cardsPlay.length;i++){
            console.log('Player '+gameplayer.getUser().getName()+' has played '+cardsPlay[i].getText()+' (id : '+cardsPlay[i].getId()+' )');
        }
        gameplayer.getUser().getSocket().emit('white_cards_draw', gameplayer.getWhiteCards());
        utils.emitToAllPlayers(this.game.players,'cards_play', {'user':token, 'cards':cardsPlay});
    },

    // Czar
    selectAWhiteCard: function (user_name) {
        var utils = Object.create(Utils);
        this.winner = utils.getGameplayerByName(user_name, this.game.getPlayers());
        console.log('winner of the round is '+this.winner);
    },

    makeAWinner: function () {
        this.winner.wonRound();
        console.log('scores: ');

        var players = this.game.getPlayers();
        for(var i=0;i<players.length;i++){
            console.log(players[i].getUser().getName()+' : '+players[i].getScore());
        }

        this.endRound = true;
    },

    isRoundFinished: function () {
        return this.endRound;
    }

};
