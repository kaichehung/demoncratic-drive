// Open and connect input socket
let socket = io('/input');
let players = 0;
let id = null;
let bgColor = 'black';
// Listen for confirmation of connection
socket.on('connection', function () {
  console.log("Connected");
});

// Keep track of partners
let users = {};
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Listen for message from partners
  socket.on('message', function (message) {
    id = message.id;

    players = message.players;

    //console.log(players);
    bgColor = message.bgColor;

    users[id] = {bgColor : bgColor, players: players};
    // console.log(players)
    // console.log(id)
  });

  // Remove disconnected users
  socket.on('disconnected', function (id) {
    delete users[id];
  });
}

function draw() {
  for(let u in users){
    console.log("NOW: " + u);
    console.log("should be: " +socket.id)
    if(u == "/input#" +socket.id){
      background(users[u].bgColor);
      push()
      translate(width/2, height/2)
      rotate(PI/2)
      textAlign(CENTER);
      textSize("40")
      fill(0);
      text("PLAYER " + (users[u].players.indexOf(u)+1), 0,0)
      pop()
    }
    //else fill('white');
    //ellipse(players.indexOf(id)*50, 10, 10);
  }

  // Send proportional, normalized mouse data
  let direction = floor(rotationX);
  // direction = constrain (direction, 0, 180);
  // //console.log(direction);
  // direction = map(direction, 0, 180, -90, 90);
  direction = constrain (direction, -90, 90);
  socket.emit('data', {
    direction : direction
  });
}