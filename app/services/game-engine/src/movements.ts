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
	if (ball.x + ball.radius >= right.x - right.width &&
		ball.y >= right.y &&
		ball.y <= right.y + right.height
	)
		ball.vx *= -1;

	// ball out of game
	if (ball.x < 0) {
		game.score.right++;
		game.reset();
	}
	else if (ball.x > game.width) {
		game.score.right++;
		game.reset();
	}
}

export async function paddleMoveUp(game: Game, side: "left"|"right") {

	const left = game.paddles.left;
	const right = game.paddles.right;
	if (side == "left") {
		if (left.y + left.height <= game.height)
			game.paddles.left.y += 1;
	}
	else if (side == "right")
		if (right.y + right.height <= game.height)
			game.paddles.right.y += 1;
}

export async function paddleMoveDown(game: Game, side: "left"|"right") {

	const left = game.paddles.left;
	const right = game.paddles.right;
	if (side == "left") {
		if (left.y + left.height <= game.height)
			game.paddles.left.y -= 1;
	}
	else if (side == "right")
		if (right.y + right.height <= game.height)
			game.paddles.right.y -= 1;
}