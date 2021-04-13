class Slider {
  constructor(x, y, width, height, updateCB) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    this.value = 1.0;
    this.updateCB = () => {
        if (updateCB === undefined)
            return;

        updateCB(this);
    };
  }
  
  show() {
    fill(0, 255, 0);
    const currentHeight = int((this.value / 100.0) * this.height);
    rect(this.x, this.y - currentHeight , this.width, currentHeight);
  }
  
  increase() {
    this.value += 5;
    if (this.value > 100) this.value = 100.0;
  }
  
  decrease() {
    this.value -= 5;
    if (this.value > 100) this.value = 0.0;
  }
  
  inside(x, y) {
    return x > this.x && x < (this.x + this.width) && y < this.y && y > (this.y - this.height);
  }
  
  update(x, y) {
    if (!this.inside(x, y)) return;
    
    const percentage = 100 * (this.y - float(y)) / this.height;
    this.value = percentage;
  }

  setPercentage(val) {
    this.value = val;
  }

  getPercentage() {
    return this.value;
  }

  callCB() {
    this.updateCB(this);
  }
}


function setup() {
  createCanvas(400, 400);
  frameRate(60);
}

function updateSpeed(s) {
    const newVal = int((s.getPercentage() / 100.0) * (255 * 2)) - 255;
    if (newVal < 0)
        sendRequest("Engine steering", { velocity: { power: -newVal, forward: false } } ).then(console.log);
    else
        sendRequest("Engine steering", { velocity: { power: newVal, forward: true } } ).then(console.log);
}

function updateAngle(s) {
    const newVal = int((s.getPercentage() / 100.0) * (255 * 2)) - 255;
    if (newVal < 0)
        sendRequest("Engine steering", { angle: { power: -newVal, right: false } } ).then(console.log);
    else
        sendRequest("Engine steering", { angle: { power: newVal, right: true } } ).then(console.log);
}

const slider1 = new Slider(20, 300, 160, 200, updateSpeed);
const slider2 = new Slider(220, 300, 160, 200, updateAngle);

slider1.setPercentage(50);
slider2.setPercentage(50);

const sliders = [ slider1, slider2 ];

let counter = 0;

function draw() {
  clear();
  fill(0, 255, 0);
 
  for (const slider of sliders) {
    slider.show();
  }

  if (counter % 5 == 0) {
      slider1.callCB();
      slider2.callCB();
  }
  counter++;
}

function touchMoved() {
  for (const touch of touches) {
    for (const slider of sliders) {
      slider.update(touch.x, touch.y);
    }
  }
}

function mousePressed() {
    for (const slider of sliders) {
      slider.update(mouseX, mouseY);
    }
}

function mouseDragged() {
    for (const slider of sliders) {
      slider.update(mouseX, mouseY);
    }
}

function keyPressed() {
  
  if (key==="w") slider1.increase();
  if (key==="s") slider1.decrease();
}

