var timestamp = null;
var lastMouseX = null;
var lastMouseY = null;

const cursor = document.getElementById("blob");
const widthC = cursor.getBoundingClientRect().width;
const heightC = cursor.getBoundingClientRect().height;

let speedX = 0;
let speedY = 0;

const test = document.getElementById("test");


document.body.addEventListener("mousemove", function(e) {

    console.log(e.clientY);

	cursor.style = `top: ${e.clientY - heightC + blob.getRadius()*scaleFactor + blob.getYPos()}px; left: ${e.clientX-widthC/2}px`;

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


document.body.addEventListener("click", arg => {
    const bottom = arg.target.getBoundingClientRect().bottom;
    const middle = arg.target.getBoundingClientRect().x + arg.target.getBoundingClientRect().width* 0.5;

    const a = test.getBoundingClientRect();

    console.log(a);
    console.log(arg.target.getBoundingClientRect());
    console.log("Position blob : (%d,%d)",middle - blob.getXPos(), bottom - blob.getYPos() - blob.getRadius()*scaleFactor);
    console.log(blob.getYPos()+blob.getRadius());

})

