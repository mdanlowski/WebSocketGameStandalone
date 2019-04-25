
function Bullet(origin_, heading_, weapon_){
	this.birthFrameCount = frameCount;
	this.x = origin_.x;
	this.y = origin_.y;
	this.heading = {
		// Some scaling maths deriver by trial and error
		x : 0.01*(heading_[0] - this.x),
		y : 0.01*(heading_[1] - this.y)
	}
	this.vel = weapon_.projectileSpeed;
	this.dmg = weapon_.damage;

	this.update = function(instance, collection, viewHeit, viewWith){
		// Calculate positions and redraw each object
		this.calcPos();
		this.redraw();
		this.edges(instance, collection, viewHeit, viewWith);
	}

	this.calcPos = function() {
		// let headingMag = Math.sqrt(this.heading.x, this.heading.y);
		this.x += (1/headingMag(this.heading)) * this.vel * this.heading.x;
		this.y += (1/headingMag(this.heading)) * this.vel * this.heading.y;

	}

	this.edges = function( _self_, projctlArr, worldH, worldW ){
		if (this.x < 0 || this.x > worldW || this.y < 0 || this.y > worldH){
			let removeIndex = projctlArr.indexOf(_self_);
			projctlArr.splice(removeIndex, 1);
		}
	}

	this.redraw = function(){ 
		// [TODO] Export drawing charasteristics to an SFC?
		switch(weapon_.projectileType){
			case "bullet":
				noStroke();
				fill(weapon_.projectileColor);
				ellipse(this.x, this.y, 6, 6);
				break;

			case "laser":
				strokeWeight(3);
				stroke(weapon_.projectileColor);
				// let laserLineX = this.x + (1/headingMag(this.heading.x, this.heading.y))*150*this.heading.x;
				let laserLineX = this.x + (1/headingMag(this.heading)) * 150 * this.heading.x;
				let laserLineY = this.y + (1/headingMag(this.heading)) * 150 * this.heading.y;
				line(this.x, this.y, laserLineX, laserLineY );
				strokeWeight(1);        
				break;

			case "plasma":
				noStroke();
				fill(weapon_.projectileColor);
				ellipse(
					this.x + random(-weapon_.accuracy/2, weapon_.accuracy/2),
					this.y + random(-weapon_.accuracy/2, weapon_.accuracy/2),
					random(1,5),
					random(1,5));
				break;

			case "ray":
				strokeWeight(3);
				stroke(weapon_.projectileColor);
				line(this.x, this.y, origin_.x, origin_.y);
				strokeWeight(1);        
				break;

			default:
				break;

			// case "grenade":
			// 	strokeWeight(3);
			// 	stroke("black");
			// 	fill("brown");
			// 	ellipse(this.x, this.y, 10, 10);
			// 		// grenade explosion
			// 		if (frameCount - this.birthFrameCount > 50) {
			// 			// animations is global for main game loop
			// 			animations.drawAnimAt(this.x, this.y, "explosion", frameCount);
			// 			// kill the bullet
			// 			this.x = -100; this.y = -100;
						
			// 		}
			// 	break;
		}
	}
}

// Helper maths
// [TODO] DESCRIBE THE STRUGGLE
// var headingMag = (hx, hy) => Math.sqrt(hx**2 + hy**2);
function headingMag(projectileHeading){ 
	return Math.sqrt( projectileHeading.x**2 + projectileHeading.y**2 ); // UNDEF?!?!?
};