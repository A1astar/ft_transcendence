import { Game } from "./objects.js";

export function updateGame(game: Game) {
	const left = game.paddles.left;
	const right = game.paddles.right;
	const ball = game.ball;

	ball.x += ball.vx;
	ball.y += ball.vy;

	// collision for top and bottom walls (-5 to 5)
	if (ball.y + ball.radius >= 5 || ball.y - ball.radius <= -5) {
		ball.vy *= -1;
	}

	// collision with left paddle
	if (ball.x - ball.radius <= left.x + left.width &&
		ball.x + ball.radius >= left.x &&
		ball.y >= left.y - left.height/2 &&
		ball.y <= left.y + left.height/2
	) {
		ball.vx *= -1;
	}
	
	// collision with right paddle
	if (ball.x + ball.radius >= right.x - right.width &&
		ball.x - ball.radius <= right.x &&
		ball.y >= right.y - right.height/2 &&
		ball.y <= right.y + right.height/2
	) {
		ball.vx *= -1;
	}

	// ball out of game
	if (ball.x < -10) {
		game.score.right++;
		game.reset();
	}
	else if (ball.x > 10) {
		game.score.left++;
		game.reset();
	}
}

export async function updatePaddle(game: Game) {
	const left = game.paddles.left;
	const right = game.paddles.right;
	const maxY = 4;
	const minY = -4;

	if (game.paddleMovement.leftUp && left.y > minY)
		left.y -= left.speed;
	if (game.paddleMovement.rightUp && right.y > minY)
		right.y -= right.speed;
	if (game.paddleMovement.leftDown && left.y < maxY)
		left.y += left.speed;
	if (game.paddleMovement.rightDown && right.y < maxY)
		right.y += right.speed;
}
