// Create instance of Game
function Game() {
    // Set initial properties
    this.config = {
        gameWidth: 400,
        gameHeight: 600,
        fps: 50
    };

    this.width = 0;
    this.height = 0;
    this.gameBound = {left: 0, top: 0, right: 0, bottom: 0};

    this.stateStack = [];
    this.gameCanvas = null;
    
    this.level = 1;
    this.startAtLevel1 = false;
}

//  Initializes the game with a canvas
Game.prototype.initialize = function (gameCanvas) {
    this.gameCanvas = gameCanvas;

    this.width = gameCanvas.width;
    this.height = gameCanvas.height;

    this.gameBounds = {
        left: gameCanvas.width / 2 - this.config.gameWidth / 2,
        right: gameCanvas.width / 2 + this.config.gameWidth / 2,
        top: gameCanvas.height / 2 - this.config.gameHeight / 2,
        bottom: gameCanvas.height / 2 + this.config.gameHeight / 2
    };
    
    this.currState;
};

//  Returns the current state
Game.prototype.currentState = function () {
    return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
};

// Moves game to state
Game.prototype.moveToState = function (state) {
    if (this.currentState()) {
        if (this.currentState().leave) {
            this.currentState().leave(game);
        }
        this.stateStack.pop();
    }
    if (state.enter) {
        state.enter(game);
    }
    //  Sets current state.
    this.stateStack.push(state);
    
    this.currState = state;
};

//  Start the Game
Game.prototype.start = function () {

    //  Move to StartState
    this.moveToState(new StartState());

    //  Start game loop
    var game = this;
    this.intervalId = setInterval(function () { 
        gameLoop(game); 
    }, 1000 / this.config.fps);
};

// Main loop--running constantly
function gameLoop(game) {
    var currentState = game.currentState();
    if (currentState) {
        
        //  Delta t is the time to update/draw.
        var dt = 1 / game.config.fps;

        //  Get the drawing context.
        var ctx = game.gameCanvas.getContext("2d");

        //  Update if we have an update function. Also draw
        //  if we have a draw function.
        if (currentState.update) {
            currentState.update(game, dt);
        }
        if (currentState.draw) {
            currentState.draw(game, dt, ctx);
        }
    }
}

// The start state
function StartState() {
    this.name = "start";
}

// The game play state
function GamePlay(config, level) {
    this.config = config;
    this.level = level;
    this.score = 0;
    this.timer = 60;
    this.countDown = 61;
    this.bugs = [];
    this.foods = [];
    this.name = "gameplay";
    this.spawnTime = Math.floor((Math.random() * 3) + 1);
    this.spawnTimeCounter = 0;
    this.play = true;
}

// The game over state
function GameOver(score, level) {
    this.name = "gameover";
    this.score = score;
    
    var hScore = parseInt(localStorage.getItem('level1'));
    
    if ((hScore < this.score) && level === 1) {
        localStorage.setItem('level1', this.score);
    }
    
    if (parseInt(localStorage.getItem('level2')) < this.score && level === 2) {
        localStorage.setItem('level2', this.score);
    }

}

StartState.prototype.draw = function (game, dt, ctx) {

    //  Clear background
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font = "30px Helvetica Neue";
    ctx.fillStyle = '#000000';
    ctx.textBaseline = "center";
    ctx.textAlign = "center";
    
    // Title
    ctx.fillText("Tap Tap Bug", game.width / 2, game.height / 2 - 200);
    ctx.font = "16px Helvetica Neue";
    
    //Level
    ctx.font = "15px Helvetica Neue";
    ctx.fillText("Level:", game.width / 2 - 100, game.height / 2 - 100);

    var highScore;
    
    if (document.getElementById('level1').checked) {
        highScore = localStorage.getItem('level1');
    } else {
        highScore = localStorage.getItem('level2');  
    }
    
    //High Score
    ctx.font = "15px Helvetica Neue";
    ctx.fillText("High Score: " + highScore , game.width / 2 - 80, game.height / 2 - 40);


};

