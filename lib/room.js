(function(){

    "use strict";

    var EventEmitter = require('events').EventEmitter,
        inherits = require('util').inherits;

    function Room(io) {

        // Room state
        this._players = [];
        this._currentPlayer = 0;
        this._wind = 0;
        this._spectatorsCount = 0;

        // Room internals
        this._readyCount = 0;
        this._roomState = 'created';
        this._io = io;
        this._id = Math.random().toString(36).slice(2, 2 + Math.max(1, Math.min(10, 10)) );

        this._eventSync = {
            nextTurn: 0,
            hit: 0,
            stopGame: 0
        };

    }

    inherits(Room, EventEmitter);

    Room.prototype._getState = function() {
        return {
            player1: this._players[0].toJSON(),
            player2: this._players[1].toJSON(),
            wind: this._wind,
            currentPlayer: this._currentPlayer
        };
    };

    Room.prototype.getBroadcast = function() {
        return this._io.sockets.in(this.getId());
    };

    Room.prototype.isAlive = function() {
        return this._roomState != 'dead';
    };

    Room.prototype.getId = function() {
        return this._id;
    };

    /**
     * Проверим, игрок ли это (ранее добавленный при входе в комнату)
     * @param playerid
     * @returns {*}
     */
    Room.prototype.isPlayer = function(playerid) {
        return this._players.filter(function(player){
            return player.getId() == playerid;
        })[0];
    };

    Room.prototype._notifyStateChanged = function() {
        console.log("Room " + this._id + " broadcasting >state<");
        this.getBroadcast().emit('state', this._getState());
    };

    Room.prototype.removeClient = function(socket, data) {
        // оставим всех игроков НЕ совпадающих с переанным ID
        var players = this._players.filter(function(p){
            return p.getId() != data.id;
        });

        this._players = players;

        // Если хоть один игрок ушел - комната мертвая, надо расходиться
        if(players.length != 2) {
            this._roomState = 'dead';
            console.log("Room " + this.getId() + " declared dead");
            // Пошлем всем что пора расходиться
            this.getBroadcast().emit('gameEnd');
        }
    };

    /**
     * Положениме пользователя. 1 - левый, 2 - правый, -1 - не нашли такого
     * @param identity
     * @returns {number}
     */
    Room.prototype.getUserPosition = function(identity) {
        var idx = -1;
        this._players.forEach(function(player, i){
            if(player.getId() == identity) {
                idx = i;
            }
        });
        return idx;
    };

    Room.prototype._switchPlayer = function() {
        console.log("Room " + this.getId() + " switching players");
        var dir = Math.random(), windValue = Math.random() * 100;
        this._wind = (dir > 0.5 ? 1 : -1) * windValue;
        this._currentPlayer = (this._currentPlayer + 1) % 2;
        this._notifyStateChanged();
    };

    Room.prototype.dispose = function() {
        var roomId = this.getId();
        // отключим все сокеты из комнаты
        this._io.sockets.clients(roomId).forEach(function(socket){
            socket.leave(roomId);
        });
        // уберем всех слушателей наших событий
        this.removeAllListeners();
        console.log("Room " + roomId + " disposed");
    };

    Room.prototype.addClient = function(socket, data) {

        // join socket to a room
        socket.join(this.getId());

        var player = this.isPlayer(data.id),
            self = this,
            broadcast = this.getBroadcast();

        if(player) {
            // player
            // then all players ready emit gameStart
            this._readyCount++;
            if(this._readyCount == 2) {
                this._roomState = 'alive';
                console.log("Room " + this._id + " broadcasting >gameStart<");
                broadcast.emit('gameStart');
            }

            // broadcast fire to all players
            socket.on('fire', function(data){
                if(player == self._players[self._currentPlayer]) {
                    console.log("Room " + self.getId() + " broadcasting >fire<");
                    broadcast.emit('fire', data);
                }
            });

            // collect 2 hit, apply it if to same player and emit state change
            socket.on('hit', function(data){
                if(self._eventSync.hit) {
                    if(self._eventSync.hit == data.to) {
                        console.log("Room " + self.getId() + " got confirmed hit form player " + data.to);
                        self._players[data.to].hit(data.hp);
                        self._notifyStateChanged();
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
                    self._switchPlayer();
                }
            });

            // collect 2 stopGame then emit gameEnd
            socket.on('stopGame', function(data){
                if(self._eventSync.stopGame) {
                    if(self._eventSync.stopGame == data.winner) {
                        console.log("Room " + self._id + " emitting >winner<");
                        self.emit('winner', self._players[data.winner].getId());
                        console.log("Room " + self._id + " broadcasting >gameEnd<");
                        broadcast.emit('gameEnd');
                    }
                    self._eventSync.stopGame = 0;
                } else {
                    self._eventSync.stopGame = data.winner;
                }
            });


        } else {
            /**
             * spectator
             * ничего не делаем. Он просто получит все извещения через броадкасты
             * просто увеличим счетчик для статистики
             */
            this._spectatorsCount++;

        }
    };

    Room.prototype.addPlayer = function(player) {
        if(this.canAcceptPlayer()) {
            this._players.push(player);
        }
    };

    Room.prototype.isReady = function() {
        return this._roomState == 'alive';
    };

    /**
     * @returns {Boolean} true если к комнате можно присоединиться
     */
    Room.prototype.canAcceptPlayer = function() {
        return this._players.length < 2 && this._roomState == 'created';
    };

    Room.prototype.toJSON = function() {
        return {
            id: this._id,
            player1: this._players[0] && this._players[0].toJSON() || { displayName: '-' },
            player2: this._players[1] && this._players[1].toJSON() || { displayName: '-' },
            spectators: this._spectatorsCount
        };
    };

    module.exports = Room;


})();