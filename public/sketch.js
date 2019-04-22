var connectionReady = false;


/* GLOBALS / CONFIG */
var socket = io();
let randomColor = HTML5COLORS[Math.floor(Math.random()*HTML5COLORS.length)];
// @ISSUE back to guid generation bc socket.id fails in production
// let newGuid = Date.now().toString().substr(4) + "-" + Math.random().toString().substr(3,4);
var plr = new Player(0, 300, 300, 100, 10, randomColor, projectileEmitter);

var COLOR = plr.clr;

var otherPlayers = {};


// CONNECT AND SEND ALL INITIAL PLAYER DATA 
socket.on('connect', () => {
  plr.guid = socket.id;
  console.log(socket.connected); // true
  socket.emit("newPlayerConnected", plr);
});


function setup() {
  let canvas = createCanvas(600, 500);
  canvas.parent("canvas-container");
  
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
  socket.on('playerDisconnected', function(playerIdToUnfollow) {
    delete otherPlayers[playerIdToUnfollow];
  });
  socket.on('otherPlayerMoved', function(data) {
        let x_ = data.x;    otherPlayers[data.guid].x = x_;
        let y_ = data.y;    otherPlayers[data.guid].y = y_;
  });
  // ----------- HANDLE SOCKET EVENTS <<<---------
  // handleSocketEvents();
  
  plr.update(socket);

  // DRAW OTHER PLAYERS
  for(let pid of Object.keys(otherPlayers)){
    fill(otherPlayers[pid].clr)
    ellipse(otherPlayers[pid].x, otherPlayers[pid].y, 30, 30);
    fill(COLOR);
    if(pid == 0) delete otherPlayers[pid];
  }

}




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