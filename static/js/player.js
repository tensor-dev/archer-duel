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

    var self = this;
    var downX = null;
    var downY = null;
    //Если координаты вектора больше нигде не потребуются, то можно не объявлять
    var vectorX, vectorY;
    $('body').delegate(".archer" + self._id, 'mousedown', function (e) {
        //Координаты нажатия мыши относительно окна
        downX = e.pageX;
        downY = e.pageY;
    });
    $("body").mouseup(function (e) {
        //Если кликали не там, где надо, то уходим
        if (downX == null || downY == null)
            return;
        //Считаем координаты обратного вектора
        vectorX = downX - e.pageX;
        vectorY = downY - e.pageY;
        self._fireCallback(self._id, vectorX, vectorY);
        downX = downY = null;
    });
};

Player.prototype.setHP = function(hp) {
    // TODO(sasha-vinogradov) change hp value
    // TODO(sasha-vinogradov) update hp indicator on screen
};

Player.prototype.setCurrent = function() {
    // TODO(makhov-aleksandr) store current flag
    // TODO(makhov-aleksandr) render current indicator
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