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
         self.drawArcher("archer0", pWorld.getArcher("archer0"));
         self.drawArcher("archer1", pWorld.getArcher("archer1"));
         if (pWorld.bulletExists()){
            self.drawBullet(pWorld.getBullet());
         }
      }, 1000/60);
   };

   Game.prototype.end = function(){
      window.location = "/";
   };

   Game.prototype.onState = function(data){
      var self = this;
      if(this.playerId == playerId){
         //значит мы ходим
         this.iAmActive = true;
         this.turnTimeout = setTimeout(function(){
            self.nextTurn()
         }, 20000);
      } else{
         var players = data.players;
         players.forEach(function(obj){
            pWorld.setArcherPos(obj.name, obj.pos);
         });
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
      $("." + name).offset(pos);
   };

   Game.prototype.drawBullet = function(pos){
      $(".bullet").addClass("bulletVisible").offset(pos);
   };
   Game.prototype.destroyBullet = function(){
      $(".bullet").removeClass("bulletVisible");
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
