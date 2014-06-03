//Each number corresponds with a keyboard code to a certain key, 37 is left key, 39 is the right key and 32 is space bar. These are all the same codes for all internet browsers so will work across all platforms
var Game = new function() {                                                                  
  var KEY_CODES = { 37:'left', 38:'up', 39:'right', 40:'down', 32 :'fire' };
  this.keys = {};
    
    // This loads the specifications and attributes of the canvas size of the game specified in the HTML file, and specifies its a 2d game
 this.initialize = function(canvas_dom,level_data,sprite_data,callbacks) {
    this.canvas_elem = $(canvas_dom)[0];
    this.canvas = this.canvas_elem.getContext('2d');
    this.width = $(this.canvas_elem).attr('width');
    this.height= $(this.canvas_elem).attr('height');
     
     //if statement, for if the correct above key codes are pressed
     //if this is true (the keys are pressed correctly relating to the KEY_CODES) then the users sprite will move in relation to the KEY_CODES pressed 
     $(window).keydown(function(event) {
      if(KEY_CODES[event.keyCode]) Game.keys[KEY_CODES[event.keyCode]] = true;
    });
     
     // this is an if statement if the wrong KEY_CODES are pressed, this means nothing will happen

    $(window).keyup(function(event) {
      if(KEY_CODES[event.keyCode]) Game.keys[KEY_CODES[event.keyCode]] = false;
    });

     //load sprite data for when 'start' is pressed to activate game
    this.level_data = level_data;
    this.callbacks = callbacks;
    Sprites.load(sprite_data,this.callbacks['start']);
  };

//load game board    
  this.loadBoard = function(board) { Game.board = board; };

    //changes the time between next sprite and step , 30 is the optimised speed for the game and best working without any lagging
  this.loop = function() { 
    Game.board.step(30/1000); 
    Game.board.render(Game.canvas);
    setTimeout(Game.loop,30);
  };
};

var Sprites = new function() {
  this.map = { }; 

    //links to the location of the sprite image document
  this.load = function(sprite_data,callback) { 
    this.map = sprite_data;
    this.image = new Image();
    this.image.onload = callback;
    this.image.src = 'images/sprites.png';
  };
    

    //this is where the canvas is used 
  this.draw = function(canvas,sprite,x,y,frame) {
    var s = this.map[sprite];
    if(!frame) frame = 0;
      //s represents the source image and this is drawing on the HTML canvas
    canvas.drawImage(this.image, s.sx + frame * s.w, s.sy, s.w, s.h, x,y, s.w, s.h);
  };
}

//displays the text and text 2 (Title and sub title on first screen) and activates the games when fire is hit (space)
var GameScreen = function GameScreen(text,text2,callback) {
  this.step = function(dt) {
    if(Game.keys['fire'] && callback) callback();
  };
// The canvas elements on the game - this is about the text displayed on the opening screen
  this.render = function(canvas) {
    canvas.clearRect(0,0,Game.width,Game.height);
    canvas.font = "bold 45px Pokemon Hollow "; //Font of the first heading "Alien Invaders"
    var measure = canvas.measureText(text);  
    canvas.fillStyle = "#e8d91a"; //Changes the font colour
    canvas.fillText(text,Game.width/2.5 - measure.width/2.5,Game.height/2.5); //number = position of text on screen
    canvas.font = "bold 10px Pokemon GB"; //Font of the sub heading "Press start to play"
    canvas.fillStyle = "#000000"; //Changes the font colour
    var measure2 = canvas.measureText(text2);
    canvas.fillText(text2,Game.width/2 - measure2.width/2,Game.height/2 + 100);
      //+40 makes the next text 40 units below the other text
  };
};

