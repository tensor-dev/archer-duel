(function () {
   var cb = null;
   var world = null;
   var groundBody = null;
   var archers = {};
   var archer1_body = null;
   var archer2_body = null;
   var bullet = undefined;

   var PIXELS_AS_METER = 30;


   function createWorld() {
      return new Box2D.Dynamics.b2World(
         new Box2D.Common.Math.b2Vec2(0, 10),
         true)
   }

   // property = height, width, x, y, name, hp
   function createBody(property) {
      var
         body,
         body_fix_def,
         body_def;

      body_fix_def = new Box2D.Dynamics.b2FixtureDef();
      body_fix_def.shape = new Box2D.Collision.Shapes.b2PolygonShape();
      body_fix_def.shape.SetAsBox(property.width / 2, property.height / 2);

      body_fix_def.density = 1.0;
      body_fix_def.friction = 1;
      body_fix_def.restitution = 0.2;

      body_def = new Box2D.Dynamics.b2BodyDef();

      if (property.type == "dynamic"){
         body_def.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
      }

      body_def.position.Set(property.x, property.y);

      if (property.name == "bullet")
         body_def.isBullet = true;

      body = world.CreateBody(body_def);
      body.CreateFixture(body_fix_def);

      // устанавливаем hp и name
      body.SetUserData({
         name : property.name,
         hp : property.hp || null,
         width : property.width,
         height: property.height
      });
      return body;
   }

   function createGround() {
      createBody({
         name : "ground",
         x : 50,
         y : 19.5,
         width : 100,
         height: 1
      });
   }

   function createArcher(name, pos){
      archers[name] = createBody({
         name : name,
         hp : 3,
         type : "dynamic",
         x : pos.x,
         y : pos.y,
         width : 2.5,
         height: 3
      });
   }

   function createBullet(name, vector){
      var pos = archers[name].GetPosition();

      bullet = createBody({
         name : "bullet",
         type : "dynamic",
         x : pos.x,
         y : pos.y,
         width : 1,
         height: 1
      });

      bullet.ApplyImpulse(new Box2D.Common.Math.b2Vec2(vector.x, vector.y), bullet.GetWorldCenter());
   }




   var contactListener = function () {
   };

   // обрабатываем столкновения
   contactListener.prototype.PostSolve = function (contact, impulse) {
      //hit
      var
         cbData = {},
         body = contact.GetBodyB();

      world.DestroyBody(bullet);
      bullet = undefined;

      console.log("asdasdasd");
      /*cbData.name = body.GetUserData().name;

      if (cbData.name == "archer1") {
         archer1_body.userData.hp--;
         cbData.hp = archer1_body.userData.hp;
      }
      if (contact.GetBodyB.userData.name == "archer2") {
         archer2_body.userData.hp--;
         cbData.hp = archer2_body.userData.hp;
      }



      cb(cbData);*/
   };

   window.pWorld = {

      step: function () {
         contactListener.prototype = Box2D.Dynamics.b2ContactListener;
         var timeStep = 1 / 60;
         var iterations = 10;
         world.Step(timeStep, iterations);
      },

      initWorld: function (data) {
         cb = data.onHit;
         world = createWorld();
         //earthBody
         createGround();



         ///groundBodyDef; groundBodyDef.position.Set(0.0f, -10.0f);
         //groundBodyDef; groundBodyDef.position.Set(0.0f, -10.0f);
         createArcher("archer1", {x : 5, y : 5});
         createArcher("archer2", {x : 95, y : 5});
      },

      getHit: function (name) {
         if (name == "archer1")
            return archer1_body.userData.hp;
         if (name == "archer2")
            return archer2_body.userData.hp;
      },

      createBullet: function (name, vector, cb) {
         var property = {};
         property.x = world.getArcherPos(name).x;
         property.y = world.getArcherPos(name).y + 1; // против столкновения
         property.height = 1;
         property.width = 1;
         property.name = "bullet";
         bullet = createBody(world, property);
         // применить импульс
         bullet.ApplyImpulse(new Box2D.Common.Math.b2Vec2(vector.x, vector.y), bullet.GetWorldCenter());
      },

       jump : function (name, dir) {
           var vect = {};// = new Box2D.Common.Math.b2Vec2(vector.x, vector.y);
           if (dir == "left")
               vect = new Box2D.Common.Math.b2Vec2(-2, 2);
           if (dir == "right")
               vect = new Box2D.Common.Math.b2Vec2(2, 2);
           archers[name].ApplyImpulse(vect, archers[name].GetCenter().GetWorldCenter());
       },

      bulletExists: function () {
         return bullet !== undefined;
      },

      getArcher: function(name){
         var
            body = archers[name],
            pos = body.GetPosition(),
            data = body.GetUserData();



         return {
            left : (pos.x-data.width/2)*PIXELS_AS_METER,
            top : (pos.y-data.height/2)*PIXELS_AS_METER
         }
      }



   };

}());
