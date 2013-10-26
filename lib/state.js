(function(){

    "use strict";

    var EventEmitter = require('events').EventEmitter,
        inherits = require('util').inherits;

    function State(players) {

        var self = this;

        this._players = players;
        this._wind = 0;
        this._currentPlayer = 0;

        players.forEach(function(player){
            player.on('change', self._notifyStateChange.bind(self));
        }, this)
    }

    inherits(State, EventEmitter);


    State.prototype._notifyStateChange = function() {
        this.emit('change', this.toJSON());
    };

    State.prototype.setWind = function() {
        var dir = Math.random(), value = Math.random() * 100;
        this._wind = (dir > 0.5 ? 1 : -1) * value;
        this._notifyStateChange();
    };

    State.prototype.switchPlayer = function() {
        this._currentPlayer = (this._currentPlayer + 1) % 2;
        this._notifyStateChange();
    };

    State.prototype.toJSON = function() {
        return {
            player1: this._players[0].toJSON(),
            player2: this._players[1].toJSON(),
            wind: this._wind,
            currentPlayer: this._currentPlayer
        };
    }


})();