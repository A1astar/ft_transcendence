import { Game } from "./objects";

export function updateGame(game: Game) {
	const left = game.paddles.left;
	const right = game.paddles.right;
	const ball = game.ball;

	ball.x += ball.vx;
	ball.y += ball.vy;

	// collision for top bottom
	if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= game.height)
		ball.vy *= -1;

	// collision with left paddles
	if (ball.x - ball.radius <= left.x + left.width &&
		ball.y >= left.y &&
		ball.y <= left.y + left.height
	)
		ball.vx *= -1;
	
	// collision with right paddles
	if (ball.x + ball.radius >= right.x &&
		ball.y >= right.y &&
		ball.y <= right.y + right.height
	)
		ball.vx *= -1;

	// ball out of game
	if (ball.x < left.x) {
		game.score.right++;
		game.reset();
	}
	else if (ball.x > right.x + right.width) {
		game.score.left++;
		game.reset();
	}
}

export async function updatePaddle(game: Game) {
	const left = game.paddles.left;
	const right = game.paddles.right;
	if (game.paddleMovement.leftUp == true && left.y >= 0)
		left.y -= left.speed;
	if (game.paddleMovement.rightUp == true && right.y >= 0)
		right.y -= right.speed;
	if (game.paddleMovement.leftDown == true && left.y + left.height <= game.height)
		left.y += left.speed;
	if (game.paddleMovement.rightDown == true && right.y + right.height <= game.height)
		right.y += right.speed;
}

// export async function paddleMoveUp(game: Game, side: "left"|"right") {

// 	const left = game.paddles.left;
// 	const right = game.paddles.right;
// 	if (side == "left") {
// 		if (left.y >= 0)
// 			game.paddles.left.y -= 20;
// 	}
// 	else if (side == "right")
// 		if (right.y >= 0)
// 			game.paddles.right.y -= 20;
// }

// export async function paddleMoveDown(game: Game, side: "left"|"right") {

// 	const left = game.paddles.left;
// 	const right = game.paddles.right;
// 	if (side == "left") {
// 		if (left.y + left.height <= game.height)
// 			game.paddles.left.y += 20;
// 	}
// 	else if (side == "right")
// 		if (right.y + right.height <= game.height)
// 			game.paddles.right.y += 20;
// }