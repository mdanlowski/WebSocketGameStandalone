function Player(initX, initY, hp_, ammo_, color_, gun_){
  this.guid = 0;
  this.x = initX;
	this.y = initY;
	this.hp = hp_;
	this.ammo = ammo_;
	this.clr = color_;
	this.gun = gun_;

  this.initialize = function(){ return };

  this.update = function(socket){
    self = this;
    self.calcPos();

	  fill( self.clr  );
	  stroke(0);
    ellipse(self.x, self.y, 30, 30);

    self.drawStats()
  }
  
	this.drawStats = function(){
    fill('red');
    noStroke();
		rect( this.x - 25, this.y + 20, 0.5 * this.hp, 4
      ); stroke(1);
    }
    
    this.calcPos = function(fc){
      // function is called every frame
      // check if player moved at all to save socket bandwidth
      let beforeMove = {ox: this.x, oy: this.y};
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
      // prepare and send socket event
      if(beforeMove.ox != this.x || beforeMove.oy != this.y){
        let data = {id: this.id, x: this.x, y: this.y}
        socket.emit('playerMoveEvent', data);
      }
    }
  
	this.collisions = function( obj ){ return	};
}

