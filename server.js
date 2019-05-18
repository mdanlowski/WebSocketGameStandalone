/**
 @TODO timestamp event security - reject events that are shifted
 ``

*/
var express = require('express');
var path = require('path')
var app = express();
var srv = require('http').Server(app);

const welcomeMessage = {
  username: "Server",
  msg: "Hello! Use this chat to talk with other players. Use WASD to move around... Thats pretty much it for now :J" 
}

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
srv.listen(process.env.PORT || 4000);
console.log(`--> server initialized on port ${srv.address().port}`);

// Sockets
var io = require('socket.io')(srv, {});
var playersConnected = 0;
// STATIC DATA IS PUT HERE TO AVOID HAVING TO SEND IT BACK AND FORTH BETWEEN PLAYERS
var ALLPLAYERS = {};
var DEADPLAYERS = {};

io.sockets.on('connection', function(socket){
	/* ------------ NEW PLAYER SETUP ---- */
	playersConnected++;
  console.log(`--> player connected\t| ${socket.id}\t| ${playersConnected}`);
  socket.on("newPlayerConnected", function(newPlayerDataObject){                // RECEIVE ALL INITIAL PLR DATA
		let earlierPlayers = ALLPLAYERS;	                                          // copy all players data only without the most recent player
		// console.log("EARPLR: " + Object.keys(earlierPlayers).length );
		ALLPLAYERS[socket.id] = newPlayerDataObject;  	                            // add most recent player to the hash
		socket.broadcast.emit('playerConnected', newPlayerDataObject);              // broadcast newest player to already connected players
		console.log(earlierPlayers);	                                              // send older players to newest player
		socket.emit('chatMessage', welcomeMessage);
		socket.emit('newPlayerGetsConnectedPlayers', earlierPlayers);
  });

	/* ------------ GAME EVENTS ------------ */
	socket.on('playerMoveEvent', function(playerMoveData){
    socket.broadcast.emit('otherPlayerMoved', playerMoveData);
    return;   
	});
  // Broadcast new bullet fired
  socket.on('playerFireEvent', function(playerFireData) {
    socket.broadcast.emit('otherPlayerFired', playerFireData);
    return;
	});
	socket.on('playerGetsHitEvent', function(playerHitData) {
		// console.log(playerHitData);
		ALLPLAYERS[playerHitData.guid].hp -= playerHitData.damage;
		socket.broadcast.emit('otherPlayerGotHit', playerHitData);
    return;
	});
	socket.on('playerDieEvent', function(playerDeathData) {
    socket.broadcast.emit('otherPlayerDied', playerDeathData);
    return;
	});
	
	/* ------------ TECHNICAL ------------ */
	socket.on('disconnect', function() {
		let playerIdToUnfollow = socket.id;
		io.emit('playerDisconnected', playerIdToUnfollow);
		delete ALLPLAYERS[socket.id];
		playersConnected--;
		console.log(`<-- player disconnected\t| ${socket.id}\t| ${playersConnected}`);
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
