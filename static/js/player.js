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

    var player0 = document.getElementById("LeftPl");
    var indicator0 = document.getElementById("archer0_indicator");

    indicator0.style.position = "absolute";
    indicator0.style.left = player0.style.left;
    indicato0.style.top = player0.style.top + 50;

    var player1 = document.getElementById("RightPl");
    var indicator1 = document.getElementById("archer1_indicator");

    indicator1.style.position = "absolute";
    indicator1.style.left = player1.style.left;
    indicato1.style.top = player1.style.top + 50;
};

Player.prototype.setHP = function(hp) {
    // TODO(sasha-vinogradov) change hp value
    // TODO(sasha-vinogradov) update hp indicator on screen
};

Player.prototype.setCurrent = function(flag) {
    // TODO(makhov-aleksandr) store current flag
    this._isCurrent = flag;

    // TODO(makhov-aleksandr) render current indicator
    if(this._id == 0)
    {
        var indicator0 = document.getElementById("archer0_indicator");
        if(flag == true)
        {
            idicator0.className = " triangle";
        }
        else
        {
            idicator0.className = "";
        }
    }

    if(this._id == 1)
    {
        var indicator0 = document.getElementById("archer1_indicator");
        if(flag == true)
        {
            idicator1.className = " triangle";
        }
        else
        {
            idicator1.className = "";
        }
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