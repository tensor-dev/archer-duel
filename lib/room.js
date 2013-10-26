(function(){

    "use strict";

    function Room() {

        this._players = [];
        this._spectactors = [];
        this._currentPlayer = 0;

    }


    Room.prototype.addPlayer = function(player) {
        if(this.canAcceptPlayer()) {
            this._players.push(player);
        }
    };

    Room.prototype.addSpectactor = function(spectactor) {
        this._spectactors.push(spectactor);
    };

    /**
     * @returns {Boolean} true если к комнате можно присоединиться
     */
    Room.prototype.canAcceptPlayer = function() {
        return this._players.length < 2;
    };

    /**
     * Переключает текщуего игрока
     * @param {Number} n
     */
    Room.prototype.setCurrentPlayer = function(n) {

    };

    /**
     * @returns {Number} номер текущего игрока
     */
    Room.prototype.getCurrentPlayer = function() {

    };

    module.exports = Room;


})();