function Player(id, name, hp, fireCallback) {

    this._id = id;
    this._name = name;
    this._hp = hp;
    this._isCurrent = false;
    this._fireCallback = fireCallback;

    this._render();
}

Player.prototype._render = function() {

    //render hp indicator
	$(function(){
	if (this.getID()==0)
	{
		//render name
		$( "#nickname1" ).text( this.getName() );
		var current_hp = this.getHP();
		if (current_hp==0)
			{
				$("#11").removeClass("block_hearts_empty");
				$("#11").addClass("block_hearts_empty");
				$("#12").removeClass("block_hearts_empty");
				$("#12").addClass("block_hearts_empty");
				$("#13").removeClass("block_hearts_empty");
				$("#13").addClass("block_hearts_empty");
			}
		else if (current_hp==1)
			{
				$("#11").removeClass("block_hearts_empty");
				$("#11").addClass("block_hearts_full");
				$("#12").removeClass("block_hearts_empty");
				$("#12").addClass("block_hearts_empty");
				$("#13").removeClass("block_hearts_empty");
				$("#13").addClass("block_hearts_empty");
			}
		else if (current_hp==2)
			{
				$("#11").removeClass("block_hearts_empty");
				$("#11").addClass("block_hearts_full");
				$("#12").removeClass("block_hearts_empty");
				$("#12").addClass("block_hearts_full");
				$("#13").removeClass("block_hearts_empty");
				$("#13").addClass("block_hearts_empty");
			}
		else if (current_hp==3)
			{
				$("#11").removeClass("block_hearts_empty");
				$("#11").addClass("block_hearts_full");
				$("#12").removeClass("block_hearts_empty");
				$("#12").addClass("block_hearts_full");
				$("#13").removeClass("block_hearts_empty");
				$("#13").addClass("block_hearts_full");
			}
	}
	else if (this.getID()==1)
	{
		//render name
		$( "#nickname2" ).text( this.getName() );
		if (current_hp==0)
			{
				$("#21").removeClass("block_hearts_none");
				$("#21").addClass("block_hearts_empty");
				$("#22").removeClass("block_hearts_none");
				$("#22").addClass("block_hearts_empty");
				$("#23").removeClass("block_hearts_none");
				$("#23").addClass("block_hearts_empty");
			}
		else if (current_hp==1)
			{
				$("#21").removeClass("block_hearts_none");
				$("#21").addClass("block_hearts_full");
				$("#22").removeClass("block_hearts_none");
				$("#22").addClass("block_hearts_empty");
				$("#23").removeClass("block_hearts_none");
				$("#23").addClass("block_hearts_empty");
			}
		else if (current_hp==2)
			{
				$("#21").removeClass("block_hearts_none");
				$("#21").addClass("block_hearts_full");
				$("#22").removeClass("block_hearts_none");
				$("#22").addClass("block_hearts_full");
				$("#23").removeClass("block_hearts_none");
				$("#23").addClass("block_hearts_empty");
			}
		else if (current_hp==3)
			{
				$("#21").removeClass("block_hearts_none");
				$("#21").addClass("block_hearts_full");
				$("#22").removeClass("block_hearts_none");
				$("#22").addClass("block_hearts_full");
				$("#23").removeClass("block_hearts_none");
				$("#23").addClass("block_hearts_full");
			}
	}

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
    //update hp indicator on screen
		if (this.getID()==0)
		{
			if (this._hp==1)
				{
					if ((hp==1)||(hp==2))
					{
						$("#11").removeClass("block_hearts_full");
						$("#11").addClass("block_hearts_empty");
					}
				}
			if (this._hp==2)
				{
					if (hp==1)
					{
						$("#12").removeClass("block_hearts_full");
						$("#12").addClass("block_hearts_empty");
					}
					if (hp==2)
					{


						$("#12").removeClass("block_hearts_full");
						$("#12").addClass("block_hearts_empty");
						$("#11").removeClass("block_hearts_full");
						$("#11").addClass("block_hearts_empty");
					}
				}
			if (this._hp==3)
				{
					if (hp==1)
					{
						$("#13").removeClass("block_hearts_full");
						$("#13").addClass("block_hearts_empty");
					}
					if (hp==2)
					{
						$("#13").removeClass("block_hearts_full");
						$("#13").addClass("block_hearts_empty");
						$("#12").removeClass("block_hearts_full");
						$("#12").addClass("block_hearts_empty");
					}
				}


		}
		else if (this.getID()==1)
		{
			if (this._hp==1)
				{
					if ((hp==1)||(hp==2))
					{
						$("#21").removeClass("block_hearts_full");
						$("#21").addClass("block_hearts_empty");
					}
				}
			if (this._hp==2)
				{
					if (hp==1)
					{
						$("#22").removeClass("block_hearts_full");
						$("#22").addClass("block_hearts_empty");
					}
					if (hp==2)
					{
						$("#22").removeClass("block_hearts_full");
						$("#22").addClass("block_hearts_empty");
						$("#21").removeClass("block_hearts_full");
						$("#21").addClass("block_hearts_empty");
					}
				}
			if (this._hp==3)
				{
					if (hp==1)
					{
						$("#23").removeClass("block_hearts_full");
						$("#23").addClass("block_hearts_empty");
					}
					if (hp==2)
					{
						$("#23").removeClass("block_hearts_full");
						$("#23").addClass("block_hearts_empty");
						$("#22").removeClass("block_hearts_full");
						$("#22").addClass("block_hearts_empty");
					}
				}
		}
		//change hp value
		this._hp-=hp;
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

Player.prototype.getID = function() {
	return this._id
};

