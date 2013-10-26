var 
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
 	io = require('socket.io').listen(server),
 	path = require('path');

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');

app.use(express.logger('dev'));
app.use(app.router);
app.use(express.static(path.join(__dirname, '/static')));


app.get('/', function(req, res){

    res.render('index');

});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

server.listen(process.env.PORT || 80);