//Relates to all the aliens enemies and their speed they are at
var AlienFlock = function AlienFlock() {
  this.invulnrable = true;
  this.dx = 10; this.dy = 0; //Storing a position, when aliens reach side of canvas the dy goes up by the speed
  this.hit = 1; this.lastHit = 0;
  this.speed = 10; //The speed the aliens are at

  this.draw = function() {};

  this.die = function() { //If all aliens die function, it loads the new level
    if(Game.board.nextLevel()) { 
      Game.loadBoard(new GameBoard(Game.board.nextLevel())); //Loads the next level
    } else {
      Game.callbacks['win'](); //else function, if no more levels left to load, user has won
    }
  }

  this.step = function(dt) { 
    if(this.hit && this.hit != this.lastHit) {
      this.lastHit = this.hit;
      this.dy = this.speed;
    } else {
      this.dy=0;
    }
    this.dx = this.speed * this.hit;

    var max = {}, cnt = 0;
    this.board.iterate(function() {
      if(this instanceof Alien)  {
        if(!max[this.x] || this.y > max[this.x]) {
          max[this.x] = this.y; 
        }
        cnt++;
      } 
    });

    if(cnt == 0) { this.die(); } 

    this.max_y = max;
    return true;
  };

}



var Alien = function Alien(opts) {
  this.flock = opts['flock'];
  this.frame = 0;
  this.mx = 0;
}

//draws the aliens onto the canvas 
Alien.prototype.draw = function(canvas) {
  Sprites.draw(canvas,this.name,this.x,this.y,this.frame);
}

//the function delivered when the alien is hit and 'dies'
Alien.prototype.die = function() {
  GameAudio.play('die');
  this.flock.speed += 2; //When aliens dies, increase speed by 1 (orginally) now 2
  this.board.remove(this);//remove alien
}
//this randomises the amount the aliens fire back, which increases the more aliens hit and 'die'
Alien.prototype.step = function(dt) {
  this.mx += dt * this.flock.dx;
  this.y += this.flock.dy;
  if(Math.abs(this.mx) > 10) {
    if(this.y == this.flock.max_y[this.x]) {
      this.fireSometimes();
    }
//the amount of frames in an animation is able to be chnaged here, in this case 4
    this.x += this.mx;
    this.mx = 0;
    this.frame = (this.frame+1) % 4;
    if(this.x > Game.width - Sprites.map.alien1.w * 4) this.flock.hit = -1;
    if(this.x < Sprites.map.alien1.w) this.flock.hit = 1;
  }
  return true;
}

//the function for the randomising of amount the aliens fire back
Alien.prototype.fireSometimes = function() {
      if(Math.random()*100 < 10) {
        this.board.addSprite('missile',this.x + this.w/4 - Sprites.map.missile.w/4,
                                      this.y + this.h, 
                                     { dy: 100 });
      }
}

var Player = function Player(opts) { 
  this.reloading = 0;
}

//uses HTML canvas, draws player on canvas
Player.prototype.draw = function(canvas) {
   Sprites.draw(canvas,'player',this.x,this.y);
}

//looks fir audio associated with 'die' function to play
Player.prototype.die = function() {
  GameAudio.play('die');
  Game.callbacks['die']();
}

//var verticalHeight = 0;


//function of the keys and determines the axis it moves at (x or y) and how much each press of a button (-100 or +100)
Player.prototype.step = function(dt) {
  if(Game.keys['left']) { this.x -= 100 * dt; }
  if(Game.keys['right']) { this.x += 100 * dt; }
  if(Game.keys['up']) { this.y -= 100 * dt; } //&& (verticalHeight < 2) { verticalHeight + 1 && // this.y -= 100 * dt; }
  if(Game.keys['down']) { this.y += 100 * dt; }// && (verticalHeight >0) { verticalHeight -1 &&// this.y += 100 * dt; }

    //barrier on  side of game canvas to stop user going off screen
 if(this.x < 0) this.x = 0;
 if(this.y < 0) this.y = 0;
 if(this.h < 0) this.h = 0;
 if(this.x > Game.width-this.w) this.x = Game.width-this.w;
 if(this.y > Game.height-this.h) this.y = Game.width-this.h;
 //if(this.h < Game.height-this.h) this.h = Game.width-this.h;




  this.reloading--;

//Changes the amount of missiles fired after reloading 
    
  if(Game.keys['fire'] && this.reloading <= 0 && this.board.missiles < 10) {
    //plays audio acossaited with action of fire
    GameAudio.play('fire');
    this.board.addSprite('missile',
                          this.x + this.w/2 - Sprites.map.missile.w/2,
                          this.y-this.h,
                          { dy: -100, player: true });
    this.board.missiles++;
      
//changes the speed that the missiles are fired
    this.reloading = 7;
  }
  return true;
}


var Missile = function Missile(opts) {
   this.dy = opts.dy;
   this.player = opts.player;
}
//This is where the canvas draws a missile 
Missile.prototype.draw = function(canvas) {
   Sprites.draw(canvas,'missile',this.x,this.y);
}

Missile.prototype.step = function(dt) {
   this.y += this.dy * dt;

   //This is a function used when a missile colldies with an ememy and then it dies
    var enemy = this.board.collide(this);
   if(enemy) { 
     enemy.die();
     return false;
   }
   return (this.y < 0 || this.y > Game.height) ? false : true;
}

Missile.prototype.die = function() {
  if(this.player) this.board.missiles--;
  if(this.board.missiles < 0) this.board.missiles=0;
   this.board.remove(this);
}
