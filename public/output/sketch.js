// Open and connect input socket
let socket = io('/output');

// Listen for confirmation of connection
socket.on('connect', function () {
  console.log("Connected");
});

// Keep track of partners
let users = {};
// Keep track of average position
//let pAvgPos;

let players = [];
let vehicle = [];
let trackImg;
let trackColorImg;
let trackPos = [], obstaclePos = [];
let readyToStart = false;
let numberOfPlayers = 0;
let startCountdown = 240;
let isFinished = false;
let colorPool = ["#257CFF", "#82FF90", "#FFAEBA", "#F7CA1E", "#DFDA00", "#FABAFF","#FF3206"];
let carImg = [];
let highest = 0;
let highestindex = 0;

function preload(){
  trackImg = loadImage('imgs/track/track2.jpg');
  trackColorImg = loadImage('imgs/track/track2-color.jpg')
  for(let i = 1; i < 9; i++){
    carImg.push(loadImage('imgs/cart/player'+i+'.png'));
  }
}

function setup() {
  for(idx in carImg){
    carImg[idx].resize(windowWidth*0.03, windowHeight*0.03);
  }
  console.log("carsize: "+carImg[0].width+" "+carImg[1].height);

  vehicle.push(new Vehicle(50, [0, 2, 4], carImg));
  vehicle.push(new Vehicle(0, [1, 3, 5], carImg));
  console.log(vehicle[0].group)

  console.log(vehicle[1].group)

  moving = createVector();
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  
  trackColorImg.resize(width, height);
  trackImg.resize(width, height);
  trackImg.loadPixels();
  for(let i = 0; i < trackImg.pixels.length; i +=4){
      if(trackImg.pixels[i] == 0){
          obstaclePos.push({
            pos: createVector((i/4)%width, floor((i/4)/width)),
            isTrack : true
          });
      }
      if(trackImg.pixels[i] >= 200 && trackImg.pixels[i+1] == 0 && trackImg.pixels[i+2] == 0){
          obstaclePos.push({
            pos: createVector((i/4)%width, floor((i/4)/width)),
            isTrack : false
          });
      }

  }


  

  // Listen for message
  socket.on('message', function (directionMessage) {

    let id = directionMessage.id;

    players = directionMessage.players;
    numberOfPlayers = directionMessage.number;
    // console.log(numberOfPlayers)
    users[id] = {
      team: directionMessage.team,
      bgColor: directionMessage.bgColor,
      direction: directionMessage.direction
    };
  });

  // Remove disconnected users
  socket.on('disconnected', function (id) {
    delete users[id];
    numberOfPlayers--;
  });

  
}

function draw() {
  background(220);
  imageMode(CORNERS);
  image(trackColorImg, 0, 0);
  scoreBoard();
  if(isFinished == false){
    if(numberOfPlayers >= 6){

      if(readyToStart == false){
        push()
        startCountdown--;
        
        textSize(50);
        textAlign(CENTER);
        rectMode(CENTER);
        
        if(startCountdown == -60){
          readyToStart = true;
        }
        else if(startCountdown <= 0){
          fill(255);
          noStroke();
          rect(windowWidth/2, windowHeight/2-30, windowWidth, 80);
          fill(255, 0, 0);
          stroke(1);
          text("GO!", windowWidth/2, windowHeight/2);
        }
        else{
          fill(255);
          noStroke();
          rect(windowWidth/2, windowHeight/2-50-30, windowWidth, 80);
          rect(windowWidth/2, windowHeight/2-30, windowWidth, 80);
          fill(255, 0, 0);
          stroke(1);
          text("The game is about to start", windowWidth/2, windowHeight/2 - 50);
          text(floor(startCountdown/60), windowWidth/2, windowHeight/2);
        }
        pop()
      }
      else{
        let number = 0;
        for(let car of vehicle){
          let decisionMade = decision(number, car);
          car.moving = decisionMade[0];
          car.memberDir = decisionMade[1];
          // console.log(decisionMade)
          car.update(car.moving);
          car.display();
            
          if(car.pos.x + car.size.x >= windowWidth){
            isFinished = true;
            console.log(isFinished);
            break;
          }

          car.checkCollision(obstaclePos);

          if(car.isCollide == true){
            car.vel.mult(0);
            car.moving.mult(0);
            car.count++;
            // print(count);
            if(car.count == 60){
                if(car.collideRelation.x-car.size.x >= -2){
                //vehicle.pos.add(vehicle.collideRelation.mult(3));
                    car.pos.x -= 50;
                }
                else{
                  if(car.collideRelation.y >= 0){
                    car.pos.x -= 30;
                    car.pos.y -= 50;
                  }
                  else{
                    car.pos.x -= 30;
                    car.pos.y += 50;
                  }
                }
                car.resume = true;
                //console.log(vehicle.collideRelation);
                car.count = 0;
            }
          }
          
          if(car.resume == true){
              car.count++;
              if(car.count == 60){
                  //console.log("GOGO")
                  car.vel.add(windowWidth*0.0015, 0);
                  car.count = 0;
                  car.resume = false;
                  //car.changeCaptain();
              }
          }

          car.calculatePoints();

          number++;
          
          // console.log("GROUP " + number + " Members: " + )
          // console.log("GROUP " + number + "  Captain: " + car.isCaptain);
        }
      
      }
    }
    else{
      push()
      
      fill(0);
      textSize(50);
      textAlign(CENTER);
      text("Waiting for enough players: " + numberOfPlayers + "/6", windowWidth/2, 50);
      //text();
      pop()
    }
  }
  else{
    console.log("finished: "+isFinished)
    push()
    fill(0);
    textSize(30);
    textAlign(CENTER);
    rectMode(CENTER);
    fill(255);
    noStroke();
    rect(windowWidth/2, windowHeight/2-50-35, windowWidth, 80);
    rect(windowWidth/2, windowHeight/2-30, windowWidth, 80);
    fill(255, 0, 0);
    stroke(1);
    text("FINISHED!", windowWidth/2, windowHeight/2-100);
    text(`Player ${highestindex+1} Wins!!!!`, windowWidth/2, windowHeight/2-50);
    text("Hit RETURN to restart!", windowWidth/2, windowHeight/2);
    // RESET!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    pop()
  }

  

  // for(idx in carImg){
  //   //console.log(carImg[idx].height)
  //   //carImg[idx].resize(carImg[idx].width/10, carImg[idx].height/10);
  //   image(carImg[idx], 50+idx*100, 50);
  // }
}

