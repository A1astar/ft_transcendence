import {Game} from "./objects.js";

import {
    upPaddleCollision,
    downPaddleCollision,
    leftPaddleCollision,
    rightPaddleCollision,
    widthWallsCollision,
} from "./collisions.js";

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

function updateBallPos(ball: Game["ball"]) {
    ball.x += ball.vx;
    ball.y += ball.vy;
}

export function updateGame(game: Game) {
    updateBallPos(game.ball);

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
    let maxY = game.mode === "remote4" ? 8 : 4;
    let minY = game.mode === "remote4" ? -8 : -4;
    let maxX = 8;
    let minX = -8;

    if (game.paddleMovement.leftUp && left.y > minY) left.y -= left.speed;
    if (game.paddleMovement.rightUp && right.y > minY) right.y -= right.speed;
    if (game.paddleMovement.leftDown && left.y < maxY) left.y += left.speed;
    if (game.paddleMovement.rightDown && right.y < maxY) right.y += right.speed;

    if (game.paddleMovement.upLeft && up.x > minX) up.x -= up.speed;
    if (game.paddleMovement.upRight && up.x < maxX) up.x += up.speed;
    if (game.paddleMovement.downLeft && down.x > minX) down.x -= down.speed;
    if (game.paddleMovement.downRight && down.x < maxX) down.x += down.speed;
}
