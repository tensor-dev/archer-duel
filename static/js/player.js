function Player(id, name, hp, fireCallback) {

    this._id = id;
    this._name = name;
    this._hp = hp;
    this._isCurrent = false;
    this._fireCallback = fireCallback;

    this._render();
}

Player.prototype._render = function() {

    // TODO(sasha-vinogradov) render name
    // TODO(sasha-vinogradov) render hp indicator

    // TODO(igor-nikitin) setup fire listener
    /*
     ??? Как узнать на какой DOM элемент подвешивать события ???
     var self = this;
     $('body').on('mousedown', function() { ... });
     $('body').on('mouseup', function() {
     ...
     ...
     ...

     self._fireCallback(self._id, x, y);
     });
     */

    if(this._id == 0)
    {
        var playerID = "LeftPl";
    }
    else
    {
        var playerID = "RightP2";
    }

    var indicatorID = "archer" + this._id + "_indicator";

    var player = document.getElementById(playerID);
    var indicator = document.getElementById(indicatorID);

    indicator.style.left = player.style.left;
    indicator.style.top = player.style.top + 50;
};

Player.prototype.setHP = function(hp) {
    // TODO(sasha-vinogradov) change hp value
    // TODO(sasha-vinogradov) update hp indicator on screen
};

Player.prototype.setCurrent = function(flag) {
    // TODO(makhov-aleksandr) store current flag
    this._isCurrent = flag;

    // TODO(makhov-aleksandr) render current indicator
    var indicatorID = "archer" + this._id + "indicator";
    var indicator = document.getElementById(indicatorID);

    if(flag == true)
    {
        idicator.className = " triangle";
    }
    else
    {
        idicator.className = "";
    }
};


Player.prototype.getHP = function() {
    return this._hp;
};

Player.prototype.getName = function() {
   return this._name;
};



new Player(1, 'vasya', 3, function(id, x, y){
    console.log(x + ' ' + y);
});