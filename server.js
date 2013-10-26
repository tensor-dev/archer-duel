var 
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
 	io = require('socket.io').listen(server),
 	path = require('path'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy;

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');

app.use(express.logger('dev'));
app.use(app.router);
app.use(express.static(path.join(__dirname, '/static')));

app.get('/', function(req, res){
    res.render('index');
});

passport.use(new TwitterStrategy({
        consumerKey: 'Bd0nxcKLyfOObEX3ng1qQ',
        consumerSecret: 'lrb4jfcO3G74tb9RPRI4Unb0ZF3BeU89pFms46Ryuo',
        callbackURL: "http://www.example.com/auth/twitter/callback"
    },
    function(token, tokenSecret, profile, done) {
        console.log(require('util').inspect(profile));
        done();
    }
));

// Redirect the user to Twitter for authentication.  When complete, Twitter
// will redirect the user back to the application at
//   /auth/twitter/callback
app.get('/auth/twitter', passport.authenticate('twitter'));

// Twitter will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

server.listen(process.env.PORT || 80);