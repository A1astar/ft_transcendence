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
		left: { x: 30, y: 250, width: 10, height: 100, speed: 10 },
		right: { x: 760, y: 250, width: 10, height: 100, speed: 10 }
	};
	score = { left: 0, right: 0 };
	paddleMovement = {
		leftUp: false,
		leftDown: false,
		rightUp: false,
		rightDown: false
	};

	reset() {
		this.ball.x = 400;
		this.ball.y = 300;
	}
}
