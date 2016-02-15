var User = require("./models/user");

var express = require("express");
app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use("/", express.static(__dirname + "/"));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app_server = Object.create(require("./server/app"));
app_server.initialize(io);
game = app_server.getGame();
utils = Object.create(require('./utils'));

io.sockets.on("connection", function (socket) {

    // User Created when connected
    var player = Object.create(User);
    player.initialize(app, socket);
    socket.emit('user_created', player.getToken());

    // User added to the game when he identified himself
    socket.on('connect_to_server', function (username) {
        player.setUsername(username);
        game.addUser(player, false); // Send true (game_join)
        game.sendGameDataToAllGameUsers();
    });

    socket.on("load_deck", function () {
        var allDeck = app_server.getCardManager().getAllDeck();
        socket.emit('list_decks', allDeck);
    });

    // Add a deck when selectionned
    socket.on('add_deck', function (deck_id) {
        game.addDeck(deck_id);
    });

    // Add a deck when selectionned
    socket.on('add_custom_deck', function (deck_id) {
        app_server.getCardManager().downloadDeck(deck_id, function(deck, error){
            if(error == false){
                game.addDeck(deck.getId());
            }else{
                socket.emit('error_import', error);
                console.error(error);
            }
        });
    });
    // data.cards is an array of cards ids
    socket.on('play_a_card', function (data) {
        game.getCurrentRound().pickWhiteCards(data.token, data.cards); // emit cards play (cards_play)
    });

    socket.on('ready', function(data){
        game.setPlayerReady(data.token, data.bool);
        game.startGame();  // game_start
        // if game start : Send white cards draw (white_cards_draw), send black card draw (black_card_draw)
        //Send Game Data (game_data)
    });

});


io.sockets.on("disconnect", function (socket) {
    //TODO: Will remove player from game
});


http.listen(3000, function () {
    console.log('SERVER OK');
    console.log('listening on *:3000');
});