GamePlay.prototype.draw = function (game, dt, ctx) {

    //  Clear background
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.fillStyle = "#000000";
    ctx.font = "16px Helvetica Neue";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(this.timer + " seconds", 60, 20);
    
    ctx.fillText("Score: " + this.score, 350, 20);
    
    var x = game.width / 2;
    var y = game.height / 2;
    
    if (this.play) {
        //Pause button
        ctx.fillRect(x, y - 312, 8, 25);
        ctx.fillRect(x + 12, y - 312, 8, 25);
    } else {
        //Play button
        ctx.beginPath();
        ctx.moveTo(x, y - 312);
        ctx.lineTo(x, (y - 312) + 25);
        ctx.lineTo(x + 20, (y - 312) + 12.5);
        ctx.closePath();
        ctx.fill();
    }

    // Game viewport
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.rect(game.width / 2 - 200, game.height / 2 - 320, 400, 640);
    
    ctx.moveTo(game.width / 2 - 200, game.height / 2 - 280);
    ctx.lineTo(game.width / 2 - 200 + 400, game.height / 2 - 280);
    ctx.closePath();
    ctx.stroke();
    
    // Draw food
    for (var i = 0; i < this.foods.length; i++) {
        var food = this.foods[i];
        ctx.beginPath();
        ctx.fillStyle = '#663300';
        ctx.arc(food.x + 10, food.y + 10, food.width / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        ctx.arc(food.x + 10, food.y + 10, food.width / 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#ee4035";
        ctx.fillRect(food.x + 2, food.y + 7, 2, 3);
        ctx.fillStyle = "#f37736";
        ctx.fillRect(food.x + 8, food.y + 2, 3, 2);
        ctx.fillStyle = "#fdf498";
        ctx.fillRect(food.x + 15, food.y + 13, 2, 3);
        ctx.fillStyle = "#7bc043";
        ctx.fillRect(food.x + 10, food.y + 16, 3, 2);
        ctx.fillStyle = "#0392cf";
        ctx.fillRect(food.x + 5, food.y + 14, 2, 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(food.x + 16, food.y + 6, 2, 3);
        ctx.closePath();
    
    }
    
    // Draw bugs
    for (i = 0; i < this.bugs.length; i++) {
        var bug = this.bugs[i];
        if (bug.fade === false) {
            ctx.fillStyle = bug.color;
            ctx.strokeStyle = "rgba(0,0,0,1)";
        } else {
            ctx.fillStyle = "rgba(" + bug.r + "," + bug.g + "," + bug.b + "," + bug.alpha + ")";
            ctx.strokeStyle = "rgba(0,0,0," + bug.alpha+")";
            if (this.play){
                bug.alpha -= 0.02;
                if (bug.alpha <= 0){
                    bug.killBug(i, this);   
                }
            }
        }
        drawBug(ctx, bug);
    }
};

GamePlay.prototype.update = function (game, dt) {
    if (this.play) {
        this.countDown -= dt;

        if (this.countDown < this.timer) {
            this.timer--;
            this.spawnTimeCounter++;
            // Every 1 to 3 seconds, a new bug spawns
            if (this.spawnTimeCounter === this.spawnTime) {
                this.spawnBug(); 
            }
        }

        for (var i = 0; i < (this.bugs).length; i++) {
            var bugDestination = this.bugs[i].findNearestFood(this);
            if (this.bugs[i].fade === false) {
                this.bugs[i].move(bugDestination);
                this.bugs[i].detectCollision(this);
            }
        }

        if (this.timer <= 0 || this.foods.length === 0) {
            // Player won level 1
            if (this.level === 1 && this.foods.length > 0) {
                game.moveToState(new GamePlay(this.config, 2));
                if (parseInt(localStorage.getItem('level1')) < this.score) {
                localStorage.setItem('level1', this.score);
                }
                game.level = 2;
            } else {
                // Player won level 2
                if (this.foods.length > 0) {
                    game.startAtLevel1 = true;
                }
                
                game.moveToState(new GameOver(this.score, this.level));
            }
        }
    }
};

GamePlay.prototype.spawnBug = function () {
    this.bugs.push (new Bug (Math.floor((Math.random() * 380) + 10), 80, this.level));
    this.spawnTime = (Math.floor((Math.random() * 3) + 1));
    this.spawnTimeCounter = 0;
};

GamePlay.prototype.enter = function (game) {
    var foods = [];
    // Create the food
    for (i = 0; i < 5; i++) {
        foods.push (new Food (Math.floor((Math.random() * 380) + 1), Math.floor((Math.random() * 460) + 160)));
    }
    this.foods = foods;
    this.bugs = [];
};

GamePlay.prototype.killBug = function(mousePos) {
    for (var i = 0; i < this.bugs.length; i++) {
        var bug = this.bugs[i];
        if (bug.xActual >= (mousePos.x - 30) && bug.xActual <= (mousePos.x + 30) && bug.yActual >= (mousePos.y - 30) && bug.yActual <= (mousePos.y + 30)) {
                bug.fade = true;
               //bug.killBug(i, this);
        }
    }
};

GameOver.prototype.draw = function (game, dt, ctx) {
    //  Clear background
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.fillStyle = "#000000";
    ctx.font = "50px Helvetica Neue";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", game.width / 2, game.height / 2);
    ctx.font = "16px Helvetica Neue";
    ctx.fillText("Score: " + this.score, game.width / 2, (game.height / 2) + 50);
    
    document.getElementById('resetbutton').style.visibility = "visible";
    document.getElementById('exitbutton').style.visibility = "visible";
};

// Food object used in GamePlay state
function Food(x, y) {
    this.x = x; //left-most of the circle
    this.y = y; //top of the circle
    this.width = 20;
    this.height = 20;
}

// Bug object used in GamePlay state
function Bug(x, y, level) {
    this.x = x; // this is the x and y of the side of its head
    this.y = y;
    
    this.xActual = this.x - 2; // this is the x and y of the corner of the whole bug
    this.yActual = this.y - 8;
    
    this.width = 10;
    this.height = 40;
    this.level = level;
    this.fade = false; // used for fading out
    this.alpha = 1.0;
    
    this.rotation = ((Math.PI/180) * 90);
    this.facingFood = false;
    
    var bugType = Math.random();
    if (bugType < 0.3) {
        this.r = 0;
        this.g = 0;
        this.b = 0; // 0.3 probability
        this.score = 5;
        
        if (this.level === 1) {
            this.speed = 150; // 150px per second
        } else {
            this.speed = 200;
        }
        
    } else if (bugType < 0.6) {
        this.r = 255;
        this.g = 0;
        this.b = 0; // 0.3 probability
        this.score = 3;
        
        if (this.level === 1) {
            this.speed = 75;
        } else {
            this.speed = 100;
        }
        
    } else {
        this.r = 255;
        this.g = 153;
        this.b = 0;  // 0.4 probability
        this.score = 1;
        
        if (this.level === 1) {
            this.speed = 60;
        } else {
            this.speed = 80;
        }
    }
    this.color = "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.alpha + ")";
}

// Removes food at index i from GamePlay.foods[]: called in Bug.detectCollision
Food.prototype.disappear = function(game, i) {
    //Decrease from food array
    game.foods.splice(i, 1);
};

// Moves bug to bugDest: called in GamePlay.update
Bug.prototype.move = function(bugDest) {
    var rotation = Math.atan2(bugDest.y - this.y, bugDest.x - this.x);
    
    this.xActual += (Math.cos(rotation) * this.speed) / 50;
    this.yActual += (Math.sin(rotation) * this.speed) / 50;
    
    this.x += (Math.cos(rotation) * this.speed) / 50;
    this.y += (Math.sin(rotation) * this.speed) / 50; 
    
};

// Finds nearest food to bug; Returns x and y coordinates
Bug.prototype.findNearestFood = function (game) {
    var closestDistance = 1100;
    var xMin = 0;
    var yMin = 0;
    
    for (var i = 0; i < game.foods.length; i++) {
        var food = game.foods[i];
        var foodDistance = Math.abs(this.x - food.x) + Math.abs(this.y - food.y);
        if (foodDistance < closestDistance) {
            closestDistance = foodDistance;
            xMin = food.x;
            yMin = food.y;
        }
    }
    
    var rotation = Math.atan2(yMin - (this.yActual-20), xMin - (this.xActual-5));
    var rotDifference = this.rotation - rotation;
    
    if(Math.abs(rotDifference) > 180){
        rotDifference += rotDifference > 0 ? -360 : 360; 
    }
    
    if (rotDifference < 0) {
        this.rotation += 0.02;
    }
    
    if (rotDifference > 0) {
        this.rotation -= 0.02;
    }
    
    return {x: xMin, y: yMin};
};

// Detects collision with food and other bugs
Bug.prototype.detectCollision = function (game) {
    collision = false;
    for (var i = 0; i < game.foods.length; i++) {
        food = game.foods[i];
        if (((this.xActual + this.width/2) > (food.x)) && (this.xActual - this.width/2 < (food.x + food.width)) && ((this.yActual + this.height/2) > (food.y)) && (this.yActual - this.height/2 < (food.y + food.height))) {
            // If collision then make food disappear
            food.disappear(game, i);
        }
    }
    
    for (var i = 0; i < game.bugs.length; i++) {
        var bug = game.bugs[i];
        
        if (bug != this && !bug.fade && !this.fade) {
        
            if (((this.xActual + this.width/2) > (bug.xActual - bug.width/2)) && ((this.xActual - this.width/2) < (bug.xActual + bug.width/2)) && ((this.yActual + this.height/2) > (bug.yActual - bug.width/2)) && ((this.yActual - this.height/2) < (bug.yActual + bug.height))) {
                if (this.speed > bug.speed) {
                    bug.retainedSpeed = bug.speed;
                    bug.speed = 0;
                    continue;
                } else {
                    this.retainedSpeed = this.speed;
                    this.speed = 0;
                    continue;
                }
            }
            
            if (bug.speed === 0) {
                bug.speed = bug.retainedSpeed;   
            } 
            if (this.speed === 0) {
                this.speed = this.retainedSpeed;   
            }
        }
    }
};

// Removes bug from GamePlay array and updates score
Bug.prototype.killBug = function(index, game) {
    this.alive = false;
    game.score += game.bugs[index].score;
    game.bugs.splice(index, 1);
};

// Event listener function
function getClickPosition (canvas, e) {
    var parentPosition = getPosition(e.currentTarget);
    var xPosition = e.clientX - parentPosition.x;
    var yPosition = e.clientY - parentPosition.y;
    
    return { x: xPosition, y: yPosition };
}

// getClickPosition helper function
function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;
      
    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}

function drawBug(ctx, bug) {
    ctx.save();
    ctx.translate(bug.xActual + 5, bug.yActual + 20);
    //ctx.rotate((Math.PI/180) * 180);
    //if (!bug.facingFood) {
    ctx.rotate((Math.PI/180) * 90);
    ctx.rotate(bug.rotation);
    //}
    ctx.beginPath();
    ctx.moveTo(1, 12);
    
    // head 
    ctx.quadraticCurveTo(4, 6, 7, 12);
    ctx.quadraticCurveTo(4, 14, 1, 12);
    
     //body
    ctx.moveTo(3, 13);
    ctx.quadraticCurveTo(-1, 24, 5, 26);
    ctx.quadraticCurveTo(9, 23, 5, 13);
    
    //venom
    ctx.moveTo(4, 26);
    ctx.quadraticCurveTo(-1, 29, 4, 43);
    ctx.quadraticCurveTo(9, 29, 4, 26);
    
    ctx.moveTo (2, 31);
    ctx.lineTo(6, 31);
    
    ctx.moveTo (2, 35);
    ctx.lineTo(6, 35);
    
    //very hind legs
    ctx.moveTo (1, 24);
    ctx.lineTo(-1, 26);
    ctx.lineTo(-0.5, 39);
    
    ctx.moveTo (7, 24);
    ctx.lineTo(9, 26);
    ctx.lineTo(8.5, 39);
    
    //middle legs
    ctx.moveTo (7.5, 19);
    ctx.lineTo(9.5, 19);
   
    ctx.moveTo (1.5, 19);
    ctx.lineTo(-0.5, 19);
    
    //front legs
    ctx.moveTo (1, 17);
    ctx.lineTo(-1, 15);
    ctx.lineTo(-0.5, 7);
    
    ctx.moveTo (7.5, 17);
    ctx.lineTo(9.5, 15);
    ctx.lineTo(9, 7);
    
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

    
//---------------------------------------------------------------
//---------------------------------------------------------------

var canvas = document.getElementById("gameCanvas");
canvas.width = 400;
canvas.height = 640;

var game = new Game();

canvas.addEventListener("click", function(e) {
    var mousePos = getClickPosition(canvas, e);
    
    //if the current state is in gameplay
    if (game.currentState().name === "gameplay") {
        var gameplay;
        gameplay = game.currentState();

        //They clicked the play or pause button
        if (mousePos.x <= ((game.width / 2) + 20) && mousePos.x >= (game.width / 2) && mousePos.y <= (game.height / 2 - 312 + 25) && mousePos.y >= (game.height / 2 - 312)) {
            gameplay.play = !gameplay.play;
        }
        
        if (gameplay.play) {
            gameplay.killBug(mousePos);
        }
    }
}, false);

game.initialize(canvas);

game.start();

if (localStorage.getItem('level1') === 0) {
    localStorage.setItem('level1', "0");
}

if (localStorage.getItem('level2') === 0) {
    localStorage.setItem('level2', "0");
}

// Start button functionality
document.getElementById('startbutton').onclick = function () {
    
    if (document.getElementById('level1').checked) {
        game.level = 1;   
    } else {
        game.level = 2;   
    }
    
    game.moveToState(new GamePlay(game.config, game.level));
    document.getElementById('startbutton').style.visibility = "hidden";
    document.getElementById('radiobuttons').style.visibility = "hidden";
};

document.getElementById('exitbutton').onclick = function () { 
    game.moveToState(new StartState());
    document.getElementById('resetbutton').style.visibility = "hidden";
    document.getElementById('exitbutton').style.visibility = "hidden";
    document.getElementById('startbutton').style.visibility = "visible";
    document.getElementById('radiobuttons').style.visibility = "visible";
    
};

document.getElementById('resetbutton').onclick = function () {
    if (game.startAtLevel1) {
        game.moveToState(new GamePlay(game.config, 1));
        game.level = 1;
        game.startAtLevel1 = false;
    } else {
        game.moveToState(new GamePlay(game.config, game.level));
    }
    document.getElementById('resetbutton').style.visibility = "hidden";
    document.getElementById('exitbutton').style.visibility = "hidden";
};