var GameBoard = function GameBoard(level_number) {
  this.removed_objs = [];
  this.missiles = 0;
  this.level = level_number;
  var board = this;

//function that removes and add objects
  this.add =    function(obj) { obj.board=this; this.objects.push(obj); return obj; };
  this.remove = function(obj) { this.removed_objs.push(obj); };

//adds sprites in positions
  this.addSprite = function(name,x,y,opts) {
    var sprite = this.add(new Sprites.map[name].cls(opts));
    sprite.name = name;
    sprite.x = x; sprite.y = y;
    sprite.w = Sprites.map[name].w; 
    sprite.h = Sprites.map[name].h;
    return sprite;
  };
  

  this.iterate = function(func) {
     for(var i=0,len=this.objects.length;i<len;i++) {
       func.call(this.objects[i]);
     }
  };

  this.detect = function(func) {
    for(var i = 0,val=null, len=this.objects.length; i < len; i++) {
      if(func.call(this.objects[i])) return this.objects[i];
    }
    return false;
  };

    //remove object function
  this.step = function(dt) { 
    this.removed_objs = [];
    this.iterate(function() { 
        if(!this.step(dt)) this.die();
    }); 

    for(var i=0,len=this.removed_objs.length;i<len;i++) {
      var idx = this.objects.indexOf(this.removed_objs[i]);
      if(idx != -1) this.objects.splice(idx,1);
    }
  };

    // renders a canvas as a clear rectangle on the game board
  this.render = function(canvas) {
    canvas.clearRect(0,0,Game.width,Game.height);
    this.iterate(function() { this.draw(canvas); });
  };

    
  this.collision = function(o1,o2) {
    return !((o1.y+o1.h-1<o2.y) || (o1.y>o2.y+o2.h-1) ||
             (o1.x+o1.w-1<o2.x) || (o1.x>o2.x+o2.w-1));
  };

  this.collide = function(obj) {
    return this.detect(function() {
      if(obj != this && !this.invulnrable)
       return board.collision(obj,this) ? this : false;
    });
  };

  this.loadLevel = function(level) {
    this.objects = [];
    this.player = this.addSprite('player', // Sprite
                                 Game.width/2, // X
                                 Game.height - Sprites.map['player'].h - 10); // Y

      //left and right barrier in game to stop user going off game map
    var flock = this.add(new AlienFlock());
    for(var y=0,rows=level.length;y<rows;y++) {
      for(var x=0,cols=level[y].length;x<cols;x++) {
        var alien = Sprites.map['alien' + level[y][x]];
        if(alien) { 
          this.addSprite('alien' + level[y][x], // Which Sprite
                         (alien.w+10)*x,  // X
                         alien.h*y,       // Y
                         { flock: flock }); // Options
        }
      }
    }
  };
    //next level function that returns the game level and goes onto +1 level
  this.nextLevel = function() { 
    return Game.level_data[level_number + 1] ? (level_number + 1) : false 
  };
 //loads the level data according to the level number in level.js
  this.loadLevel(Game.level_data[level_number]);
};

//loads audio sounds or the game
var GameAudio = new function() {
  this.load_queue = [];
  this.loading_sounds = 0;
  this.sounds = {};

  var channel_max = 10;		
  audio_channels = new Array();
  for (a=0;a<channel_max;a++) {	
    audio_channels[a] = new Array();
    audio_channels[a]['channel'] = new Audio(); 
    audio_channels[a]['finished'] = -1;	
  }

  this.load = function(files,callback) {
    var audioCallback = function() { GameAudio.finished(callback); }

    for(name in files) {
      var filename = files[name];
      this.loading_sounds++;
      var snd = new Audio();
      this.sounds[name] = snd;
      snd.addEventListener('canplaythrough',audioCallback,false);
      snd.src = filename;
      snd.load();
    }
  };

  this.finished = function(callback) {
    this.loading_sounds--;
    if(this.loading_sounds == 0) {
      callback();
    }
  };

  this.play = function(s) {
    for (a=0;a<audio_channels.length;a++) {
      thistime = new Date();
      if (audio_channels[a]['finished'] < thistime.getTime()) {	
        audio_channels[a]['finished'] = thistime.getTime() + this.sounds[s].duration*1000;
        audio_channels[a]['channel'].src = this.sounds[s].src;
        audio_channels[a]['channel'].load();
        audio_channels[a]['channel'].play();
        break;
      }
    }
  };
};

