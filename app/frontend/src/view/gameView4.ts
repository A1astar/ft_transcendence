declare const BABYLON: any; // Global BABYLON from CDN
import {createCanvas, SERVER_BASE} from "./utils.js";

import {
    clearDiv,
    createVideoBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createParagraphText,
    createFormElement,
    createInputElement,
    createLogoElement,
    createButtonForm,
    createBoxDiv,
} from "./utils.js";

import {
    gotMatchInfos,
    createCamera,
    createLight,
    update3DMeshPos,
    scaling3DMesh,
    createTorch,
    createBaradDur,
    createPaddle,
    createPaddleRotate,
    createBackgroundScene,
    createScoreBox4,
    createVisionCone,
    updateVisionConePos,
    displayScore4,
} from "./gameViewUtils.js";

import {endGameView} from "./endGameView.js";

const appDiv = document.getElementById("app");
const groundTexture = "../../public/textures/pongTable.png";
const eyeTexture = "../../public/textures/eye.png";

function updateScore(GameState: any) {
    if (GameState.ball.x == -10) GameState.score.left--;
    if (GameState.ball.x == 10) GameState.score.right--;
    if (GameState.ball.y == -5) GameState.score.down--;
    if (GameState.ball.y == 5) GameState.score.up--;
}

function setupWebsocket(
    matchInfos: any,
    ball: any,
    leftPaddle: any,
    rightPaddle: any,
    upPaddle: any,
    downPaddle: any,
    scoreText: any,
    onGameEnd?: (winner: string) => void,
) {
    const ws = new WebSocket(`wss://${SERVER_BASE}:8443/api/game-engine/${matchInfos.id}`);
    // const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // const ws = new WebSocket(`${protocol}//${window.location.host}/api/game-engine/${matchInfos.id}`);

    let hasLeftGame = false;

    function leaveGame() {
        if (hasLeftGame) return;
        hasLeftGame = true;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({type: "leave"}));
        }
    }

    function onPopState(_event: PopStateEvent) {
        leaveGame();
    }

    function onBeforeUnload(_event: BeforeUnloadEvent) {
        leaveGame();
    }

    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", onBeforeUnload);

    const handleKeyDown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (["w", "s", "p", "l"].includes(key)) {
            ws.send(JSON.stringify({type: "keyPress", key: key}));
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (["w", "s", "p", "l"].includes(key)) {
            ws.send(JSON.stringify({type: "keyRelease", key: key}));
        }
    };

    ws.onopen = () => {
        console.log("Connected to game engine");
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
    };

    let gameEnded = false;

    ws.onmessage = (event) => {
        if (gameEnded) return;
        const message = JSON.parse(event.data);

        if (message.error) {
            console.error("Game engine error:", message.error);
            return;
        }

        if (message.type === "gameState") {
            const gameState = message.data;

            if (ball && gameState.ball) {
                update3DMeshPos(ball, gameState.ball.x, 0.25, gameState.ball.y);
            }
            if (leftPaddle && gameState.paddles && gameState.paddles.left) {
                update3DMeshPos(leftPaddle, gameState.paddles.left.x, 0, gameState.paddles.left.y);
            }
            if (rightPaddle && gameState.paddles && gameState.paddles.right) {
                update3DMeshPos(
                    rightPaddle,
                    gameState.paddles.right.x,
                    0,
                    gameState.paddles.right.y,
                );
            }
            if (upPaddle && gameState.paddles && gameState.paddles.up) {
                update3DMeshPos(upPaddle, gameState.paddles.up.x, 0, gameState.paddles.up.y);
            }
            if (downPaddle && gameState.paddles && gameState.paddles.down) {
                update3DMeshPos(downPaddle, gameState.paddles.down.x, 0, gameState.paddles.down.y);
            }

            // Update score
            if (gameState.score && appDiv) {
                updateScore(gameState);
                displayScore4(matchInfos, appDiv, gameState, scoreText);

                const scores = [
                    gameState.score.left,
                    gameState.score.right,
                    gameState.score.up,
                    gameState.score.down,
                ];
                const playersWithPositiveScore = scores.filter((score) => score > 0);

                if (playersWithPositiveScore.length === 1) {
                    // Map sides to player names using assignments
                    const getPlayerNameForSide = (side: string) => {
                        if (matchInfos.assignments && matchInfos.assignments[side]) {
                            return matchInfos.assignments[side];
                        }
                        // Fallback: try to find by index
                        const sideIndex = ["left", "right", "up", "down"].indexOf(side);
                        return matchInfos.players[sideIndex]?.alias || `Player ${sideIndex + 1}`;
                    };

                    const playerNames = {
                        left: getPlayerNameForSide("left"),
                        right: getPlayerNameForSide("right"),
                        up: getPlayerNameForSide("up"),
                        down: getPlayerNameForSide("down"),
                    };

                    // Find winning side
                    const winningSide = ["left", "right", "up", "down"].find(
                        (side, index) => scores[index] > 0
                    );

                    const winner = winningSide ? playerNames[winningSide as keyof typeof playerNames] : "Unknown";
                    gameEnded = true;
                    ws.close();
                    document.removeEventListener("keydown", handleKeyDown);
                    document.removeEventListener("keyup", handleKeyUp);

                    if (onGameEnd) {
                        onGameEnd(winner);
                    } else {
                        endGameView(winner);
                    }
                    return;
                }
            }
        }
    };

    ws.onclose = () => {
        console.log("Disconnected from game engine");
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
    };
}

