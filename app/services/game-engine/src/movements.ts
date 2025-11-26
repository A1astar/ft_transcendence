import {Game} from "./objects.js";

function leftPaddleCollision(ball: Game["ball"], paddle: Game["paddles"]["left"]) {
    if (
        ball.x - ball.radius <= paddle.x + paddle.width &&
        ball.x + ball.radius >= paddle.x &&
        ball.y >= paddle.y - paddle.height / 2 &&
        ball.y <= paddle.y + paddle.height / 2
    ) {
        if (Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 0.2) {
            ball.vx += 0.02;
            ball.vy += 0.02;
        }
        ball.vx *= -1;
    }
}

function rightPaddleCollision(ball: Game["ball"], paddle: Game["paddles"]["right"]) {
    if (
        ball.x + ball.radius >= paddle.x - paddle.width &&
        ball.x - ball.radius <= paddle.x &&
        ball.y >= paddle.y - paddle.height / 2 &&
        ball.y <= paddle.y + paddle.height / 2
    ) {
        if (Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 0.2) {
            ball.vx += 0.02;
            ball.vy += 0.02;
        }
        ball.vx *= -1;
    }
}

function upPaddleCollision(ball: Game["ball"], paddle: Game["paddles"]["up"]) {
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

function downPaddleCollision(ball: Game["ball"], paddle: Game["paddles"]["down"]) {
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

function widthWallsCollision(ball: Game["ball"]) {
    if (ball.y + ball.radius >= 5 || ball.y - ball.radius <= -5) {
        ball.vy *= -1;
    }
}

function updatedScore(gameMode: Game["mode"], ball: Game["ball"], score: Game["score"]): boolean {
    if (gameMode === "remote4") {
        if (ball.x < -10) {
            score.left--;
            return true;
        } else if (ball.x > 10) {
            score.right--;
            return true;
        } else if (ball.y < -10) {
            score.down--;
            return true;
        } else if (ball.y > 10) {
            score.up--;
            return true;
        } else {
            return false;
        }
    } else {
        if (ball.x < -10) {
            score.right++;
            return true;
        } else if (ball.x > 10) {
            score.left++;
            return true;
        } else {
            return false;
        }
    }
}

export function updateGame(game: Game) {
    leftPaddleCollision(game.ball, game.paddles.left);
    rightPaddleCollision(game.ball, game.paddles.right);

    if (game.mode === "remote4") {
        upPaddleCollision(game.ball, game.paddles.up);
        downPaddleCollision(game.ball, game.paddles.down);
    } else {
        widthWallsCollision(game.ball);
    }

    if (updatedScore(game.mode, game.ball, game.score)) {
        game.reset();
    }
}

export async function updatePaddle(game: Game) {
    const left = game.paddles.left;
    const right = game.paddles.right;
    const up = game.paddles.up;
    const down = game.paddles.down;
    let maxY = 0;
    let minY = 0;
    let maxX = 0;
    let minX = 0;

    if (game.mode === "remote4") {
        maxY = 8;
        minY = -8;
        maxX = 8;
        minX = -8;
    } else {
        maxY = 4;
        minY = -4;
        maxX = 8;
        minX = -8;
    }
    // Left and right paddle movement (vertical)
    if (game.paddleMovement.leftUp && left.y > minY) left.y -= left.speed;
    if (game.paddleMovement.rightUp && right.y > minY) right.y -= right.speed;
    if (game.paddleMovement.leftDown && left.y < maxY) left.y += left.speed;
    if (game.paddleMovement.rightDown && right.y < maxY) right.y += right.speed;

    // Up and down paddle movement (horizontal)
    if (game.paddleMovement.upLeft && up.x > minX) up.x -= up.speed;
    if (game.paddleMovement.upRight && up.x < maxX) up.x += up.speed;
    if (game.paddleMovement.downLeft && down.x > minX) down.x -= down.speed;
    if (game.paddleMovement.downRight && down.x < maxX) down.x += down.speed;
}
