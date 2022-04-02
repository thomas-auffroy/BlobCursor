var timestamp = null;
var lastMouseX = null;
var lastMouseY = null;

const cursor = document.getElementById("blob");
const widthC = cursor.getBoundingClientRect().width;
const heightC = cursor.getBoundingClientRect().height;

let speedX = 0;
let speedY = 0;

document.body.addEventListener("mousemove", function(e) {

	cursor.style = `top: ${e.clientY - heightC + blob.getRadius()*scaleFactor - blob.getYPos()}px; left: ${e.clientX-widthC/2}px`;

    if (timestamp === null) {
        timestamp = Date.now();
        lastMouseX = e.screenX;
        lastMouseY = e.screenY;
        return;
    }

    var now = Date.now();
    var dt =  now - timestamp;
    var dx = e.screenX - lastMouseX;
    var dy = e.screenY - lastMouseY;
    speedX = Math.round(dx / dt * 10);
    speedY = Math.round(dy / dt * 10);

 	
    timestamp = now;
    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
});