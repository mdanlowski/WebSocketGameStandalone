var connectionReady = false;

/* ------------------------ GLOBALS / CONFIG ------------------------ */
const socket = io();

// let BACKGCOLOR = "#ABABAB";
let BACKGCOLOR = "black";
const randomColor = HTML5COLORS[Math.floor(Math.random()*HTML5COLORS.length)];

// Balancing settings to be tweaked
const Balancer = GameBalanceSettings;

// CLIENT-SIDE PLAYER OBJECT
const plr = new Player(0, 300, 300, 100, 10, randomColor, projectileEmitter);
var COLOR = plr.clr; // required because of scoping issues with p5

// ALL PROJECTILES ON THE SCREEN
var bullets = [];

// CLIENT-SIDE PLAYERS CONTAINER
var otherPlayers = {};
var deadPlayers = {};


// Connect to the server and send initial player data
socket.on('connect', () => {
  plr.guid = socket.id;
  console.log(socket.connected); // true
  socket.emit("newPlayerConnected", plr);

  // for errors @BUG
});
  
  /* ------------------------ GAME SETUP ------------------------ */
function setup() {
  var canvas = createCanvas(640, 640);
  canvas.parent("canvas-container");
  textSize(16);
  initialFrameCount = frameCount;

  socket.on('newPlayerGetsConnectedPlayers', function(olderPlayersData){        // pull players that joined before current client
    // console.log(Object.keys(olderPlayersData));
    // @BUG : connect 1 tab, then 2, 2 doesnt see 1 until 1 reloads
    for(let playerId of Object.keys(olderPlayersData)){
      if (!otherPlayers.hasOwnProperty(playerId) && playerId != plr.guid) { otherPlayers[playerId] = olderPlayersData[playerId]; }
    }
    return;
  });
  socket.on('playerConnected', function(playerData) {                           // pull each new player
    otherPlayers[playerData.guid] = playerData;
    return;
  });
  socket.on('playerDisconnected', function(playerIdToDiscard) {                 // delete DC'd player
    delete otherPlayers[playerIdToDiscard];
    return;
  });
  socket.on('otherPlayerMoved', function(moveData) {                            // handle movements
      let target = otherPlayers[moveData.guid];
      let x_ = moveData.x;
      let y_ = moveData.y;
      target.x = x_;
      target.y = y_;
      return;
  });
  socket.on('otherPlayerFired', function(data) {                                // handle shooting from others
    let bul = data[0]; let gun = data[1];
    let remoteBullet = new Bullet({x: bul.x, y: bul.y}, [0,0], gun);
        remoteBullet.heading = bul.heading;
        remoteBullet.init();
    bullets.push(remoteBullet);
    return;
  });

  socket.on('otherPlayerGotHit', hitData => {
    otherPlayers[hitData.guid].hp -= hitData.damage;
  });

  socket.on('otherPlayerDied', deathData => {

  });

  console.log(COLOR);
}

var initialFrameCount = 0;

/* ------------------------ GAME UPDATE ------------------------ */
function draw(){
  background(BACKGCOLOR);
    
  plr.update(socket);

  // DRAW OTHER PLAYERS
  for(let playerId of Object.keys(otherPlayers)){
    let target = otherPlayers[playerId];
    fill(target.clr)
    ellipse(target.x, target.y, 30, 30);
    drawRemoteStats(target);
    fill(COLOR);
    if(playerId == 0) delete otherPlayers[playerId];    // ensure no empty or faulty plrs
  }

  // DRAW PROJECTILES
  for(let bullet of bullets){
    bullet.update(bullet, bullets, height, width);
  }
  
  // PROCESS COLLISIONS
  // @TODO change collision detection to a quad tree or sth
  // let collisionCounter = 0;
  for(let bullet of bullets){
    // collisionCounter++;
    let shouldEmitHitInfo = plr.collisions(bullet);
    if(shouldEmitHitInfo){
      hitData = {
        guid: plr.guid,
        damage: bullet.dmg
      }
      socket.emit('playerGetsHitEvent', hitData);
    }
    // O(n^2) - fix! TODO
    for(let playerId of Object.keys(otherPlayers)){
      let px = otherPlayers[playerId].x; 
      let py = otherPlayers[playerId].y; 
      let dimensions = otherPlayers[playerId].dimensions;
      if((bullet.x >= px-dimensions/2 && bullet.x <= px+dimensions/2) && (bullet.y >= py-dimensions/2 && bullet.y <= py+dimensions/2 )){
        bullets.splice(bullets.indexOf(bullet), 1);
        delete bullets[bullet];
      }
    }
	}

  // HANDLE SHOOTING LOCAL
  if(mouseIsPressed && mouseButton === LEFT){
    if(frameCount - initialFrameCount > Balancer.fireRateBase/plr.gun.fireRateDivisor ){
      let bul = new Bullet({x: plr.x, y: plr.y}, [mouseX, mouseY], plr.gun);
      bul.init();
      bullets.push(bul);
      initialFrameCount = frameCount;
      // newBulletData = [{x: plr.x, y: plr.y}, [mouseX, mouseY], plr.gun];
      // socket.emit('playerFireEvent', newBulletData);
      socket.emit('playerFireEvent', [bul, plr.gun]);
		}
  }
  
  drawDebugInfo();
}


var drawRemoteStats = function(obj){
  fill('orange');
  noStroke();
  rect(obj.x - 25, obj.y + 20, 0.5 * obj.hp, 4);
  stroke(1);
}



/* ------------------------ SUBROUTINES ------------------------ */
// function mousePressed() {
//   socket.emit('playerFireStart', ()=>{});
// }

// *** keyboard key handler, i.e. switching weapons
function keyPressed() {
	if (keyCode === 49) plr.gun = projectileEmitter;
	if (keyCode === 50) plr.gun = laserRifle;
	if (keyCode === 51)	plr.gun = plasmaGun;
	if (keyCode === 52)	plr.gun = railGun;
}

// *** download other players data 
// [DEPR]
function pullAllPlayers(data){
  for(let playerId of Object.keys(data)){
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

function drawDebugInfo(){
  text(
    "BUL.LEN: " + bullets.length, 10, 20);
}

function CollisionObserver(arrOfPlayers, arrOfBullets){
  
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