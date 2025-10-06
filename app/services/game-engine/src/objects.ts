import { randomUUID } from "crypto";

export interface Player {
	id: string;
	alias: string;
}
 
export class Game {
	id = randomUUID();
	width = 800;
	height = 600;
	ball = {
		x: 400,
		y: 300,
		vx: 4,
		vy: 3,
		radius: 10
	};
	paddles = {
		left: { x: 30, y: 250, width: 10, height: 100, speed: 6 },
		right: { x: 760, y: 250, width: 10, height: 100, speed: 6 }
	};
	score = { left: 0, right: 0 };

	reset() {
		this.ball.x = 400;
		this.ball.y = 300;
	}
}

// export interface PaddleMoveRequest {
// 	paddleDirection: "up" | "down";
// 	side: "left" | "right";
// }