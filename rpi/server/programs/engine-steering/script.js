
let gui;

let angleController;
let velocityController;
let joyStickController;

let currentAngle = 0;
let currentVel = 0;

// Aproximates to nearest multiple of num:
// Ex for num=5:
// 8 -> 10
// 7 -> 5
// 5 -> 5
// 11 -> 10
// 14 -> 15
function toNearest(val, num) {
	const distance = val % num;
	if (distance > (num / 2)) {
		return val - distance + num;
	}
	else {
		return val - distance;
	}
}

function changeAngle(angle) {
	joyStickController.valX = angle;
	angleController.val = angle;

	if (Math.abs(angle - currentAngle) < 5) return;

	currentAngle = toNearest(angle, 5);

	const MaxVal = 510;

	if (currentAngle < 0)
		sendRequest("Engine steering", { port: serialPort, angle: { power: Math.round(-currentAngle / 100 * MaxVal), right: false } }).catch(console.warn);
	else
		sendRequest("Engine steering", { port: serialPort, angle: { power: Math.round(currentAngle / 100 * MaxVal), right: true } }).catch(console.warn);
}

function changeVelocity(vel) {
	joyStickController.valY = vel;
	velocityController.val = vel;

	if (Math.abs(vel - currentVel) < 5) return;

	currentVel = toNearest(vel, 5);

	const MaxVal = 255;

	if (currentVel < 0)
		sendRequest("Engine steering", { port: serialPort, velocity: { power: Math.round(-currentVel / 100 * MaxVal), forward: false } }).catch(console.warn);
	else
		sendRequest("Engine steering", { port: serialPort, velocity: { power: Math.round(currentVel / 100 * MaxVal), forward: true } }).catch(console.warn);
}

function setupGui() {
	gui = createGui();

	angleController = createCrossfader("AngleController", 100, 50, width - 200, 48, -100, 100);
	velocityController = createCrossfaderV("Velocitycontroller", 50, 100, 48, height - 120, -100, 100);
	joyStickController = createJoystick("Joystick", 150, 150, width - 250, height - 170, -100, 100, -100, 100);
}

let serialPort;

function setup() {
	serialPort = prompt("Please provide a serial port ... (likely /dev/serial0)");

	createCanvas(windowWidth, windowHeight);
	setupGui();

	registerInfoHandler((msg) => {
		// TODO: Add sync across all the programs
	});
}


function draw() {
	// TODO: Implement messages every interval time in order
	// to eliminate communiaction errors (instead of isChanged)
	background(72, 61, 139);
	drawGui();

	if (angleController.isChanged) {
		changeAngle(angleController.val);
	}
	else if (joyStickController.isChanged) {
		changeAngle(joyStickController.valX);
		changeVelocity(joyStickController.valY);
	}
	else if (velocityController.isChanged) {
		changeVelocity(velocityController.val);
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	angleController.w = width - 200;
	velocityController.h = height - 120;
	joyStickController.w = width - 250;
	joyStickController.h = height - 170;
}

/// Add these lines below sketch to prevent scrolling on mobile
function touchMoved() {
	return false;
}
