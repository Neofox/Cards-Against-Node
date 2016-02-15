/**
 * Created by Neofox on 28/11/2015.
 */

/**
 * All the code revelant to socket.io.
 *
 * @type {{init: function, socket: object, bindEvents: function, onGameJoin: function, onCardsDraw: function, onBlackCardDraw: function, onGameData: function}}
 */
var IO = {

    /**
     * Connect the socket.io Client to the server
     */
    init: function () {
        IO.socket = io();
        //        = io.connect("http://localhost:8080");
        IO.bindEvents();
    },

    bindEvents: function () {
        IO.socket.on('game_join', IO.onGameJoin);
        IO.socket.on('user_created', IO.onUserCreated);
        IO.socket.on('white_cards_draw', IO.onCardsDraw);
        IO.socket.on('black_card_draw', IO.onBlackCardDraw);
        IO.socket.on('game_data', IO.onGameData);
        IO.socket.on('list_decks', IO.onListDecks);
        IO.socket.on('game_start', IO.onGameStart);
        IO.socket.on('cards_play', IO.onCardsPlayed);
    },

    onGameJoin: function (data) {
        App.gameId = data;
        App.gameInit();
    },

    onUserCreated: function (data) {
        App.myToken = data;
    },

    onCardsDraw: function (data) {
        App.myCards = data;
        App.addCards(data);
    },

    onBlackCardDraw: function (data) {
        App.newBlackCard(data);
    },

    onGameData: function (data) {
        console.log(data.players);
        App.listPlayers = data.players;
        App.fillListPlayers();
        //App.setCardCzar(data.players);
    },

    onListDecks: function (data) {
        App.listDecks(data);
    },

    onGameStart: function () {
        App.gameAreaInit();
        App.currentRound = 0;
    },

    onCardsPlayed: function (data) {
        App.cardsPlayed = data;
        App.showPlayedCards();
    },

    /**
     * An error has occured
     * @param data
     */
    error: function (data) {
        alert(data.message);
    }
};

var App = {

    gameId: 0,
    myToken: '',
    myPts: 0,
    isCardCzar: false,
    myCards: '',
    currentRound: 0,
    listPlayers: [],
    cardsPlayed: [],
    cardsSelectionned: [],

    /**
     * Initialise the page
     */
    init: function () {
        App.cacheElements();
        App.showInitScreen();
        App.bindEvents();
    },

    /**
     * Create reference of the on-screen element used in the game
     */
    cacheElements: function () {
        App.$doc = $(document);

        // Templates
        App.$gameArea = $('#gameArea');
        App.templateIntroScreen = $('#intro-screen-template').html();
        App.templateGame = $('#game-template').html();
        App.templateLobby = $('#lobby-template').html();
    },

    bindEvents: function () {
        App.$doc.on('click', '#join', App.onJoinClick);
        //App.$doc.on('click', '#submitCards', App.onSubmitCard);
        App.$doc.on('click', '#addDecks', App.onAddDecks);
        App.$doc.on('click', '#addCustom', App.onAddCustomDeck);
        App.$doc.on('change', '#start', App.onStart);
        App.$doc.on('click', '#sendChoice', App.sendCardPlayed);
    },

    /**
     * Show initial screen
     */
    showInitScreen: function () {
        App.$gameArea.html(App.templateIntroScreen);
    },

    onJoinClick: function () {
        var name = $("#name").val();
        if (name.length>0) {
            IO.socket.emit('connect_to_server', name);

        } else {
            $("#error").show();
            $("#error").append('<p class="text-error">OUKILEST LE PSEUDAL.</p>');
        }
    },

    gameInit: function () {
        IO.socket.emit("load_deck"); //call the serv for getting list and call listDecks
        App.$gameArea.html(App.templateLobby);
    },

    listDecks: function (data) {
        $.each(data, function(i, item) {
            var $checkbox = $('<input>').attr({
                type: 'checkbox',
                id: item.id,
                value: item.id
            });
            $("#decklist").append($checkbox);
            var $label = $('<label>').attr({
                for: item.id,
                title: item.id
            });
            $label.html(item.name);
            $("#decklist").append($label);

        });
    },

    onAddDecks: function () {
        $('input:checkbox:checked').map(function() {
            IO.socket.emit('add_deck', this.value);
            console.log('deck '+this.value+' added.');
        }).get();
    },

    onAddCustomDeck: function () {
        var customDeckId = $('#customDeck').val();
        IO.socket.emit('add_custom_deck', customDeckId);
        console.log('deck '+customDeckId+' added.');
    },

    fillListPlayers: function(){
        var playerList = $('#playerList');
        playerList.empty();
        $.each(App.listPlayers, function(i) {
            var li = $('<li/>')
                .addClass('ui-menu-item')
                .attr('role', 'menuitem')
                .appendTo(playerList);
            var aaa = $('<a/>')
                .addClass('ui-all')
                .text(App.listPlayers[i].name)
                .appendTo(li);
        });
    },

    onStart: function () {
        console.log('user'+App.myToken+' is ready? '+this.checked);
        IO.socket.emit('ready', {"token": App.myToken, "bool":this.checked});
    },

    gameAreaInit: function () {
        App.$gameArea.html(App.templateGame);
    },

    addCards: function (cards) {
        var hand = $('#hand');
        hand.empty();

        $.each(cards, function(i, item) {
            var whiteDiv = $('<div>')
                .addClass('col-sm-2')
                .appendTo(hand);
            var whiteCard = $('<a>')
                .addClass('thumbnail whitecard')
                .text(item.text)
                .attr('id', item.id)
                .attr('href', 'javascript:void(0)')
                .on('click', function () {
                    $(this).toggleClass('selectionned');
                    if($(this).hasClass('selectionned')){
                        App.cardsSelectionned.push($(this).attr('id'));
                    }else{
                        var x = App.cardsSelectionned.indexOf($(this).attr('id'));
                        App.cardsSelectionned.splice(x,1);
                    }
                })
                .appendTo(whiteDiv);
        });
    },

    showPlayedCards: function () {

        var table = $('#gameTable');
        var data = App.cardsPlayed;
        table.empty();

        var playedCards = data.cards;
        $.each(playedCards, function(i){
            var globalDiv = $('<div>')
                .addClass('col-sm-3')
                .appendTo(table);
            var whitecard = $('<a>')
                .addClass('thumbnail whitecard')
                .text(playedCards[i].text)
                .attr('id', playedCards[i].id)
                .appendTo(globalDiv);
        });
    },

    newBlackCard: function (card) {
        var blackCardSet = $('#blackCardSet');
        blackCardSet.empty();

        var finalBlackCard = $('<div>');
        var blackCard = $('<div>')
            .addClass('thumbnail blackcard')
            .text(card.text)
            .appendTo(finalBlackCard);

        blackCardSet.append(finalBlackCard);
    },

    sendCardPlayed: function () {
        IO.socket.emit('play_a_card', {token:App.myToken ,cards:App.cardsSelectionned});
        console.log('cards '+App.cardsSelectionned+' picked by '+App.myToken);
    }


};


$(document).ready(function () {
    IO.init();
    App.init();
});
