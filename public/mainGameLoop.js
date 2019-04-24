var connectionReady = false;

/* ------------------------ GLOBALS / CONFIG ------------------------ */
const socket = io();

let randomColor = HTML5COLORS[Math.floor(Math.random()*HTML5COLORS.length)];

// Balancing settings to be tweaked
const Balancer = GameBalanceSettings;

// CLIENT-SIDE PLAYER OBJECT
const plr = new Player(0, 300, 300, 100, 10, randomColor, projectileEmitter);
var COLOR = plr.clr; // required because of scoping issues with p5

// ALL PROJECTILES ON THE SCREEN
var bullets = [];

// CLIENT-SIDE PLAYERS CONTAINER
var otherPlayers = {};


// Connect to the server and send initial player data
socket.on('connect', () => {
  plr.guid = socket.id;
  console.log(socket.connected); // true
  socket.emit("newPlayerConnected", plr);
});

/* ------------------------ GAME CANVAS SETUP ------------------------ */
function setup() {
  var canvas = createCanvas(640, 640);
  canvas.parent("canvas-container");
  textSize(16);
  initialFrameCount = frameCount;

  socket.on('beforePlayers', function(olderPlayersData){                        // pull players that joined before current client
    // console.log(Object.keys(olderPlayersData));
    for(let pid of Object.keys(olderPlayersData)){
      if (!otherPlayers.hasOwnProperty(pid) && pid != plr.guid) { otherPlayers[pid] = olderPlayersData[pid]; }
    }
    return;
  });
  socket.on('playerConnected', function(playerData) {                           // pull each new player
    otherPlayers[playerData.guid] = playerData;
    return;
  });
  socket.on('playerDisconnected', function(playerIdToUnfollow) {                // delete DC'd player
    delete otherPlayers[playerIdToUnfollow];
    return;
  });
  socket.on('otherPlayerMoved', function(data) {                                // handle movements
      let x_ = data.x;
      let y_ = data.y;
      otherPlayers[data.guid].x = x_;
      otherPlayers[data.guid].y = y_;
      return;
  });
  socket.on('otherPlayerFired', function(data) {                                // handle shooting from remotes
    let b = data[0]; let g = data[1];
    let remoteBullet = new Bullet({x: b.x, y: b.y}, [0,0], g);
        remoteBullet.heading = b.heading;
    bullets.push(remoteBullet);
    return;
  });


  console.log(COLOR);
}

var initialFrameCount = 0;

/* ------------------------ GAME CANVAS UPDATE ------------------------ */
function draw(){
  background(0,200,100);
    
  plr.update(socket);

  // DRAW OTHER PLAYERS
  for(let pid of Object.keys(otherPlayers)){
    fill(otherPlayers[pid].clr)
    ellipse(otherPlayers[pid].x, otherPlayers[pid].y, 30, 30);
    fill(COLOR);
    if(pid == 0) delete otherPlayers[pid];
  }

  // DRAW PROJECTILES
  for(let obj of bullets){
    obj.update(obj, bullets, height, width);
  }

  // HANDLE SHOOTING LOCAL
  if(mouseIsPressed && mouseButton === LEFT){
    if(frameCount - initialFrameCount > Balancer.fireRateBase/plr.gun.fireRateDivisor ){
      let b = new Bullet({x: plr.x, y: plr.y}, [mouseX, mouseY], plr.gun)
      bullets.push(b);
      initialFrameCount = frameCount;
      // newBulletData = [{x: plr.x, y: plr.y}, [mouseX, mouseY], plr.gun];
      // socket.emit('playerFireEvent', newBulletData);
      socket.emit('playerFireEvent', [b, plr.gun]);
		}
  }
  
  
}




/* ------------------------ SUBROUTINES ------------------------ */
// function mousePressed() {
//   socket.emit('playerFireStart', ()=>{});
// }

// *** download other players data 
// [DEPR]
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