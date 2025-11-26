import {randomUUID} from "crypto";

export const games = new Map<string, Game>();
export const gameConnections = new Map<string, Set<any>>();

export interface Player {
    id: string;
    alias: string;
}

export class Game {
    id = randomUUID();
    mode = "";
    players = {left: 0, right: 0, up: 0, down: 0};
    ball = {x: 0, y: 2, vx: 0.1, vy: 0.1, radius: 0.35};
    paddles = {
        left: {x: -9, y: 0, width: 0.25, height: 2, speed: 0.3},
        right: {x: 9, y: 0, width: 0.25, height: 2, speed: 0.3},
        up: {x: 0, y: 9, width: 2, height: 0.25, speed: 0.3},
        down: {x: 0, y: -9, width: 2, height: 0.25, speed: 0.3},
    };
    score = {left: 0, right: 0, up: 0, down: 0};
    paddleMovement = {
        leftUp: false,
        leftDown: false,
        rightUp: false,
        rightDown: false,
        upLeft: false,
        upRight: false,
        downLeft: false,
        downRight: false,
    };
    reset() {
        this.ball.vx = 0.1;
        this.ball.vy = 0.1;
        this.ball.x = 0;
        this.ball.y = 2;
    }
}
