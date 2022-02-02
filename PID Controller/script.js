'use strict';

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

const RESIZE = document.createEvent("Event");
RESIZE.initEvent("resize");

var savedTime = 0;
var objX = 0;
var objY = 0;

var lastCursorPosX = 0;
var lastCursorPosY = 0;

var objectSize = 0;
var objects = [];
var selecting = false;

var Kp = 0.25; //proportional gain
var Kd = 0.4; //derivative gain
var Ki = 0.009; //integral gain

var gravity = 0.5;
var drag = 0.999;

var previousErrorX = 0;
var previousErrorY = 0;
var integralX = 0;
var integralY = 0;



window.addEventListener("load", function(e) {
	document.body.appendChild(canvas);
	window.dispatchEvent(RESIZE);
	
	initialiseObjects();
	savedTime = e.timeStamp;
	
	requestAnimationFrame(main);
});

window.addEventListener("resize", function(e) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	objectSize = canvas.width / 20;
});

window.addEventListener("mousemove", function(e){
	objX = e.offsetX;
	objY = e.offsetY;
	
	lastCursorPosX = e.offsetX;
	lastCursorPosY = e.offsetY;
});

window.addEventListener("mousedown", function(e){
	selection(e.offsetX, e.offsetY);
	console.log(integralX,integralY);
});

window.addEventListener("mouseup", function(e){
	deselect();
});

function main(time) {
	var difference = time - savedTime;
	savedTime = time;
	
	for(var i = 0; i < objects.length; i ++){
		PIDcalcPosition(difference, objects[i]);
		CalculatePhysics(difference, objects[i]);
	}
	draw()
	
	requestAnimationFrame(main);
}

function initialiseObjects(){
	for (var x = 0; x < 10; x ++){
		objects.push({x: canvas.width / 10 * x + objectSize/2, y: canvas.height - objectSize, isSelected: false, speedX: 0, speedY: 0});
	}
}

function selection(x, y){
	for (var i = 0; i < objects.length; i ++){
		if ((x - objects[i].x ) < objectSize / 2 
		&& (x - objects[i].x ) > -objectSize / 2
		&& (y - objects[i].y ) > -objectSize / 2
		&& (y - objects[i].y ) < objectSize / 2){
			objects[i].isSelected = true;
		}
	}
}

function deselect(){
	for(var i = 0; i < objects.length; i ++){
		objects[i].isSelected = false;
	}
	integralX = 0;
	integralY = 0;
}

function PIDcalcPosition(dt, object){
	//console.log("x: ", pidX, " y: ", pidY);
	if(object.isSelected == false){
		return;
	}
	
	if (integralX == 0 && integralY == 0){
		integralX = object.x * 111;
		integralY = object.y * 111;
	}
	var errorX = lastCursorPosX - object.x;
	var errorY = lastCursorPosY - object.y;
	//console.log(errorX, errorY);
	var proportionalX = errorX;
	var proportionalY = errorY;
	var derivativeX = (errorX - previousErrorX) / dt;
	var derivativeY = (errorY - previousErrorY) / dt;
	//console.log(derivativeX, derivativeY);
	integralX = integralX + errorX * dt;
	integralY = integralY + errorY * dt;
	//console.log(integralX, integralY);
	object.speedX = ((Kp * proportionalX + Kd * derivativeX + Ki * integralX) - object.x);
	object.speedY = ((Kp * proportionalY + Kd * derivativeY + Ki * integralY) - object.y);
	
	object.x = Kp * proportionalX + Kd * derivativeX + Ki * integralX;
	object.y = Kp * proportionalY + Kd * derivativeY + Ki * integralY;
	previousErrorX = errorX;
	previousErrorY = errorY;
}

function CalculatePhysics(dt, object){
	
	if(object.isSelected || object.speedX == 0 && object.speedY == 0) return;
	
	object.x = (object.x + object.speedX);
	object.y = (object.y + object.speedY);
	
	object.speedX = object.speedX * drag;
	object.speedY = (object.speedY + gravity) * drag;
}

function draw(){
	context.fillStyle = "black";
	context.fillRect(0,0, canvas.width, canvas.height);
	
	
	for (var i = 0; i < objects.length; i ++){
		context.strokeStyle = "red";
		context.fillStyle = "red";
		
		context.strokeRect(objects[i].x - 10, objects[i].y - 10, 20, 20);
		context.fillRect(objects[i].x - 10, objects[i].y - 10, 20, 20);
	}
}