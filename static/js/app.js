(function(){
   var
      socket = io.connect('/'),
      connectData = {
         room : /[^\/]*$/.exec(window.location.pathname)[0],
         id : window.currentUserId
      },
      gameInst;



   var Game = function(playerId){
      this.playerId    = playerId;
      this.iAmActive   = this.playerId === 0;
      this.turnTimeout = null;
      this.elems= {
         "archer0" : $(".archer0")[0],
         "archer1" : $(".archer1")[0],
         "bullet"  : $(".bullet")[0]
      };

      this.init();
   };

   Game.prototype.init = function(){
      var self = this;

      pWorld.initWorld({
         onHit : function(data){
            self.destroyBullet();

            if(data.hit){
               socket.emit("hit", data);
            }
            self.nextTurn();
         }
      });

      setInterval(function(){
         pWorld.step();
         if (!pWorld.IsSleep("archer0")){
            self.drawArcher("archer0", pWorld.getArcher("archer0"));
         }
         if (!pWorld.IsSleep("archer1")){
            self.drawArcher("archer1", pWorld.getArcher("archer1"));
         }
         if (pWorld.bulletExists()){
            self.drawBullet(pWorld.getBullet());
         }
      }, 1000/60);
   };

   Game.prototype.end = function(){
      window.location = "/";
   };

   Game.prototype.onState = function(data){
      var winner = null;
      if(this.playerId == data.currentPlayer){
         this.iAmActive = true;
         pWorld.changeWind(data.wind);
      }

      if (!data["player1"].hp){
         winner = 1;
      }
      else if (!data["player2"].hp){
         winner = 0;
      }

      if (winner){
         socket.emit("stopGame", {winner : winner});
      }
   };

   Game.prototype.fire = function(pId, vec){
      this.iAmActive = false;
      socket.emit("fire", {name: pId, vec: vec});
   };

   Game.prototype.nextTurn = function(){
      clearTimeout(this.turnTimeout);
      socket.emit("nextTurn");
   };

   Game.prototype.drawArcher = function(name, pos){
      this.elems[name].style.top = pos.top + "px";
      this.elems[name].style.left = pos.left + "px";
   };

   Game.prototype.drawBullet = function(pos){
      $(this.elems["bullet"]).addClass("bulletVisible");
      this.elems["bullet"].style.top = pos.top + "px";
      this.elems["bullet"].style.left = pos.left + "px";
   };
   Game.prototype.destroyBullet = function(){
      $(this.elems["bullet"]).removeClass("bulletVisible");
   };

   socket.on('gameStart', function(){
      gameInst =  new Game(window.currentPlayerPosition);
   });

   socket.on('state', function (data) {
      gameInst.onState(data);
   });

   socket.on('nextTurn', function (data) {
      gameInst.iAmActive = data.id == gameInst.playerId;
   });

   socket.on('fire', function(data){
      pWorld.createBullet("archer" + data.name, data.vec);
   });

   socket.on('gameEnd', function(){
      gameInst.end();
   });

   socket.emit("ready", connectData);

   $(window).unload(function() {
      socket.emit("leave", connectData);
   });

   $("body").keyup(function(e){
      if(e.which == 32 && gameInst.playerId > -1 && !pWorld.bulletExists() && gameInst.iAmActive){
         if (gameInst.playerId == 0){
            gameInst.fire(gameInst.playerId, {x : 25,y : -15});
         }
         else{
            gameInst.fire(gameInst.playerId, {x : -25,y : -15});
         }
      }
   })
}());