function setupScene(canvas: HTMLCanvasElement) {
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture(groundTexture, scene);

    const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

    const ballMaterial = new BABYLON.StandardMaterial("ballMaterial", scene);
    ballMaterial.diffuseTexture = new BABYLON.Texture(eyeTexture, scene);

    const paddleMaterial = new BABYLON.StandardMaterial("paddleMaterial", scene);
    paddleMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

    createBackgroundScene();

    const pongRoot = new BABYLON.TransformNode("pongRoot", scene);

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
    ground.material = groundMaterial;
    ground.parent = pongRoot;

    const ball = BABYLON.MeshBuilder.CreateCylinder(
        "ball",
        {
            diameter: 0.5,
            height: 0.01,
        },
        scene,
    );
    ball.material = ballMaterial;
    update3DMeshPos(ball, 0, 0.25, 0);
    ball.parent = pongRoot;

    const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {}, scene);
    leftWall.material = wallMaterial;
    scaling3DMesh(leftWall, 0.2, 0.5, 20);
    update3DMeshPos(leftWall, -10, 0, 0);
    leftWall.parent = pongRoot;

    const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", {}, scene);
    rightWall.material = wallMaterial;
    scaling3DMesh(rightWall, 0.2, 0.5, 20);
    update3DMeshPos(rightWall, 10, 0, 0);
    rightWall.parent = pongRoot;

    const upperWall = BABYLON.MeshBuilder.CreateBox("upperWall", {}, scene);
    upperWall.material = wallMaterial;
    scaling3DMesh(upperWall, 20.2, 0.5, 0.2);
    update3DMeshPos(upperWall, 0, 0, -10);
    upperWall.parent = pongRoot;

    const lowerWall = BABYLON.MeshBuilder.CreateBox("lowerWall", {}, scene);
    lowerWall.material = wallMaterial;
    scaling3DMesh(lowerWall, 20.2, 0.5, 0.2);
    update3DMeshPos(lowerWall, 0, 0, 10);
    lowerWall.parent = pongRoot;

    const topleftTorch = createTorch(scene);
    update3DMeshPos(topleftTorch, 10, 0, -10);
    topleftTorch.parent = pongRoot;

    const topRightTorch = createTorch(scene);
    update3DMeshPos(topRightTorch, -10, 0, -10);
    topRightTorch.parent = pongRoot;

    const bottomleftTorch = createTorch(scene);
    update3DMeshPos(bottomleftTorch, 10, 0, 10);
    bottomleftTorch.parent = pongRoot;

    const bottomRightTorch = createTorch(scene);
    update3DMeshPos(bottomRightTorch, -10, 0, 10);
    bottomRightTorch.parent = pongRoot;

    const leftPaddle = createPaddle(scene);
    leftPaddle.material = paddleMaterial;
    leftPaddle.parent = pongRoot;

    const rightPaddle = createPaddle(scene);
    rightPaddle.material = paddleMaterial;
    rightPaddle.parent = pongRoot;

    const upPaddle = createPaddleRotate(scene);
    upPaddle.material = paddleMaterial;
    upPaddle.parent = pongRoot;

    const downPaddle = createPaddleRotate(scene);
    downPaddle.material = paddleMaterial;
    downPaddle.parent = pongRoot;

    scaling3DMesh(pongRoot, 2, 2, 2);
    pongRoot.position.y = 2;

    const tower = createBaradDur(scene);
    scaling3DMesh(tower, 5, 5, 5);
    update3DMeshPos(tower, -18, 0, -27);

    const visionCone = createVisionCone(scene);
    updateVisionConePos(scene, ball, visionCone);

    const scoreText = createScoreBox4(scene);
    createCamera(scene, canvas);
    createLight(scene);

    return {
        engine,
        scene,
        ball,
        leftPaddle,
        rightPaddle,
        upPaddle,
        downPaddle,
        visionCone,
        scoreText,
    };
}


export function renderGame4(matchInfos: any, onGameEnd?: (winner: string) => void) {
    if (!appDiv) return;
    clearDiv(appDiv);

    if (!gotMatchInfos(matchInfos)) {
        console.error("Invalid match object");
        return;
    }

    const canvas = createCanvas();
    appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Sauron.mp4"));
    appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
    appDiv.appendChild(createHeadingText("Lord of Transcendence"));
    appDiv.appendChild(canvas);

    let {
        engine,
        scene,
        ball,
        leftPaddle,
        rightPaddle,
        upPaddle,
        downPaddle,
        visionCone,
        scoreText,
    } = setupScene(canvas);
    setupWebsocket(
        matchInfos,
        ball,
        leftPaddle,
        rightPaddle,
        upPaddle,
        downPaddle,
        scoreText,
        onGameEnd,
    );

    engine.runRenderLoop(() => {
        updateVisionConePos(scene, ball, visionCone);
        scene.render();
    });
    window.addEventListener("resize", () => engine.resize());
}
