var socket = io();
// var socket = io.connect("http://localhost:8080");



socket.on("game_begin", function () {
    $("#startGame").hide();
    //TODO: hello game
    $("#playArea").show();

});

socket.on('white_cards_draw', function (data) {
    $.each(data, function(i, item) {
        var $checkbox = $('<input>').attr({
            type: 'checkbox',
            id: item.id,
            value: item.id,
            name: item.type
        });
        $checkbox.html(item.text);
        $("#hand").append($checkbox);
        var $label = $('<label>').attr({
            for: item.id,
            title: item.id
        });
        $label.html(item.text);
        $("#hand").append($label);

    });

    var $button = $('<button>');
    $button.html("submit");

    $button.on( "click", function() {
        var allVals = $('input:checkbox:checked').map(function() {
            return this.value;
        }).get();

        socket.emit('card_pick', allVals);
        console.log('cards '+allVals+' picked.');
    });

    $("#hand").append($button);



    $("#updates").append("<li>" + "white cards: " + "</li>");

    var log = document.getElementById('footer');
    log.scrollTop = log.scrollHeight;
    $("#updates").append("<li>" + JSON.stringify(data, null, 4) + "</li>");
    var log = document.getElementById('footer');
    log.scrollTop = log.scrollHeight;
});

socket.on('game_data', function (gamedata) {
    $("#updates").append("<li>" + "gamedata: " + "</li>");
    var log = document.getElementById('footer');
    log.scrollTop = log.scrollHeight;
    $("#updates").append("<li>" + JSON.stringify(gamedata, null, 4) + "</li>");
    var log = document.getElementById('footer');
    log.scrollTop = log.scrollHeight;
});

// DOCUMENT READY


$(document).ready(function () {
    $("#playArea").hide();
    $("#waiting").hide();
    $("#error").hide();
    $("#name").focus();
    $("#progressUpdate").hide();
    $("#penalising").hide();
    $("#numberRequest").hide();
    $("#suiteRequest").hide();
    $("form").submit(function (event) {
        event.preventDefault();
    });

    $("#startGame").click(function(){
          socket.emit("start_game");
        console.log("game start request");
        $("#startGame").hide();
    });

    $("#join").click(function () {
        var name = $("#name").val();
        if (name.length > 0) {
            socket.emit("connect_to_server", name);
            $("#loginForm").hide();
            $("#waiting").show();
        } else {
            $("#error").show();
            $("#error").append('<p class="text-error">Please enter a name.</p>');
        }
    });
});