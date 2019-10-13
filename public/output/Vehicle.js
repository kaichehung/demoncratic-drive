class Vehicle{
    constructor(x, members, carImg){
        this.pos = createVector(0, 200 - x);
        this.vel = createVector(windowWidth*0.0015, 0);
        //acc = createVector();
        this.carImg = carImg;
        this.size = createVector(carImg[0].width/2, carImg[0].height/2);
        this.isCaptain = random(members);
        this.isCollide = false;

        let carColorPool = ["#257CFF", "#FABAFF", "#82FF90", "#F7CA1E", "#FFAEBA", "#DFDA00","#FF3206"];
        this.color = this.isCaptain;
        this.collideRelation = createVector();
        //this.users = [0, 0, 0];
        this.points = [];
        for(let i of members){
            this.points[i] = 0;
        }
        this.checkpoint = windowWidth/10;
        this.minusFlag = false;
        this.resume = false;
        this.count = 0;
        this.moving = createVector();
        this.memberDir = [];

        this.group = x==50?1:2;
    }

    display(){
        imageMode(CENTER);
        // fill(this.color);
        this.pos.x = constrain(this.pos.x, 0, width);
        this.pos.y = constrain(this.pos.y, 0, height);
        // ellipse(this.pos.x, this.pos.y, 20, 20);
        // console.log(this.group)
        // console.log("color " + this.color);
        //console.log(this.color)
        image(this.carImg[this.color], this.pos.x, this.pos.y);
    }

    update(key){
        this.pos.add(key);
        this.pos.add(this.vel);
        // this.vel.mult(0);
        // this.vel.add(2, 0);
        
    }

    checkCollision(track){
        let isTrack = true;
        for(let obs of track){
            
            if(obs.pos.x >= this.pos.x-this.size.x && obs.pos.x <= this.pos.x+this.size.x &&
                obs.pos.y >= this.pos.y-this.size.y && obs.pos.y <= this.pos.y+this.size.y){
                this.isCollide = true;
                this.collideRelation = p5.Vector.sub(obs.pos, this.pos);
                isTrack = obs.isTrack;
                
                break;
            }
            else{
                this.isCollide = false;
            }
            
            
            // if(p5.Vector.sub(obs.pos, this.pos).mag() <= 13){
            //     this.isCollide = true;
            //     this.collideRelation = p5.Vector.sub(this.pos, obs.pos);
            //     isTrack = obs.isTrack;
               
            //     break;
            // }
            // else if(p5.Vector.sub(obs.pos, this.pos).mag() >= 13){
            //     this.isCollide = false;
            // }
        }
        
        if(this.isCollide == true){
            if(this.group == 1)
                this.color = 6;
            else
                this.color = 7;

            if(this.minusFlag == false){  
                if(isTrack == true){ 
                    for(let i in this.points){  
                        if(i == int(this.isCaptain)){
                            this.points[i] -= 3;
                        }
                        else{
                            this.points[i] -= 1;
                        }
                        
                    }
                    this.changeCaptain();
                }
                else{
                    for(let i in this.points){  
                        if(i == int(this.isCaptain)){
                            this.points[i] -= 5;
                        }
                        else{
                            this.points[i] -= 3;
                        }
                        
                    }
                }

                this.minusFlag = true;
            }
            
        }
        else{
            this.color = int(this.isCaptain);
            this.minusFlag = false;
        }
    }

    calculatePoints(){
        //console.log(this.pos.x, this.checkpoint);
        if(this.pos.x >= this.checkpoint){
            //console.log("LOLOLOLOLOLOLOLOLOL")
            this.checkpoint += windowWidth/10;
            for(let i in this.points){
                if(i == int(this.isCaptain)){
                    this.points[i] += 5;
                    //console.log("points: " + this.users[i])
                }
                else{
                    this.points[i] += 3;
                }
            }
        }
    }


    changeCaptain(){
        // let meanDir = this.memberDir.reduce((a, b)=>{a+b}, 0) / 3;
        let meanDir = 0;
        for(let dir of this.memberDir){
            if(typeof(dir) != "undefined"){
                meanDir += dir;
            }
        }
        meanDir /= 3;
        
        if(this.group == 1)
            console.log(meanDir);

        let variation = this.memberDir.map((x) => {return abs(x - meanDir)});

        let minimum = Infinity;
        let minMember;
        if(this.group == 0)
            minMember = 6;
        else
            minMember = 7;
        // console.log(variation);
        for(let member in variation){
            // console.log("value "+variation[member])
            if(typeof(variation[member]) != "undefined"){
                console.log("PLAYER: "+ member+"value "+variation[member])
                if(variation[member] < minimum){
                    minimum = variation[member];
                    minMember = member;
                }
            }
        }

        //  console.log(minMember);
        this.isCaptain = minMember;



    }
}