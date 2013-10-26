var 
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
 	io = require('socket.io').listen(server),
    config = require('./config'),
 	path = require('path'),
    mongoose = require('mongoose'),
    request = require('request');


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
   res.render('rooms');
});

app.get('/game', function(req, res){
    res.render('game');
});

app.post('/auth', function(req, res){
    if(req.body.token) {

        request.get('http://ulogin.ru/token.php?token=' + req.body.token + '&host=' + config.hostname, function(err, uloginres){
            if (err) {
                res.send(500, err);
            } else {
                var profile, jsonerr;
                try {
                    profile = JSON.parse(uloginres);
                } catch(e) {
                    jsonerr = e;
                }

                if(profile) {
                    if('error' in profile) {
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
                                        res.send(500, err);
                                    } else {
                                        res.session.user = {
                                            displayName: profile.first_name + ' ' + profile.last_name
                                        };
                                        res.redirect('/rooms');
                                    }
                                });
                            } else {
                                res.session.user = {
                                    displayName: dbResult[0].displayName
                                };
                                res.redirect('/rooms');
                            }
                        });
                    }
                } else {
                    res.send(500, jsonerr);
                }
            }
        })
    } else {
       res.send(404);
    }
});


io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

server.listen(process.env.PORT || 80);