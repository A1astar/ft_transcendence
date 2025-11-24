import { Game } from "./objects.js";

export function updateGame(game: Game) {
	const left = game.paddles.left;
	const right = game.paddles.right;
	const ball = game.ball;
	const up = game.paddles.up;
	const down = game.paddles.down;

	ball.x += ball.vx;
	ball.y += ball.vy;

	if (game.mode === 'remote4') {
		// collision with up paddle
		if (ball.y + ball.radius >= up.y - up.height &&
			ball.y - ball.radius <= up.y &&
			ball.x >= up.x - up.width/2 &&
			ball.x <= up.x + up.width/2
		) {
			ball.vy *= -1;
		}

		// collision with down paddle
		if (ball.y - ball.radius <= down.y + down.height &&
			ball.y + ball.radius >= down.y &&
			ball.x >= down.x - down.width/2 &&
			ball.x <= down.x + down.width/2
		) {
			ball.vy *= -1;
		}
	}
	else {
		// collision for top and bottom walls (-5 to 5)
		if (ball.y + ball.radius >= 5 || ball.y - ball.radius <= -5) {
			ball.vy *= -1;
		}		
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
	if (game.mode === 'remote4') {
		if (ball.x < -10) {
			game.score.left--;
			game.reset();
		}
		else if (ball.x > 10) {
			game.score.right--;
			game.reset();
		}
		else if (ball.y < -5) {
			game.score.down--;
			game.reset();
		}
		else if (ball.y > 5) {
			game.score.up--;
			game.reset();
		}
	}
	else {
		if (ball.x < -10) {
			game.score.right++;
			game.reset();
		}
		else if (ball.x > 10) {
			game.score.left++;
			game.reset();
		}		
	}
}

export async function updatePaddle(game: Game) {
	const left = game.paddles.left;
	const right = game.paddles.right;
	const up = game.paddles.up;
	const down = game.paddles.down;
	const maxY = 4;
	const minY = -4;
	const maxX = 8;
	const minX = -8;

	// Left and right paddle movement (vertical)
	// Allow movement if at or near boundary (with small tolerance for floating point errors)
	if (game.paddleMovement.leftUp && left.y >= minY - 0.1)
		left.y = Math.max(minY, left.y - left.speed);
	if (game.paddleMovement.rightUp && right.y >= minY - 0.1)
		right.y = Math.max(minY, right.y - right.speed);
	if (game.paddleMovement.leftDown && left.y <= maxY + 0.1)
		left.y = Math.min(maxY, left.y + left.speed);
	if (game.paddleMovement.rightDown && right.y <= maxY + 0.1)
		right.y = Math.min(maxY, right.y + right.speed);

	// Up and down paddle movement (horizontal)
	if (game.paddleMovement.upLeft && up.x > minX)
		up.x -= up.speed;
	if (game.paddleMovement.upRight && up.x < maxX)
		up.x += up.speed;
	if (game.paddleMovement.downLeft && down.x > minX)
		down.x -= down.speed;
	if (game.paddleMovement.downRight && down.x < maxX)
		down.x += down.speed;
}
