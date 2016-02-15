var Utils = require("../utils");

module.exports = GamePlayer = {

    user: undefined,
    score: 0,
    whiteCards: [],
    isCardCzar: false,
    ready: false,

    setUser: function (user) {
        this.user = user;
    },

    getWhiteCards: function () {
        return this.whiteCards;
    },

    getUser: function () {
        return this.user;
    },

    isReady: function () {
        return this.ready;
    },

    setReady: function (bool) {
        this.ready = bool;
    },

    wonRound: function () {
        this.score++;
    },

    setCardCzar: function (bool) {
        this.isCardCzar = bool;
    },

    endRound: function () {
        this.isCardCzar = false;
    },

    addWhiteCards: function (cards) {
        this.whiteCards = this.whiteCards.concat(cards);
    },

    /**
     * Return an array of card played and substract them to the cards of the game_player
     *
     * @param card_ids
     * Card_ids is an array of one or many Ids
     *
     * @returns {Array}
     */
    playACard: function(card_ids){
        var playedCard = [];
        var utils = Object.create(Utils);

        for(var i=0;i<card_ids.length;i++){
            playedCard.push(utils.getCardById(card_ids[i], this.whiteCards));
            this.whiteCards = utils.removeCardById(card_ids[i], this.whiteCards);
        }

        return playedCard;
    },

    getPublicGameData: function () {
        return {
            'name': this.user.name,
            'score': this.score,
            'isCardCzar': this.isCardCzar
        }
    },

    getScore: function () {
        return this.score;
    }

};
