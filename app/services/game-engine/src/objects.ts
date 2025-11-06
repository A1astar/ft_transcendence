import { randomUUID } from "crypto";

export const games = new Map<string, Game>();
export const gameConnections = new Map<string, Set<any>>();

export interface Player {
	id: string;
	alias: string;
};
 
export class Game {
	id = randomUUID();
	mode = '';
	players = {
		left: 0,
		right: 0
	}
	width = 20;     // Full scene width
	height = 10;    // Scene height (-5 to 5)
	ball = {
		x: 0,       // Center of scene (-10 to 10)
		y: 0,       // Center of scene (-5 to 5)
		vx: 0.08,    // Ball velocity X
		vy: 0.08,    // Ball velocity Y
		radius: 0.35
	};
	paddles = {
		left: { x: -8, y: 0, width: 0.25, height: 2, speed: 0.15 },
		right: { x: 8, y: 0, width: 0.25, height: 2, speed: 0.15 }
	};
	score = { left: 0, right: 0 };
	paddleMovement = {
		leftUp: false,
		leftDown: false,
		rightUp: false,
		rightDown: false
	};

	reset() {
		this.ball.x = 0;
		this.ball.y = 0;
	}
}
