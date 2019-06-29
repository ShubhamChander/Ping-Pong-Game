
var movingString = {
  word: "O",
  x: 100,
  y: 100,
  xDirection: 1, //+1 for leftwards, -1 for rightwards
  yDirection: 1, //+1 for downwards, -1 for upwards
  stringWidth: 50, //will be updated when drawn
  stringHeight: 24
}; //assumed height based on drawing point size

//intended for keyboard control
var movingBox = {
  x: 50,
  y: 50,
  width: 15,
  height: 50
};

var movingBox2 = {
  x: 400,
  y: 50,
  width: 15,
  height: 50
};


var timer; //used to control the free moving word
var pollingTimer; //timer to poll server for location updates

var pollingTimer2;

var wordBeingMoved; //word being dragged by mouse
var wordTargetRect = { x: 0, y: 0, width: 0, height: 0 }; //bounding box around word being targeted

var deltaX, deltaY; //location where mouse is pressed
var canvas = document.getElementById("canvas1"); //our drawing canvas
var fontPointSize = 18; //point size for word text
var wordHeight = 20; //estimated height of a string in the editor
var editorFont = "Arial"; //font for your editor

var p1Score = 0;
var p2Score = 0;

var drawCanvas = function() {
  var context = canvas.getContext("2d");

  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas

  context.font = "" + fontPointSize + "pt " + editorFont;
  context.fillStyle = "cornflowerblue";
  context.strokeStyle = "blue";

  movingString.stringWidth = context.measureText(movingString.word).width;
  context.fillText(movingString.word, movingString.x, movingString.y);

  //draw moving box
  context.fillRect(movingBox.x, movingBox.y, movingBox.width, movingBox.height);
  context.fillStyle = "red";
  context.fillRect(movingBox2.x, movingBox2.y, movingBox2.width, movingBox2.height);
  //draw moving box way points

};

function handleTimer() {
  //handles movement of ball
  movingString.x = movingString.x + 5 * movingString.xDirection;
  movingString.y = movingString.y + 5 * movingString.yDirection;

  //keep moving word within bounds of canvas
  if (movingString.x + movingString.stringWidth > canvas.width){
    p1Score += 1; //increment score based on hitting a boundary
	movingString.xDirection = -1;
  }
  if (movingString.x < 0) {
	  p2Score += 1; //increment score based on hitting a boundary
	  movingString.xDirection = 1;
	  }
  if (movingString.y > canvas.height) movingString.yDirection = -1;
  if (movingString.y - movingString.stringHeight < 0)
    movingString.yDirection = 1;
  //handles the collisions of the ball with Box1
  if(movingString.x == movingBox.x + movingBox.width){
	  if(movingString.y >= movingBox.y && movingString.y <= movingBox.y+movingBox.height){
	  movingString.xDirection = -movingString.xDirection;
	  movingString.yDirection = -movingString.yDirection;
	  console.log("Collision with B1");
	}
  }
  //handles the collisions of the ball with Box2
  if(movingString.x == (movingBox2.x)){
	  if(movingString.y >= movingBox2.y && movingString.y <= movingBox2.y+movingBox2.height){
	  movingString.xDirection = -movingString.xDirection;
	  movingString.yDirection = -movingString.yDirection;
	  console.log("Collision with B2");
	}
  }

  if(p1Score == 5){
	  alert("Blue has won");
  }

  if(p2Score == 5){
	  alert("Red has won");
  }

  drawCanvas();
}


//KEY CODES
var RIGHT_ARROW = 39;
var LEFT_ARROW = 37;
var UP_ARROW = 38;
var DOWN_ARROW = 40;


var W_KEY = 87;
var S_KEY = 83;
var A_KEY = 65;
var D_KEY = 68;

/////////////////////////////////// POLLING TIMER HANDLER BOX 1 ////////////////////////////
function pollingTimerHandler() {
  console.log("poll server FOR BOX 1");
  var dataObj = { x: -1, y: -1 }; //used by server to react as poll
  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);

  //Poll the server for the location of the moving box
  $.post("positionData", jsonString, function(data, status) {
    console.log("data: " + data);
    console.log("typeof: " + typeof data);
    //var locationData = JSON.parse(data);
    var locationData = data;
	if(locationData.string == "B1"){
		movingBox.x = locationData.x;
		movingBox.y = locationData.y;
	}

  });
}

