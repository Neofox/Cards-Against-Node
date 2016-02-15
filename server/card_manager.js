var Card = require("../models/card");
var Deck = require("../models/deck");
var fs = require("fs");
var packDownloader = require("./packDownloader");

module.exports = CardManager = {

    CARDS_LOCATION: __dirname + "/cards/",

    decks: {},

    initialize: function () {

        var card_files_list = fs.readdirSync(this.CARDS_LOCATION);

        for (var i = 0; i < card_files_list.length; i++) {

            var plain_deck = require(this.CARDS_LOCATION + card_files_list[i]);

            var new_deck = Object.create(Deck);
            new_deck.load(plain_deck);
            this.decks[new_deck.id] = new_deck;

        }

        console.info("Loaded " + card_files_list.length + " decks.");

    },

    getDeck: function (id) {
        if (typeof this.decks[id] != "undefined") {
            return this.decks[id];
        }
        return {error: true, message: "deck not found"};
    },

    doesDeckExist: function (id) {
        return typeof this.decks[id] != "undefined";
    },

    downloadDeck: function (id, callback) {
        var self = this;
        if (!this.doesDeckExist(id)) {
            packDownloader(id, function (plain_deck, error) {
                if (error == false) {
                    var new_deck = Object.create(Deck);
                    new_deck.load(JSON.parse(plain_deck));
                    self.decks[id] = new_deck;
                    callback(new_deck, false);
                } else {
                    callback(null, error);
                }
            });
        } else {
            callback(this.getDeck(id), false);
        }
    },

    getAllDeck: function () {
        var deckList = [];
        for(var deck in this.decks){
            deckList.push({
                id: deck,
                name: this.decks[deck].getName(),
                description: this.decks[deck].getDescription(),
                rating: this.decks[deck].getRating()
            });
        }
        return deckList;
    }


};
