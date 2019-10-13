// Create server
let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function () {
  console.log('Server listening at port: ', port);
});

let players = new Array(6);
players.fill(0, 0, 6);
let colors = ["#257CFF", "#82FF90", "#FFAEBA", "#F7CA1E", "#DFDA00", "#FABAFF","#FF3206"];
// Tell server where to look for files
app.use(express.static('public'));

// Create socket connection
let io = require('socket.io').listen(server);

// Clients in the output namespace
var outputs = io.of('/output');
// Listen for output clients to connect
outputs.on('connection', function (socket) {
  console.log('An output client connected: ' + socket.id);

  // Listen for this output client to disconnect
  socket.on('disconnect', function () {
    console.log("An output client has disconnected " + socket.id);
  });
});

// Clients in the input namespace
let inputs = io.of('/input');
// Listen for input clients to connect
inputs.on('connection', function (socket) {
  console.log('An input client connected: ' + socket.id);
  let join = false;
  for(let i in players){
    if(players[i] == 0){
      players[i] = socket.id;
      join = true;
      console.log(players[i] + " is player" + i);
      break;
    }
  }

  if(join == false){
    console.log("No empty space");
  }
  // Listen for data messages
  socket.on('data', function (data) {
    // Data comes in as whatever was sent, including objects
    //console.log("Received: 'message' " + data);

    // Wrap up data in message
    let message = {
      id : socket.id,
      players: players,
      bgColor : colors[players.indexOf(socket.id)]
    }
    console.log(players)

    let count = 0;
    for(let player of players){
      if(player != 0)
        count++;
    }

    let directionMessage = {
      id: socket.id,
      direction: data.direction,
      players: players,
      team: players.indexOf(socket.id)%2 == 0  ? 0:1,  
      bgColor : colors[players.indexOf(socket.id)],
      number: count
    }
    console.log(directionMessage.direction);
    // Send data to all clients
    inputs.emit('message', message);
    outputs.emit('message', directionMessage);
  });

  // Listen for this input client to disconnect
  // Tell all clients, this input client disconnected
  socket.on('disconnect', function () {
    console.log("Client has disconnected " + socket.id);
    inputs.emit('disconnected', socket.id);
    outputs.emit('disconnected', socket.id);
    players[players.indexOf(socket.id)] = 0;
  });
});