/////////////////////////////////////// POLLING TIMER HANDLER BOX 2 /////////////////
function pollingTimerHandler2() {
  console.log("poll server FOR BOX 2");
  var dataObj2 = { x: -2, y: -2 }; //used by server to react as poll
  //create a JSON string representation of the data object
  var jsonString2 = JSON.stringify(dataObj2);

  //Poll the server for the location of the moving box
  $.post("positionData", jsonString2, function(data, status) {
    console.log("data: " + data);
    console.log("typeof: " + typeof data);
    //var locationData = JSON.parse(data);
    var locationData2 = data;
	if(locationData2.string == "B2"){
    movingBox2.x = locationData2.x;
    movingBox2.y = locationData2.y;
	}

  });
}

////////////////////////////////////////// HANDLE KEY DOWN BOX 1 /////////////////////////////////////
function handleKeyDown(e) {
  if(e.which == 37 || e.which == 38 || e.which == 39 || e.which == 40){
  console.log("keydown code for Box 1= " + e.which);

  var dXY = 5; //amount to move in both X and Y direction
  //var d2XY = 5;

  //The code below handles the movement of Box1 using the arrow keys.
  if (e.which == UP_ARROW && movingBox.y >= dXY) movingBox.y -= dXY; //up arrow


  if (e.which == RIGHT_ARROW && movingBox.x + movingBox.width + dXY <= canvas.width){
    movingBox.x += dXY; //right arrow
  }

  if (e.which == LEFT_ARROW && movingBox.x >= dXY){
    movingBox.x -= dXY;
  }  //left arrow


  if (e.which == DOWN_ARROW && movingBox.y + movingBox.height + dXY <= canvas.height){
    movingBox.y += dXY;
  }

  var dataObj = { x: movingBox.x, y: movingBox.y ,string : "B1" };

  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);

  //update the server with a new location of the moving box
  $.post("positionData", jsonString, function(data, status) {
    //do nothing
  });
}
}


////////////////////////////////////////////// HANDLE KEY DOWN BOX 2 ////////////////////////////
function handleKeyDown2(e) {
if(e.which == 83 || e.which == 87 || e.which == 65 || e.which == 68){
 console.log("keydown code for Box 2= " + e.which);

//amount to move in both X and Y direction
  var d2XY = 5;
  //The code below handles the movement of Box2 using the W/A/S/D keys.
     //down arrow
  if (e.which == W_KEY && movingBox2.y >= d2XY){
	movingBox2.y -= d2XY;

  }  //up arrow
  if (e.which == D_KEY && movingBox2.x + movingBox2.width + d2XY <= canvas.width){
    movingBox2.x += d2XY; //right arrow
  }
  if (e.which == A_KEY && movingBox2.x >= d2XY){
    movingBox2.x -= d2XY;
  } //left arrow
  if (e.which == S_KEY && movingBox2.y + movingBox2.height + d2XY <= canvas.height){
    movingBox2.y += d2XY; //down arrow
  }

  var dataObj2 = { x: movingBox2.x, y: movingBox2.y, string : "B2"};
  var jsonString2 = JSON.stringify(dataObj2);

  $.post("positionData", jsonString2, function(data, status) {
  });
}
}

////////////////////// HANDLE KEY UP BOX 1 ///////////////////////////////////
function handleKeyUp(e) {
	if(e.which == 37 || e.which == 38 || e.which == 39 || e.which == 40){
  console.log("key UP for box 1: " + e.which);
  var dataObj = { x: movingBox.x, y: movingBox.y };
  var jsonString = JSON.stringify(dataObj);
  $.post("positionData", jsonString, function(data, status) {
    console.log("data: " + data);
    console.log("typeof: " + typeof data);
  });
	}
}


////////////////////////// HANDLE KEY UP BOX 2////////////////////
function handleKeyUp2(e) {
	if(e.which == 83 || e.which == 87 || e.which == 65 || e.which == 68){
  console.log("key UP for box 2: " + e.which);
  var dataObj2 = { x: movingBox2.x, y: movingBox2.y };
  var jsonString2 = JSON.stringify(dataObj2);
  $.post("positionData", jsonString2, function(data, status) {
    console.log("data: " + data);
    console.log("typeof: " + typeof data);
  });
}
}

$(document).ready(function() {
   $(document).keydown(handleKeyDown2);
  $(document).keyup(handleKeyUp2);

  $(document).keydown(handleKeyDown);
  $(document).keyup(handleKeyUp);

  timer = setInterval(handleTimer, 100); //tenth of second
  pollingTimer2 = setInterval(pollingTimerHandler2, 100);
  pollingTimer = setInterval(pollingTimerHandler, 100); //quarter of a second

  drawCanvas();
});
