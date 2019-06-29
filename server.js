

var http = require("http"); //need to http
var fs = require("fs"); //need to read static files
var url = require("url"); //to parse url strings

var mod = require('./switchBool'); //to use switchBool module

var counter = 1000; //to count invocations of function(req,res)

//server maintained location of moving box
var movingBoxLocation = { x: 100, y: 100 }; //will be over-written by clients

var movingBoxLocation2 = {x: 300, y: 100};

var bool = 0;

var JSONOBJ;

var ROOT_DIR = "html"; //dir to serve static files from

var MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  txt: "text/plain"
};

var get_mime = function(filename) {
  var ext, type;
  for (ext in MIME_TYPES) {
    type = MIME_TYPES[ext];
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return type;
    }
  }
  return MIME_TYPES["txt"];
};

http
  .createServer(function(request, response) {
    var urlObj = url.parse(request.url, true, false);
    console.log("\n============================");
    console.log("PATHNAME: " + urlObj.pathname);
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);
    console.log("METHOD: " + request.method);

    var receivedData = "";

    //attached event handlers to collect the message data
    request.on("data", function(chunk) {
      receivedData += chunk;
    });

    //event handler for the end of the message
    request.on("end", function() {
      console.log("REQUEST END: ");
      console.log("received data: ", receivedData);
      console.log("type: ", typeof receivedData);

  //handle GET requests as static file requests
  //The following comment lines of code were to determine which player uses
  //which paddle if box1 is false, then no request for box 1(paddle 1) has been sent
  // If box1 is true then request for box1 has been sent and therefore request must be
  // for box2.
/*
  console.log("URL object:"+ urlObj.pathname);
  if(urlObj.pathname == "/movingBox1" && box1 == false){
    console.log("#######################################################MOVING BOX 1 request has been recieved##################################################");
    box1 = true;
    return;
        response.end(data);
  }else if(box1 == true){
    console.log("#########################################################MOVING BOX 2 request has been recieved##############################################");
    return;
  }
  */

    if (request.method == "POST") {

        var dataObj = JSON.parse(receivedData);
		//bool = 0;
        if (dataObj.x >= 0 && dataObj.y >= 0 && dataObj.string == "B1") {
          //Here a client is providing a new location for the moving box
          //capture location of moving box from client
          movingBoxLocation = JSON.parse(receivedData);
          console.log("received data object: ", movingBoxLocation);
          console.log("type: ", typeof movingBoxLocation);

		  bool = 1;
		}

		if (dataObj.x >= 0 && dataObj.y >= 0 && dataObj.string == "B2") {
          //Here a client is providing a new location for the moving box
          //capture location of moving box from client
          movingBoxLocation2 = JSON.parse(receivedData);
          console.log("received data object: ", movingBoxLocation2);
          console.log("type: ", typeof movingBoxLocation2);

		  bool = -1;
        }

		console.log("bool type is " + bool);
		JSONOBJ = mod.switchBool(bool,movingBoxLocation,movingBoxLocation2);
		//bool = 0;

		  response.writeHead(200, { "Content-Type": MIME_TYPES["json"] });
          response.end(JSON.stringify(JSONOBJ)); //send just the JSON object

    }
      if (request.method == "GET") {
        //handle GET requests as static file requests
        fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data) {
          if (err) {
            //report error to console
            console.log("ERROR: " + JSON.stringify(err));
            //respond with not found 404 to client
            response.writeHead(404);
            response.end(JSON.stringify(err));
            return;
          }
          response.writeHead(200, {
            "Content-Type": get_mime(urlObj.pathname)
          });
          response.end(data);
        });
      }
    });
  })
  .listen(3000);

console.log("Server Running at http://127.0.0.1:3000  CNTL-C to quit");
