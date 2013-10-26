var 
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
 	io = require('socket.io').listen(server),
    config = require('./config'),
 	path = require('path'),
    mongoose = require('mongoose'),
    request = require('request'),
    Room = require('./lib/room'),
    Player = require('./lib/player'),
    rooms = [];


mongoose.connect(config.mongodb.connection);

var userSchema = mongoose.Schema({
    displayName: String,
    identity: String,
    network: String,
    games: Number,
    score: Number
});

var User = mongoose.model('User', userSchema);


app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.cookieParser());
app.use(express.cookieSession({ secret: 'secret', key: 's' }));
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, '/static')));

app.get('/', function(req, res){
    if(req.session.user) {
        res.redirect('/rooms');
    } else {
        res.redirect('/login')
    }
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/rooms', function(req, res){
   if(req.session.user) {
       User.find(function(err, scores){
           res.render('rooms', {
               rooms: rooms.map(function(r){
                   return r.toJSON();
               }),
               scoreboard: (scores || []).map(function(u){
                   return {
                       displayName: u.displayName,
                       games: u.games || 0,
                       score: u.score || 0
                   };
               }),
               currentUser: req.session.user || { displayName: '???' }
           });
       });
   } else {
       res.redirect('/login');
   }
});

app.get('/game/new', function(req, res){

    if(!req.session.user) {
        res.redirect('/login');
    } else {

        var availRooms = rooms.filter(function(room){
            return room.canAcceptPlayer();
        });

        var player = new Player(req.session.user);
        var room;

        // либо создаем комнату либо берем первую свободную и добавляем туда игрока
        // затем делаем редирект на эту комнату
        if(availRooms.length > 0) {
            console.log(req.session.user.displayName + " entering an eisting room");
            room = availRooms[0];
        } else {
            console.log(req.session.user.displayName + " creating a new room");
            rooms.push(room = new Room(io));
            // будем слушать на комнате событие winner
            room.on('winner', function(userid){
                User.find({ identity: userid }, function(err, users){
                    if (err) {
                        console.log("Error getting user with identity " + userid);
                        console.error(err);
                    } else {
                        users[0].games = (users[0].games || 0) + 1;
                        users[0].score = (users[0].score || 0) + 1;
                        users[0].save();
                    }
                })
            });
        }
        room.addPlayer(player);
        res.redirect('/game/' + room.getId());
    }

});

app.get('/game/:room', function(req, res){

    // Все спектакторы придут сюда, но они не добавлены как игроки.
    // При входе они отправят ready и будут прописаны в socket-комнату
    // и будут получать все извещения через броадкасты

    if(req.session.user) {
        console.log("Rendering room " + req.params.room + " for " + req.session.user.identity);
        var room = roomById(req.params.room);
        var roomState = room.toJSON();

        res.render('game', {
            userid: req.session.user.identity,
            player1: roomState.player1,
            player2: roomState.player2,
            position: room.getUserPosition(req.session.user.identity)
        });
    } else {
        res.redirect('/login');
    }
});

app.post('/auth', function(req, res){
    if(req.body.token) {

        request.get('http://ulogin.ru/token.php?token=' + req.body.token + '&host=' + config.hostname, function(err, response, uloginres){
            if (err) {
                res.send(500, err);
            } else {
                var profile, jsonerr;
                try {
                    profile = JSON.parse(uloginres + "");
                } catch(e) {
                    jsonerr = e;
                }

                if(profile) {
                    if('error' in profile) {
                        console.error(profile.error);
                        res.send(500, profile.error);
                    } else {
                        User.find({ identity: profile.identity }, function(err, dbResult){
                            if(err || dbResult && dbResult.length == 0) {
                                var user = new User({
                                    identity: profile.identity,
                                    network: profile.network,
                                    displayName: profile.first_name + ' ' + profile.last_name
                                });
                                user.save(function(err){
                                    if (err) {
                                        console.error(err);
                                        res.send(500, err.message);
                                    } else {
                                        req.session.user = {
                                            displayName: profile.first_name + ' ' + profile.last_name,
                                            identity: profile.identity
                                        };
                                        res.redirect('/rooms');
                                    }
                                });
                            } else {
                                req.session.user = {
                                    displayName: dbResult[0].displayName,
                                    identity: dbResult[0].identity
                                };
                                res.redirect('/rooms');
                            }
                        });
                    }
                } else {
                    console.log(uloginres);
                    console.error(jsonerr);
                    res.send(500, jsonerr.message);
                }
            }
        })
    } else {
       res.send(404);
    }
});


io.sockets.on('connection', function (socket) {

    socket.on('ready', function(data){
        var room = roomById(data.room);
        if(room) {
            room.addClient(socket, data);
        }
    });

    socket.on('leave', function(data){
        var room = roomById(data.room);
        if(room) {
            room.removeClient(socket, data);
        }
    });

});

// сборка умерших комнат
setInterval(function roomGC(){
    var filtered = rooms.reduce(function(memo, room){
        memo[room.isAlive() ? 'alive' : 'dead'].push(room);
        return memo;
    }, { alive: [], dead: [] });

    filtered.dead.forEach(function(deadRoom){
        deadRoom.dispose();
    });

    rooms = filtered.alive;
}, 100);

function roomById(id) {
    return rooms.filter(function(room){
        return room.getId() == id;
    })[0];
}

server.listen(process.env.PORT || 555);