function decision(number, car){
  let direction = 0;
  let movingVec = createVector();
  let dirMapped = 0;
  let memberDir = [];

  if(typeof(users) != undefined){
    for(let u in users){
      if(users[u].team == number){
        dirMapped = map(users[u].direction,-90, 90, -windowHeight*0.003,windowHeight*0.003);
        console.log(dirMapped);
        memberDir[players.indexOf(u)] = dirMapped;
        if(int(car.isCaptain) == int(players.indexOf(u)))
          direction += dirMapped * 0.55;
        else
          direction += dirMapped * 0.225;
      }
    }
    // console.log(dirMapped)
    if(car.isCollide == false && car.resume == false){

      movingVec.y = dirMapped;
    }
  }

  // console.log(memberDir);
  // let returnValue = [movingVec, memberDir];
  // console.log(returnValue);
  return [movingVec, memberDir];
}

function scoreBoard(){
  push()
  fill(colorPool[0]);
  rect(windowWidth*0.60+20, windowHeight*0.80 - 5, 90, 30);
  fill(colorPool[2]);
  rect(windowWidth*0.60+20, windowHeight*0.85 - 5, 90, 30);
  fill(colorPool[4]);
  rect(windowWidth*0.60+20, windowHeight*0.90 - 5, 90, 30);
  fill(colorPool[1]);
  rect(windowWidth*0.80+20, windowHeight*0.80 - 5, 90, 30);
  fill(colorPool[3]);
  rect(windowWidth*0.80+20, windowHeight*0.85 - 5, 90, 30);
  fill(colorPool[5]);
  rect(windowWidth*0.80+20, windowHeight*0.90 - 5, 90, 30);



  textAlign(LEFT, TOP);
  textSize(30);
  fill(0);
  text(`Group1  Captain: ${int(vehicle[0].isCaptain) + 1}`, windowWidth*0.60, windowHeight*0.75-20);
  text(`Group2  Captain: ${int(vehicle[1].isCaptain) + 1}`, windowWidth*0.80, windowHeight*0.75-20);
  textSize(20);
  fill(0);
  stroke(0)
  text("Player1", windowWidth*0.60+30, windowHeight*0.80);
  text("Player3", windowWidth*0.60+30, windowHeight*0.85);
  text("Player5", windowWidth*0.60+30, windowHeight*0.90);
  text("Player2", windowWidth*0.80+30, windowHeight*0.80);
  text("Player4", windowWidth*0.80+30, windowHeight*0.85);
  text("Player6", windowWidth*0.80+30, windowHeight*0.90);
  
  let direction;
  let playerPoints = [];
  for(let u in users){
    direction = map(users[u].direction, -90, 90, -50, 50);
    if(users[u].team == 0){
      let heightMult = 0.8+ 0.05*(players.indexOf(u)/2);
      fill(colorPool[players.indexOf(u)]);
      rect(windowWidth*0.75+5, windowHeight*heightMult + 5, direction, 10);

      fill(0)
      textSize(20);
      text(vehicle[0].points[players.indexOf(u)], windowWidth*0.70, windowHeight*heightMult);
      playerPoints[players.indexOf(u)] = vehicle[0].points[players.indexOf(u)];
    }
    else{
      let heightMult = 0.8+ 0.05*(floor(players.indexOf(u)/2));
      rect(windowWidth*0.95+5, windowHeight*heightMult + 5, direction, 10)

      fill(0)
      textSize(20);
      text(vehicle[1].points[players.indexOf(u)], windowWidth*0.90, windowHeight*heightMult);
      playerPoints[players.indexOf(u)] = vehicle[1].points[players.indexOf(u)];
    }

  }
  
  pop()
  


    // console.log(playerPoints);
    highest = Math.max(...playerPoints);
    // console.log(highest);
    highestindex = playerPoints.indexOf(highest);
    // console.log(highestindex);
}

function keyPressed(){
  if(isFinished == true){
    if(keyCode == RETURN){
      isFinished = false;
      vehicle[0] = new Vehicle(50, [0, 2, 4], carImg);
      vehicle[1] = new Vehicle(0, [1, 3, 5], carImg);

    }
  }
}