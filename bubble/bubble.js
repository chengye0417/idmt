//


let bubbles=[];
let handsfree;
let showPoints = true;
let cam;
let serial;
let latestData = "waiting for data";
let pinX=0;
let pinY=0;
let updateF=0;
let bubblesPop=[];


function setup() {

    
  createCanvas(windowWidth, windowHeight);
  //noStroke();
  stroke(255);
  //makeBubbles();
  //you can change the maxNumHands if you want more than 1
  handsfree = new Handsfree( {
  showDebug: 
    false, 
    hands: 
    true, 
    maxNumHands: 
    1
  }
  );

  handsfree.start();
  cam = select('.handsfree-video');
  //instantiate our serialport object
  serial = new p5.SerialPort();
  //ket list port available
  serial.list();
  //opnen connection
   serial.open('/dev/tty.usbmodem101');

// connect server 
  serial.on('connected', serverConnected);
  serial.on('list', gotList);
  serial.on('data', gotData);
  serial.on('error', gotError);
  serial.on('open', gotOpen);
  serial.on('close', gotClose);
}
let uT=0;
function draw() {
  background(0, 220, 280);
  updateBubbles();
  drawBubbles();
  drawHand();
  if(updateF==1 && millis()-uT>200){
    stroke(255);
    makeBubbles(3);
    uT=millis();
  }
}
//
function drawHand() {

  //if the hands exist in the video
  if (handsfree.data.hands) {
    if (handsfree.data.hands.multiHandLandmarks) {

      //get the associated data points
      var landmarks = handsfree.data.hands.multiHandLandmarks;
      var nHands = landmarks.length;

      //draw the first hand
      if (nHands > 0) {
        var hand = landmarks[0];
        var rescaledHand = rescaleHand(hand);
        if (showPoints) {
          drawDebugPoints(landmarks);
        }
      }
    }
  }
}

function drawDebugPoints(landmarks) {
  var nHands = landmarks.length;
  fill("orange");
  noStroke();
  for (var h = 0; h < nHands; h++) {
    for (var i = 0; i <= 20; i++) {
      var px = landmarks[h][i].x;
      var py = landmarks[h][i].y;
      
      px = map(px, 0, 1, width, 0);
      py = map(py, 0, 1, 0, height);
      if(i==8){
        pinX=px;
        pinY=py;
      }
      // text(i, px + 5, py);
      circle(px, py, 10);
    }
  }
}


function rescaleHand(hand) {
  //here we change the values of each 
  //of the objects in the array
  //to be from 0 to width or height instead of 0 to 1
  //you can mostly ignore how this works, but know
  //that it remaps the values of the hand points to 
  //fit better within the p5 canvas

  //the Array.map function IS NOT THE SAME AS THE p5 map function
  return hand.map(
    function(point) {
      return {
        // mirror the horizontal hand position
        x: map(point.x, 0, 1, width, 0),
        y: map(point.y, 0, 1, 0, height)
      }
    });
}
function serverConnected() {
  print("Connected to Server");
}

function gotList(thelist) {
  print("List of Serial Ports:");

  for (let i = 0; i < thelist.length; i++) {
    print(i + " " + thelist[i]);
  }
}

function gotOpen() {
  print("Serial Port is Open");
}

function gotClose() {
  print("Serial Port is Closed");
  latestData = "Serial Port is Closed";
}

function gotError(theerror) {
  print(theerror);
}

function gotData() {
  let currentString = serial.read();
  print("currentStrin",currentString);
  //trim(currentString);
  if (!currentString) return;
  if(currentString==49){
    updateF=1; 
  }else {
    updateF=0;
  }
  latestData = currentString;
}




function makeBubbles(ki) {
  for(var i = 0; i < ki; i++) {
    let size = random(15,50);
    let bub = new Bubble(size, random(0.1,1),random(0,windowWidth-(size/2)), random(800+(size/2),windowHeight));
    bubbles.push(bub);
    
    
  }
}

function updateBubbles() {
  for(j=0;j<bubbles.length;j++){
    bubbles[j].y -= bubbles[j].vel;
    if(bubbles[j].y-(bubbles[j].size/2) < 0) {
      bubbles[j].pop1();
    }
    if(pinX >= bubbles[j].x-(bubbles[j].size/2) && pinX <= bubbles[j].x+(bubbles[j].size/2) && pinY >= bubbles[j].y-(bubbles[j].size/2) && pinY <= bubbles[j].y+(bubbles[j].size/2)) {
       bubbles[j].pop1();
       //bubblesPop.push(j);
     }
  } 
}

function drawBubbles() {
  for (j=0;j<bubbles.length;j++) {
    bubbles[j].drawSelf();
  }
  //for(j=0;j<bubblesPop.length;j++){
  //  bubbles.splice(bubblesPop[j],bubblesPop[j]+1);
  //}
  //for(j=0;j<bubblesPop.length;j++){
    //bubblesPop.splice(0,bubblesPop.length);
  //}
}

class Bubble {
  
  //constructor(){
  //  this.size = 30;
  //  this.vel = 2;
  //  this.x = 250;
  //  this.y = 500;
  //  this.popping = false;
  //}
  
  constructor(size, vel, x, y) {
    this.size = size;
    this.vel = vel;
    this.x = x;
    this.y = y;
    this.popping = false;
  }
  
  drawSelf() {
    
    if(!this.popping) {
      fill(255);
      ellipse(this.x,this.y,this.size,this.size);
    } else {
      //popping, so make bigger then disappear
      let torusSize = this.size*1.25;
      let i = 10;
      while(i >= 0) {
        this.size++;
        torusSize--;
        ellipse(this.x,this.y,this.size,this.size);
        fill(0,200,100);
        ellipse(this.x,this.y,torusSize,torusSize);
        fill(255);
        i--;
      }
      //reset after pop
      this.popping = false;
      this.size = random(15,50);
      this.y = -800;
    }
  }
  
  popLines() { //don't use, doesn't look good
    line(this.x+(this.size/3), this.y+(this.size/3), 
      this.x+(this.size/3)+(this.size/4), y+(this.size/3)+(this.size/4));
    line(this.x+(this.size/3), this.y-(this.size/3), 
      this.x+(this.size/3)+(this.size/4), this.y-((this.size/3)+(this.size/4)));
    line(this.x-(this.size/3), this.y-(this.size/3), 
      this.x-((this.size/3)+(this.size/4)), this.y-((this.size/3)+(this.size/4)));
    line(this.x-(this.size/3), this.y+(this.size/3), 
      this.x-((this.size/3)+(this.size/4)), this.y+((this.size/3)+(this.size/4)));
    line(this.x-(this.size/2), this.y, this.x-(this.size/2)-(this.size/4), this.y);
    line(this.x+(this.size/2), this.y, this.x+(this.size/2)+(this.size/4), this.y);
    line(this.x, this.y-(this.size/2), this.x, this.y-(this.size/2)-(this.size/4));
    line(this.x, this.y+(this.size/2), this.x, this.y+(this.size/2)+(this.size/4));
  }
  
  pop1() {
   this.popping = true; 
  }
}

///////////////////////////////////




