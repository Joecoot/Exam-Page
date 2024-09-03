import Ball from './Ball.js';

const canvas = document.getElementById("floatingBalls");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const numberOfBalls = 50;
const ballsArray = [];

function createBalls() {
    for (let i = 0; i<numberOfBalls; i++) {
        let ball = new Ball(2, ballsArray);
        ballsArray.push(ball);
    }
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ballsArray.forEach(ball => ball.update());
}

createBalls();