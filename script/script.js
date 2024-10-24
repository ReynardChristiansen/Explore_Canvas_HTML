const socket = io();
var canvas = document.querySelector("canvas");
var drawingSurface = canvas.getContext("2d");
var spriteObject = {
    x: 0,
    y: 0,
    width: 64,
    height: 100
};
var moo = Object.create(spriteObject);
moo.x = 100;
moo.y = 100;

var image = new Image();
image.src = "hero_spritesheet.png";
image.onload = () => {
    update();
};

const frameWidth = 64;
const frameHeight = 100;
let frameIndex = 0;
const fps = 80;
const secondsToUpdate = 2 * fps;
let count = 0;

var Xspeed = 0;
var Yspeed = 0;
var moveLeft = false;
var moveRight = false;
var moveUp = false;
var moveDown = false;

var users = {};

window.addEventListener("keydown", function(e) {
    switch(e.key) {
        case "ArrowUp":
            moveUp = true;
            break;
        case "ArrowDown":
            moveDown = true;
            break;
        case "ArrowLeft":
            moveLeft = true;
            break;
        case "ArrowRight":
            moveRight = true;
            break;
    }
}, false);

window.addEventListener("keyup", function(e) {
    switch(e.key) {
        case "ArrowUp":
            moveUp = false;
            break;
        case "ArrowDown":
            moveDown = false;
            break;
        case "ArrowLeft":
            moveLeft = false;
            break;
        case "ArrowRight":
            moveRight = false;
            break;
    }
}, false);

function update() {
    window.requestAnimationFrame(update);
    
    if (moveUp && !moveDown) Yspeed = -5;
    else if (moveDown && !moveUp) Yspeed = 5;
    else Yspeed = 0;

    if (moveLeft && !moveRight) Xspeed = -5;
    else if (moveRight && !moveLeft) Xspeed = 5;
    else Xspeed = 0;

    moo.x += Xspeed;
    moo.y += Yspeed;

    if (moo.x < 0) moo.x = 0;
    if (moo.y < 0) moo.y = 0;
    if (moo.x + moo.width > canvas.width) moo.x = canvas.width - moo.width;
    if (moo.y + moo.height > canvas.height) moo.y = canvas.height - moo.height;

    socket.emit('userMovement', { x: moo.x, y: moo.y });

    count++;
    if (count > 5) {
        frameIndex++;
        count = 0;
    }
    if (frameIndex > 11) {
        frameIndex = 0;
    }

    render();
}

function render() {
    drawingSurface.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in users) {
        const user = users[id];
        if (user) {
            drawingSurface.drawImage(
                image,
                frameIndex * frameWidth,
                0,
                frameWidth,
                frameHeight,
                Math.floor(user.x),
                Math.floor(user.y),
                moo.width,
                moo.height
            );
        }
    }

    drawingSurface.drawImage(
        image,
        frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight,
        Math.floor(moo.x),
        Math.floor(moo.y),
        moo.width,
        moo.height
    );
}

socket.on('updateUsers', (updatedUsers) => {
    users = updatedUsers;

    if (users[socket.id]) {
        moo.x = users[socket.id].x;
        moo.y = users[socket.id].y;
    }
});

socket.on('connect', () => {
    users[socket.id] = { x: moo.x, y: moo.y };
});
