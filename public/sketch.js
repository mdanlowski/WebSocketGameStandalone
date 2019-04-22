/* A way - new player sends his object to the server, then server broadcasts it and his position
*   later on only guid and new position are sent, and stored in every client's in array of objects
* B way - data is broadcasted and players are drawn "on the spot"
*/
function setup() {
  let canvas = createCanvas(600, 500);
  canvas.parent("canvas-container")
  background("white");
  while(plr.guid == 0){
    plr.guid = socket.id;
  }
  socket.emit("newPlayerConnected", plr); // SEND ALL INITIAL PLAYER DATA
  console.log(COLOR);
}

function draw(){
  background(0,200,100);
  
  // --------->>> HNDLE SOCKET EVENTS -----------
  // PULL OLD / ADD NEW PLAYERS
  socket.on('beforePlayers', function(olderPlayersData){
    // console.log(Object.keys(olderPlayersData));
    for(let pid of Object.keys(olderPlayersData)){
      if (!otherPlayers.hasOwnProperty(pid) && pid != plr.guid) { otherPlayers[pid] = olderPlayersData[pid]; }
    }
  });
  socket.on('playerConnected', function(playerData) {
    otherPlayers[playerData.guid] = playerData;
  });
  socket.on('playerDisonnected', function(playerIdToUnfollow) {
    console.log("disconnected: ", playerIdToUnfollow)
    console.log(otherPlayers);
    delete otherPlayers[playerIdToUnfollow];
    console.log(otherPlayers);

  });
  socket.on('otherPlayerMoved', function(data) {
        let x_ = data.x;    otherPlayers[data.id].x = x_;
        let y_ = data.y;    otherPlayers[data.id].y = y_;
  });
  // ----------- HNDLE SOCKET EVENTS <<<---------
  // handleSocketEvents();
  
  plr.update(socket);

  // DRAW OTHER PLAYERS
  for(let pid of Object.keys(otherPlayers)){
    // console.log(pid);
    // console.log(otherPlayers[pid]);
    if(pid == 0) delete otherPlayers[pid];
    fill(otherPlayers[pid].clr)
    ellipse(otherPlayers[pid].x, otherPlayers[pid].y, 30, 30);
    fill(COLOR);
  }

}

/* GLOBALS / CONFIG */
var socket = io();
let randomColor = HTML5COLORS[Math.floor(Math.random()*HTML5COLORS.length)];
var plr = new Player(300, 300, 100, 10, randomColor, projectileEmitter);

var COLOR = plr.clr;

var otherPlayers = {};


/* SUBROUTINES */
function pullAllPlayers(data){
  for(let pid of Object.keys(data)){
    console.log(data.pid)
  }
}

function handleSocketEvents(){
  socket.on('newPlayerConnected', function(data) {
    otherPlayers[socket.id] = data;
  });
  socket.on('playerDisonnected', function(data) {
    delete otherPlayers[socket.id];
  });
  socket.on('otherPlayerMoved', function(data) {
    otherPlayers[socket.id].x += data.x;
    otherPlayers[socket.id].y += data.y;
  });

}



var projectileEmitter = {
  projectileType  : "bullet",
  projectileSpeed : 8,
  fireMode  : "auto",
  fireRate  : 5,
  damage 	  : 10
}




// dump 
/*
var playerColor = 'black';

function draw() {
    // background(0, 255, 100);
}

function mouseDragged(){
    stroke(playerColor);
    strokeWeight(5);

    line(mouseX, mouseY, pmouseX, pmouseY);
    onMouseDown(playerColor, mouseX, mouseY, pmouseX, pmouseY);
}

function onMouseDown(color, x, y, prevx, prevy) {
    var data = {
        clr : color,
        x : x,
        y : y,
        px : prevx,
        py : prevy
    };

    socket.emit('playerMouseDown', data);
}

function sendChatMessage(){
    let messageBody = $('#message-body')[0].value;
    if(!messageBody.length || messageBody.match(/(^\s*$)/)){
      alert("Cannot send empty message");
      return;
    }
    console.log(messageBody);

    var data = {
        username : socket.username,
        msg : messageBody.trim(),
    };

    socket.emit('chatMessage', data);
    $('#message-body')[0].value = null;
}

function setrgb(r, g, b){
  console.log(r)
  console.log(r[0])
  console.log(r.substr(0,3))
  console.log(r.substr(3,2))
  console.log(r.substr(5,3))

    if(r[0] == "#"){
      hex
      g = unhex(r.substr(3,2));
      b = unhex(r.substr(5,2));
      r = unhex(r.substr(1,2));
    }
    playerColor = 'rgb(' + r + ',' + g + ',' + b + ')';
    console.log(playerColor);

}

function readKey(e){
  var k = e.key;
  k==="Enter" ? sendChatMessage() : null;
};*/