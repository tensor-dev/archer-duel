(function(){

    "use strict";

    /*var EventEmitter = require('events').EventEmitter,
        inherits = require('util').inherits;*/


    function Player(config) {
        this._config = config;
        this._x = 0;
        this._hp = 3;
    }

    //inherits(Player, EventEmitter);

    Player.prototype.getId = function() {
        return this._config.identity;
    };

    Player.prototype.toJSON = function() {
        return this._config;
    };

    Player.prototype.setOffset = function(x) {
        this._x = x;
    };

    Player.prototype.hit = function(dhp) {
        dhp = dhp || 1;
        this._hp -= dhp;
        return this._hp > 0;
    };

    module.exports = Player;

})();