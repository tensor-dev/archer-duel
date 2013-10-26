(function(){

    "use strict";

    var EventEmitter = require('events').EventEmitter,
        inherits = require('util').inherits,
        State = require('./state');

    function Room(io) {

        var self;

        this._players = [];
        this._spectactors = [];
        this._currentPlayer = 0;
        this._state = new State();
        this._readyCount = 0;
        this._roomState = 'created';
        this._io = io;
        this._id = Math.random().toString(36).slice(2, 2 + Math.max(1, Math.min(10, 10)) );


        this._eventSync = {
            nextTurn: 0,
            hit: 0,
            stopGame: 0
        };

        // then state changes, broadcast it to all users
        this._state.on('change', function(serialized){
            self.getBroadcast().emit('state', serialized);
        })
    }

    inherits(Room, EventEmitter);

    Room.protoype.getBroadcast = function() {
        return this._io.sockets.in(this.getId());
    };

    Room.prototype.isAlive = function() {
        return this._roomState != 'dead';
    };

    Room.prototype.getId = function() {
        return this._id;
    };

    Room.prototype.isPlayer = function(playerid) {
        return this._players.filter(function(player){
            return player.getId() == playerid;
        })[0];
    };

    Room.prototype.removeClient = function(socket, data) {
        // TODO make room dead if no more players here
    };

    Room.prototype.addClient = function(socket, data) {
        socket.join(this.getId());

        var player = this.isPlayer(data),
            self = this,
            broadcast = this.getBroadcast();

        if(player) {
            // player
            // then all players ready emit gameStart
            socket.on('ready', function(){
                self._readyCount++;
                if(self._readyCount == 2) {
                    self._roomState = 'alive';
                    broadcast.emit('gameStart');
                }
            });

            // broadcast fire to all players
            socket.on('fire', function(data){
                if(player.isCurrent()) {
                    broadcast.emit('fire', data);
                }
            });

            // collect 2 hit, apply it if to same player (emits new state)
            socket.on('hit', function(data){
                if(self._eventSync.hit) {
                    if(self._eventSync.hit == data.to) {
                        self._players[data.to].hit(data.hp);
                    }
                    self._eventSync.hit = 0;
                } else {
                    self._eventSync.hit = data.to;
                }
            });

            // collect 2 nextTurns then switch player (emits new state)
            socket.on('nextTurn', function() {
                self._eventSync.nextTurn++;
                if(self._eventSync.nextTurn == 2) {
                    self._eventSync.nextTurn = 0;
                    self._state.switchPlayer();
                }
            });

            // collect 2 stopGame then emit gameEnd
            socket.on('stopGame', function(data){
                if(self._eventSync.stopGame) {
                    if(self._eventSync.stopGame == data.winner) {
                        self.emit('winner', self._players[data.winner].getId());
                        broadcast.emit('gameEnd');
                    }
                    self._eventSync.stopGame = 0;
                } else {
                    self._eventSync.stopGame = data.winner;
                }
            });


        } else {
            // spectactor
        }

        socket.on('')
    };

    Room.prototype.addPlayer = function(player) {
        // TODO add player to room
        /*if(this.canAcceptPlayer()) {
            this._players.push(player);
            if(this._players.length == 2) {
                this._state = new State(this._players);
                this.emit('ready');
            }
        }*/
    };

    Room.prototype.hasPlayer = function(player) {
        return this._players.filter(function(p){
            return p.getId() == player.getId();
        })
    };

    Room.prototype.isReady = function() {
        return this._state == 'alive';
    };

    Room.prototype.addSpectactor = function(spectactor) {
        /*this._spectactors.push(spectactor);
        if(this.isReady()) {
            spectactor.setState(this._state);
        }*/
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

    Room.prototype.toJSON = function() {
        var players = [];
        this._players.forEach(function(p){
            players.push(p.toJSON());
        });
        return {
            id: this._id,
            player1: players[0] && players[0].toJSON() || { displayName: '-' },
            player2: players[1] && players[1].toJSON() || { displayName: '-' },
            spectactors: this._spectactors.length
        };
    };

    module.exports = Room;


})();