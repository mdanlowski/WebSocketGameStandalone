function Player(guid_, initX, initY, hp_, ammo_, color_, gun_){
  this.guid = guid_;
  this.x = initX;
	this.y = initY;
	this.hp = hp_;
	this.ammo = ammo_;
	this.clr = color_;
  this.gun = gun_;
  this.dimensions = 30;

  this.initialize = function(){ return };

  this.update = function(socket){
    self = this;
    self.calcPos();

	  fill(self.clr);
	  stroke(0);
    ellipse(self.x, self.y, this.dimensions, this.dimensions);

    self.drawStats();
  }
  
	this.drawStats = function(){
    fill('red');
    noStroke();
    rect(this.x - 25, this.y + 20, 0.5 * this.hp, 4);
    stroke(1);
  }
    
  this.calcPos = function(fc){
    // function is called every frame
    // check if player moved at all to save socket bandwidth
    let beforeMove = {oldx: this.x, oldy: this.y};
    if (keyIsDown(65)) {
      this.x -= 2;
    }
    if (keyIsDown(68)) {
      this.x += 2;
    }
    if (keyIsDown(87)) {
      this.y -= 2;
    }
    if (keyIsDown(83)) {
      this.y += 2;
    }
    // prepare and send MOVE SOCKET EVENT
    if(beforeMove.oldx != this.x || beforeMove.oldy != this.y){
      let data = {guid: this.guid, x: this.x, y: this.y}
      socket.emit('playerMoveEvent', data);
    }
  }
  
  this.collisions = function(hitObj, dimensions = this.dimensions){
    // @TODO move hardcoded plr dimensions to a var
    if((hitObj.x >= this.x-dimensions/2 && hitObj.x <= this.x+dimensions/2) && (hitObj.y >= this.y-dimensions/2 && hitObj.y <= this.y+dimensions/2 )){
      hitObj.x = -100;
      hitObj.y = -100; //put the bullet outside the screen to be destroyed
      this.hp -= hitObj.dmg;
      if(this.hp <= 0) {
        socket.emit('playerDieEvent', {guid: this.guid})
        return false;
      }
      return true;
    }
    else return false;
    //return false;
  }

}

