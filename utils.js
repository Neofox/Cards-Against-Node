/**
 * Utils can provide useful method for all models.
 *
 * @type {{shuffle: Utils.shuffle, generateID: Utils.generateID, getCardById: Utils.getCardById, getGameplayerByName: Utils.getGameplayerByName, EmitToAllPlayers: Utils.EmitToAllPlayers}}
 */
module.exports = Utils = {

    /**
     * Shuffle an array (ty internet)
     *
     * @param o
     * @returns {Array}
     */
    shuffle: function(o)
    {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    },

    /**
     * Generate an unique string
     *
     * @returns {string}
     */
    generateID: function () {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Get a given card by his ID
     *
     * @param id
     * @param cardSet
     * @returns {*}
     */
    getCardById: function (id, cardSet) {
        for(var i=0;i<cardSet.length;i++){
            if (cardSet[i].getId() == id){
                return cardSet[i];
            }
        }
        return false;
    },

    /**
     * Remove a given card by his ID
     *
     * @param id
     * @param cardSet
     * @returns {*}
     */
    removeCardById: function (id, cardSet) {
        for(var i=0;i<cardSet.length;i++){
            if (cardSet[i].getId() == id){
                cardSet.splice(i,1);
            }
        }
        return cardSet
    },

    /**
     * Get a game_player by his name
     *
     * @param name
     * @param playerSet
     * @returns {*}
     */
    getGameplayerByName: function (name, playerSet) {
        for(var i=0;i<playerSet.length;i++){
            if(playerSet[i].getName() == name){
                return playerSet[i];
            }
        }

        return false;
    },

    /**
     * Get a game_player by his tocken
     *
     * @param tocken
     * @param playerSet
     * @returns {*}
     */
    getGameplayerByToken: function (tocken, playerSet) {
        for(var i=0;i<playerSet.length;i++){
            if(playerSet[i].getUser().getToken() == tocken){
                return playerSet[i];
            }
        }

        return false;
    },

    /**
     * Check if all players are ready
     *
     * @param gameplayers
     * @returns {boolean}
     */
    allPlayersReady: function (gameplayers) {
        for (var i = 0; i < gameplayers.length; i++) {
            if(!gameplayers[i].isReady()){
                console.log("player"+gameplayers[i].getUser().getName()+" not ready");
                return false;
            }
        }
        return true;
    },

    /**
     * Emit something to all players
     *
     * @param eventName
     * @param eventData
     * @param players
     * @constructor
     */
    emitToAllPlayers: function (players, eventName, eventData) {
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            player.getUser().getSocket().emit(eventName, eventData);
        }
    }

};