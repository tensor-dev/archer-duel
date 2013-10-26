(function () {
   var cb = null;
   var world = null;
   var groundBody = null;
   var archers = {};
   var archer1_body = null;
   var archer1_body = null;
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
         y : 20,
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




   var ContactListener = function () {
   };

   ContactListener.prototype = Box2D.Dynamics.b2ContactListener.prototype;
   // обрабатываем столкновения
   ContactListener.prototype.PostSolve = function (contact, impulse) {
      var
         dataA = contact.GetFixtureA().GetBody().GetUserData(),
         dataB = contact.GetFixtureB().GetBody().GetUserData();

      if (dataA.name == "bullet"){
         world.DestroyBody(bullet);
         bullet = undefined;
         cb({
            hit : /archer/.test(dataB.name),
            to : /.$/.exec(dataB.name)[0],
            hp : 1
         })
      }
   };

   window.pWorld = {

      step: function () {
         var timeStep = 1 / 60;
         var iterations = 10;
         world.Step(timeStep, iterations);
      },

      initWorld: function (data) {
         cb = data.onHit;
         world = createWorld();
         createGround();
         createArcher("archer0", {x : 10, y : 16});
         createArcher("archer1", {x : 90, y : 16});
         world.SetContactListener(new ContactListener());
      },

      getHit: function (name) {
         if (name == "archer0")
            return archer0_body.userData.hp;
         if (name == "archer1")
            return archer1_body.userData.hp;
      },

      createBullet: function (name, vector, cb) {
         var property = {};
         var pos = archers[name].GetPosition();
         property.x = pos.x + (vector.x > 0 ? 2 : -2);
         property.y = pos.y - 2; // против столкновения
         property.height = 1;
         property.width = 1;
         property.name = "bullet";
         property.type = "dynamic";
         bullet = createBody(property);
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

      getBullet: function(){
         var
            pos = bullet.GetPosition(),
            data = bullet.GetUserData();

         return {
            left : (pos.x-data.width/2)*PIXELS_AS_METER,
            top : (pos.y-data.height/2)*PIXELS_AS_METER
         }
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
