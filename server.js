var express = require('express');
var path = require('path')
var app = express();
var srv = require('http').Server(app);

// Routing
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

// app.get('/public/style.css', function(req, res) {
// 	res.sendFile(__dirname + '/public/style.css');
// });

// app.use('/public/', express.static(__dirname + '/public'));
// app.use(express.static(__dirname + '/public'));
app.use('/public', express.static(path.join(__dirname, '/public/')));

// srv.listen(process.env.PORT);
srv.listen(process.env.PORT || 3000);
console.log('--> server initialized on port ' + srv.address().port);

// Sockets
var io = require('socket.io')(srv, {});
var playersConnected = 0;
// STATIC DATA IS PUT HERE TO AVOID HAVING TO SEND IT BACK AND FORTH BETWEEN PLAYERS
var ALLPLAYERS = {};

io.sockets.on('connection', function(socket){
	/* ------------ NEW PLAYER SETUP ---- */
	playersConnected++;
  console.log("--> player connected\t| " + socket.id + "\t| " + playersConnected);
  socket.on("newPlayerConnected", function(newPlayerData){ // RECEIVE ALL INITIAL PLR DATA
		let earlierPlayers = ALLPLAYERS;	// copy all players data only without the most recent player
		console.log("EARPLR: " + Object.keys(earlierPlayers).length );
		ALLPLAYERS[socket.id] = newPlayerData;	// add most recent player to the hash
		socket.broadcast.emit('playerConnected', newPlayerData);  // broadcast newest player to already connected players
		console.log(earlierPlayers);	// send older players to newest player
		socket.emit('chatMessage', {username: "Server", msg: "Hello! <br/> Use this chat to talk with other players. <br/> Use WASD to move around... <br/> Thats pretty much it for now :J" })
		socket.emit('beforePlayers', earlierPlayers);
  });

	/* ------------ GAME EVENTS ------------ */
	socket.on('playerMoveEvent', function(data){
    data.id = socket.id
		socket.broadcast.emit('otherPlayerMoved', data);
	});

	/* ------------ TECHNICAL ------------ */
	socket.on('disconnect', function() {
		let playerIdToUnfollow = socket.id;
		console.log("<-- player disconnected\t| " + socket.id + "\t| " + playersConnected);
		io.emit('playerDisconnected', playerIdToUnfollow);
		delete ALLPLAYERS[socket.id];
		playersConnected--;
	});


	socket.on('playerMouseDown', function(data) {
		socket.broadcast.emit('playerMouseDown', data);
	});

	
	/* ------------ CHAT ------------ */
	socket.on('chatMessage', function(messageData) {
		io.sockets.emit('chatMessage', messageData);
	});

	/* ------------ DEBUG ------------ */
	socket.on('bugz', d => {
		console.log("-------------- debug info --------------")
		console.log(ALLPLAYERS);
	});

});

