/***********************
*     PEARL Server      *
***********************/

/* "node pearlserver.js" starts local server with this script */
var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});



/* For future usernames */
var usernames = {};

var state = "cover";


io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});






io.sockets.on('connection', function (socket) {


	var name = "user"+~~(Math.random()*100000);
	socket.username = name;
	usernames[name] = name;
	io.sockets.emit('updateusers', usernames);
	io.sockets.emit('loadpage', state, 0);

	/* Send gestures to all users 
	   (conceived as a "chat" with gestures) */
		
	/* THIS HANDLES DAISYHEAD DATA */	
	socket.on('sendchat', function (type, data) {
		/* return update chat */
		io.sockets.emit('updatechat', type, data);
	});
	
	/* THIS HANDLES PEARLRIVER DATA */
	socket.on('senddata', function (type, data) {
		/* return update chat */
		io.sockets.emit('updatedata', type, data);
	});

	socket.on('sendpearlchat', function (type, data) {
		/* return update chat */
		io.sockets.emit('updatepearlchat', type, data);
	});


	socket.on('disconnect', function() {
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
	});


	/* THIS HANDLES PLAYAUDIO INSTRUCTIONS DATA */
	socket.on('s_playsound', function (type, data) {
		console.log("s_play")
		io.sockets.emit('playsound', type, data);
	});


	/* THIS HANDLES LOADPAGE INSTRUCTIONS DATA */
	socket.on('s_loadpage', function (page, group) {
		state = page;
		console.log("s_play")
		io.sockets.emit('loadpage', page, group);
	});
});