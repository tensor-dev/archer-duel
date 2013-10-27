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
      this.players = {};
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
            console.log("hit!!!");
            self.destroyBullet();

            if(data.hit){
               console.log("emit : hit");
               socket.emit("hit", data);
            }
            else{
               gameInst.nextTurn();
            }
         }
      });

      setInterval(function(){
         pWorld.step();
         if (!pWorld.isSleep("archer0")){
            self.drawArcher("archer0", pWorld.getArcher("archer0"));
         }
         if (!pWorld.isSleep("archer1")){
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

   Game.prototype.mouseFire = function(id, x, y){
      gameInst.fire(id, {x : x, y : y});
   };

   Game.prototype.onState = function(data){
      var winner = null;
      if(this.playerId == data.currentPlayer){
         this.iAmActive = true;
         pWorld.changeWind(data.wind/10);
         ChangeWind(data.wind);
      }

      this.players["player1"] = this.players["player1"] || new Player(0, data["player1"].name, 3, gameInst.mouseFire());
      this.players["player2"] = this.players["player2"] || new Player(1, data["player2"].name, 3, gameInst.mouseFire());

      this.players["player1"].setHP(data["player1"].hp);
      this.players["player2"].setHP(data["player2"].hp);

      console.log("received state : " + JSON.stringify(data));

      if (!data["player1"].hp){
         winner = 1;
      }
      else if (!data["player2"].hp){
         winner = 0;
      }

      if (winner !== null){
         socket.emit("stopGame", {winner : winner});
         console.log("emit : stopGame; winner : " + winner );
      }
   };

   Game.prototype.fire = function(pId, vec){
      this.iAmActive = false;
      socket.emit("fire", {name: pId, vec: vec});
      console.log("emit : fire");
   };

   Game.prototype.nextTurn = function(){
      clearTimeout(this.turnTimeout);
      socket.emit("nextTurn");
      console.log("emit : nextTurn");
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

   socket.on('gameStart', function(data){
      gameInst =  new Game(window.currentPlayerPosition);
      gameInst.onState(data);
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

   /*$("body").keyup(function(e){
      if(e.which == 32 && gameInst.playerId > -1 && !pWorld.bulletExists() && gameInst.iAmActive){
         if (gameInst.playerId == 0){
            gameInst.fire(gameInst.playerId, {x : 25,y : -15});
         }
         else{
            gameInst.fire(gameInst.playerId, {x : -25,y : -15});
         }
      }
   })*/
}());
