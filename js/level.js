//This defines what aliens are drawn and where abouts they are drawn on the board, 1 and 2 specifies the game level

//Number in the leveldata matches the number alien

  var levelData = { 
     1:  [[0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,5,5,5,5,0,0,0],
          [0,0,0,0,6,6,6,6,0,0,0],
          [0,0,0,0,4,4,4,4,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0]],
     2:  [[0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,4,4,0,0,0,0],
          [0,0,0,0,6,6,6,6,0,0,0],
          [0,0,0,0,0,5,5,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0]],
     3:  [[0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0],
          [0,0,2,2,2,2,2,2,2,2,0],
          [0,0,2,2,2,2,2,2,2,2,0],
          [0,0,1,1,1,1,1,1,1,1,0],
          [0,0,1,1,1,1,1,1,1,1,0],
          [0,0,1,1,1,1,1,1,1,1,0],
          [0,0,1,1,1,1,1,1,1,1,0]] };

// This is data defined from the sprite.PNG about individual sprites - attribute: value 
//The sx holds the data of the horiziontal position on the photoshop document
//the sy is the y position (vertical)
//w holds the data of the width of the image size and h is the height of the sprite. 
//cls is the class of the alien in html so it can be identified and the frames is how many animation stages the sprite has until back to the beginning again.

  var spriteData = {
    'alien1': { sx: 0,  sy: 0,  w: 23, h: 18, cls: Alien, frames: 4 },
    'alien2': { sx: 0,  sy: 18, w: 23, h: 18, cls: Alien, frames: 4 },
    'alien3': { sx:0, sy: 100, w: 24, h: 30, cls: Alien, frames: 4 },
    'alien4': { sx:0, sy: 119, w: 35, h: 41, cls: Alien, frames: 4 },
    'alien5': { sx:0, sy: 160, w: 35, h: 41, cls: Alien, frames: 4 },
    'alien6': { sx:0, sy: 201, w: 35, h: 41, cls: Alien, frames: 4 },
    'player': { sx: 0,  sy: 36, w: 26, h: 17, cls: Player },
    'missile': { sx: 0,  sy: 242, w: 17,  h: 12, cls: Missile, frames: 4 },
   
  
   
      
  }
  
  //this function loads a new start game, and prompts the user to use the action of the spacebar to open the game board of level 1

  function startGame() {
      //The text on the loading opening screen
    var screen = new GameScreen("Catch the Pokemon!","Press Space to start and catch them all!", 
                                 function() {
                                     Game.loadBoard(new GameBoard(1));
                                 });
    Game.loadBoard(screen);
    Game.loop();
  }

// This function ends the game, display some header and subheader for the user and if they user presses space, then Gameboard 1 loads again

  function endGame() {
    var screen = new GameScreen("Game Over","(press space to restart)",
                                 function() {
                                     Game.loadBoard(new GameBoard(1));
                                 });
    Game.loadBoard(screen);
  }

// This function loads when the user has got through a certain amount of levels to win, and displays the header and subheading text. Pressing the space loads new gameboard 1

  function winGame() {
    var screen = new GameScreen("You Win!","(press space to restart)",
                                 function() {
                                     Game.loadBoard(new GameBoard(1));
                                 });
    Game.loadBoard(screen);
  }

//Imports the sound files to specific actions within the game
  $(function() {
    GameAudio.load({ 'fire' : 'media/Woosh-Mark_DiAngelo-4778593.ogg', 'die' : 'media/Pokémon Anime - Pokéball Sound Effects 6- Pokémon caught.ogg' }, 
                   function() { 
                       Game.initialize("#gameboard", levelData, spriteData,
                                      { "start": startGame,
                                        "die"  : endGame,
                                        "win"  : winGame });
                   });
   });



