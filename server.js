var 
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
 	io = require('socket.io').listen(server),
    config = require('./config'),
 	path = require('path'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    mongoose = require('mongoose');

mongoose.connect(config.mongodb.connection);

var userSchema = mongoose.Schema({
    provider: String,
    displayName: String,
    providerId: String,
    games: Number,
    score: Number
});

var User = mongoose.model('User', userSchema);


app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');

app.use(express.cookieParser());
app.use(express.cookieSession({ secret: 'secret', key: 's' }));
app.use(express.logger('dev'));
app.use(app.router);
app.use(express.static(path.join(__dirname, '/static')));

app.get('/', function(req, res){
    res.render('index');
});

app.get('/rooms', function(req, res){
   res.render('rooms');
});

app.get('/game', function(req, res){
    res.render('game');
});

passport.use(new TwitterStrategy(config.twitter, function(token, tokenSecret, profile, done) {
    User.find({ providerId: profile.id }, function(err, res){
        if(err || res && res.length == 0) {
            var user = new User({
                provider: profile.provider,
                displayName: profile.displayName,
                providerId: profile.id
            });
            user.save(function(err){
                if (err) {
                    done(err);
                } else {
                    done(null, user);
                }
            })
        } else {
            done(null, res[0]);
        }
    });
}));

// Redirect the user to Twitter for authentication.  When complete, Twitter
// will redirect the user back to the application at
//   /auth/twitter/callback
app.get('/auth/twitter', passport.authenticate('twitter'));

// Twitter will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/rooms',
    failureRedirect: '/?authFailed'
}));

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

server.listen(process.env.PORT || 80);