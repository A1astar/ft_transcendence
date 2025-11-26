import {Game} from "./objects.js";

export function leftPaddleCollision(ball: Game["ball"], paddle: Game["paddles"]["left"]) {
    if (ball.vx >= 0) return;

    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleTop = paddle.y - paddle.height / 2;
    const paddleBottom = paddle.y + paddle.height / 2;

    const nextBallLeft = ball.x - ball.radius + ball.vx;
    const nextBallRight = ball.x + ball.radius + ball.vx;
    const nextBallTop = ball.y - ball.radius + ball.vy;
    const nextBallBottom = ball.y + ball.radius + ball.vy;

    const overlapX = nextBallLeft <= paddleRight && nextBallRight >= paddleLeft;
    const overlapY = nextBallBottom >= paddleTop && nextBallTop <= paddleBottom;

    if (overlapX && overlapY) {
        ball.x = paddleRight + ball.radius;

        if (Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 0.2) {
            ball.vx = -0.22;
            ball.vy += 0.02;
        } else {
            ball.vx *= -1;
        }
    }
}

export function rightPaddleCollision(ball: Game["ball"], paddle: Game["paddles"]["right"]) {
    if (ball.vx <= 0) return;

    const paddleLeft = paddle.x - paddle.width;
    const paddleRight = paddle.x;
    const paddleTop = paddle.y - paddle.height / 2;
    const paddleBottom = paddle.y + paddle.height / 2;

    const nextBallLeft = ball.x - ball.radius + ball.vx;
    const nextBallRight = ball.x + ball.radius + ball.vx;
    const nextBallTop = ball.y - ball.radius + ball.vy;
    const nextBallBottom = ball.y + ball.radius + ball.vy;

    const overlapX = nextBallLeft <= paddleRight && nextBallRight >= paddleLeft;
    const overlapY = nextBallBottom >= paddleTop && nextBallTop <= paddleBottom;

    if (overlapX && overlapY) {
        ball.x = paddleLeft - ball.radius;

        if (Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 0.2) {
            ball.vx = 0.22;
            ball.vy += 0.02;
        } else {
            ball.vx *= -1;
        }
    }
}

export function upPaddleCollision(ball: Game["ball"], paddle: Game["paddles"]["up"]) {
    if (
        ball.y + ball.radius >= paddle.y - paddle.height &&
        ball.y - ball.radius <= paddle.y &&
        ball.x >= paddle.x - paddle.width / 2 &&
        ball.x <= paddle.x + paddle.width / 2
    ) {
        if (Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 0.2) {
            ball.vx += 0.02;
            ball.vy += 0.02;
        }
        ball.vy *= -1;
    }
}

export function downPaddleCollision(ball: Game["ball"], paddle: Game["paddles"]["down"]) {
    if (
        ball.y - ball.radius <= paddle.y + paddle.height &&
        ball.y + ball.radius >= paddle.y &&
        ball.x >= paddle.x - paddle.width / 2 &&
        ball.x <= paddle.x + paddle.width / 2
    ) {
        if (Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 0.2) {
            ball.vx += 0.02;
            ball.vy += 0.02;
        }
        ball.vy *= -1;
    }
}

export function widthWallsCollision(ball: Game["ball"]) {
    if (ball.y + ball.radius >= 5 || ball.y - ball.radius <= -5) {
        ball.vy *= -1;
    }
}
