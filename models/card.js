var Utils = require('../utils');

module.exports = Card = {

    id: undefined,
    text: undefined,
    type: undefined,
    numAnswers: 0,

    initialize: function (text, type, numberOfAnswers, pack) {
        if (type != "black") {
            pack = numberOfAnswers;
        }
        this.setId();
        this.setText(text);
        this.setType(type);
    },

    setId: function (id){
        var utils = Object.create(Utils);
        this.id = utils.generateID();
    },

    getId: function () {
        return this.id;
    },

    setText: function (text) {
        this.text = text;
    },

    setPack: function (pack) {
        this.pack = pack;
    },

    setType: function (type) {
        if (type == "black" || type == "white") {
            this.type = type;
        }
    },

    setNumberOfAnswers: function (i) {
        this.numAnswers = i;
    },

    getText: function () {
        return this.text;
    },

    getPack: function () {
        return this.pack;
    },

    getType: function () {
        return this.type;
    },

    getNumberOfAnswers: function () {
        if (this.type == "black") {
            return this.numAnswers;
        }
    }

};
