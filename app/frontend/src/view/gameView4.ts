declare const BABYLON: any; // Global BABYLON from CDN
import {SERVER_BASE} from "./utils.js";

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

import {endGameView} from "./endGameView.js";

const appDiv = document.getElementById("app");

function updateScore(GameState: any) {
    // 4-player scoring logic - players lose points when ball goes through their side
    if (GameState.ball.x == -10) GameState.score.left--;
    if (GameState.ball.x == 10) GameState.score.right--;
    if (GameState.ball.y == -5) GameState.score.down--;
    if (GameState.ball.y == 5) GameState.score.up--;
}

function displayScore(matchInfos: any, appDiv: HTMLElement, GameState: any) {
    let scoreBoard = document.getElementById("scoreBoard");

    if (!scoreBoard) {
        scoreBoard = createBoxDiv("scoreBoard");
        appDiv.appendChild(scoreBoard);
    }
    
    scoreBoard.innerHTML = "";
    
    // 4-player scoreboard layout matching game positions
    const scoreContainer = document.createElement("div");
    scoreContainer.className = "relative w-full max-w-md mx-auto p-4";
    
    // Top player (up) - positioned at top center
    const upScore = createSubheadingText(`${matchInfos.players[2]?.alias || 'Player 3'}: ${GameState.score.up}`, "center");
    upScore.className += " text-yellow-400 absolute top-0 left-1/2 transform -translate-x-1/2";
    
    // Bottom player (down) - positioned at bottom center
    const downScore = createSubheadingText(`${matchInfos.players[3]?.alias || 'Player 4'}: ${GameState.score.down}`, "center");
    downScore.className += " text-green-400 absolute bottom-0 left-1/2 transform -translate-x-1/2";
    
    // Left player - positioned at left center
    const leftScore = createSubheadingText(`${matchInfos.players[0]?.alias || 'Player 1'}: ${GameState.score.left}`, "center");
    leftScore.className += " text-blue-400 absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90";
    
    // Right player - positioned at right center
    const rightScore = createSubheadingText(`${matchInfos.players[1]?.alias || 'Player 2'}: ${GameState.score.right}`, "center");
    rightScore.className += " text-red-400 absolute right-0 top-1/2 transform -translate-y-1/2 rotate-90";
    
    // Add minimum height for proper positioning
    scoreContainer.style.minHeight = "120px";
    
    scoreContainer.appendChild(upScore);
    scoreContainer.appendChild(downScore);
    scoreContainer.appendChild(leftScore);
    scoreContainer.appendChild(rightScore);
    
    scoreBoard.appendChild(scoreContainer);
    appDiv.appendChild(scoreBoard);
}

function createCamera(scene: any, canvas: HTMLCanvasElement) {
    // Camera positioned for top-down square view
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 25, 0), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.lockedTarget = new BABYLON.Vector3(0, 0, 0);

    camera.fov = BABYLON.Tools.ToRadians(45);
    camera.minZ = 0.1;
    camera.maxZ = 1000;

    camera.inertia = 0;
    camera.inputs.clear();
}

function createLight(scene: any) {
    // ?This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    light.diffuse = new BABYLON.Color3(1, 1, 1);
    // ?Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;
}

function update3DMeshPos(meshElement: any, xPos: number, yPos: number, zPos: number) {
    meshElement.position = new BABYLON.Vector3(xPos, yPos, zPos);
}

function scaling3DMesh(meshElement: any, xPos: number, yPos: number, zPos: number) {
    meshElement.scaling = new BABYLON.Vector3(xPos, yPos, zPos);
}

function createSkybox(scene: any) {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 1000.0}, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../../public/skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
}

export function renderGame4(matchInfos: any, onGameEnd?: (winner: string) => void) {
    if (appDiv) {
        clearDiv(appDiv);

        // Use the match ID from the passed matchInfos object
        const gameId = matchInfos.id;
        if (!gameId) {
            console.error("No game ID found in match object");
            return;
        }

        // Square canvas for 4-player game
        const canvas = document.createElement("canvas");
        canvas.height = 1080;
        canvas.width = 1080; // Square canvas

        const engine = new BABYLON.Engine(canvas, true);
        const scene = new BABYLON.Scene(engine);

        // Create all game objects first
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture(
            "../../public/textures/pongTable.png",
            scene,
        );

        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
        wallMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

        const ballMaterial = new BABYLON.StandardMaterial("ballMaterial", scene);
        ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

        const paddleMaterial = new BABYLON.StandardMaterial("paddleMaterial", scene);
        paddleMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

        // Square ground for 4-player
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 10}, scene);
        ground.material = groundMaterial;

        const ball = BABYLON.MeshBuilder.CreateSphere(
            "sphere",
            {diameter: 0.35, segments: 16},
            scene,
        );
        ball.material = ballMaterial;
        update3DMeshPos(ball, 0, 0.25, 0);

        // Walls (disabled for 4-player mode as paddles cover the sides)
        const upperWall = BABYLON.MeshBuilder.CreateBox("upperWall", {}, scene);
        upperWall.material = wallMaterial;
        scaling3DMesh(upperWall, 20.25, 0.5, 0.25);
        update3DMeshPos(upperWall, 0, 0, -5);
        upperWall.setEnabled(false); // Disabled as up paddle covers this

        const lowerWall = BABYLON.MeshBuilder.CreateBox("lowerWall", {}, scene);
        lowerWall.material = wallMaterial;
        scaling3DMesh(lowerWall, 20.25, 0.5, 0.25);
        update3DMeshPos(lowerWall, 0, 0, 5);
        lowerWall.setEnabled(false); // Disabled as down paddle covers this

        const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {}, scene);
        leftWall.material = wallMaterial;
        scaling3DMesh(leftWall, 0.25, 0.5, 10);
        update3DMeshPos(leftWall, -10, 0, 0);
        leftWall.setEnabled(false); // Disabled as left paddle covers this

        const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", {}, scene);
        rightWall.material = wallMaterial;
        scaling3DMesh(rightWall, 0.25, 0.5, 10);
        update3DMeshPos(rightWall, 10, 0, 0);
        rightWall.setEnabled(false); // Disabled as right paddle covers this

        // Left paddle (vertical)
        const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", {}, scene);
        leftPaddle.material = paddleMaterial;
        scaling3DMesh(leftPaddle, 0.25, 0.5, 2);
        update3DMeshPos(leftPaddle, -8, 0, 0);

        // Right paddle (vertical)
        const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", {}, scene);
        rightPaddle.material = paddleMaterial;
        scaling3DMesh(rightPaddle, 0.25, 0.5, 2);
        update3DMeshPos(rightPaddle, 8, 0, 0);

        // Up paddle (horizontal)
        const upPaddle = BABYLON.MeshBuilder.CreateBox("upPaddle", {}, scene);
        upPaddle.material = paddleMaterial;
        scaling3DMesh(upPaddle, 2, 0.5, 0.25);
        update3DMeshPos(upPaddle, 0, 0, 4);

        // Down paddle (horizontal)
        const downPaddle = BABYLON.MeshBuilder.CreateBox("downPaddle", {}, scene);
        downPaddle.material = paddleMaterial;
        scaling3DMesh(downPaddle, 2, 0.5, 0.25);
        update3DMeshPos(downPaddle, 0, 0, -4);

        createCamera(scene, canvas);
        createLight(scene);

        // Connect to WebSocket

        const ws = new WebSocket(`ws://${SERVER_BASE}:3003/api/game-engine/${gameId}`);

        // Set up keyboard controls for 4-player
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            // All players use w/s/p/l - server determines which paddle moves based on player position
            if (["w", "s", "p", "l"].includes(key)) {
                ws.send(
                    JSON.stringify({
                        type: "keyPress",
                        key: key,
                    }),
                );
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (["w", "s", "p", "l"].includes(key)) {
                ws.send(
                    JSON.stringify({
                        type: "keyRelease",
                        key: key,
                    }),
                );
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
            // console.log('Received game state:', message);

            if (message.error) {
                console.error("Game engine error:", message.error);
                return;
            }

            if (message.type === "gameState") {
                const gameState = message.data;

                // Update ball position
                if (ball && gameState.ball) {
                    update3DMeshPos(ball, gameState.ball.x, 0.25, gameState.ball.y);
                }

                // Update all paddles position
                if (leftPaddle && gameState.paddles && gameState.paddles.left) {
                    update3DMeshPos(
                        leftPaddle,
                        gameState.paddles.left.x,
                        0,
                        gameState.paddles.left.y,
                    );
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
                    update3DMeshPos(
                        upPaddle,
                        gameState.paddles.up.x,
                        0,
                        gameState.paddles.up.y,
                    );
                }
                if (downPaddle && gameState.paddles && gameState.paddles.down) {
                    update3DMeshPos(
                        downPaddle,
                        gameState.paddles.down.x,
                        0,
                        gameState.paddles.down.y,
                    );
                }

                // Update score
                if (gameState.score) {
                    updateScore(gameState);
                    displayScore(matchInfos, appDiv, gameState);
                    
                    // Check for game end (first to reach -3 loses, or last player standing)
                    const scores = [gameState.score.left, gameState.score.right, gameState.score.up, gameState.score.down];
                    const playersWithPositiveScore = scores.filter(score => score >= 0);
                    
                    if (playersWithPositiveScore.length === 1 || scores.some(score => score <= -100)) {
                        // Find winner (highest score or last standing)
                        const maxScore = Math.max(...scores);
                        let winnerIndex = scores.findIndex(score => score === maxScore);
                        
                        const playerNames = [
                            matchInfos.players[0]?.alias || 'Player 1',
                            matchInfos.players[1]?.alias || 'Player 2', 
                            matchInfos.players[2]?.alias || 'Player 3',
                            matchInfos.players[3]?.alias || 'Player 4'
                        ];
                        
                        const winner = playerNames[winnerIndex];
                        gameEnded = true;
                        ws.close();
                        document.removeEventListener("keydown", handleKeyDown);
                        document.removeEventListener("keyup", handleKeyUp);
                        
                        // Call the onGameEnd callback if provided
                        if (onGameEnd) {
                            onGameEnd(winner);
                        } else {
                            // Default behavior for non-tournament games
                            endGameView(winner, appDiv);
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

        const render = () => scene.render();
        engine.runRenderLoop(render);

        const onResize = () => engine.resize();
        window.addEventListener("resize", onResize);

        appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));
        appDiv.appendChild(canvas);
        
        // Display controls info for 4-player mode
        const controlsInfo = createBoxDiv("controlsInfo");
        controlsInfo.innerHTML = `
            <div class="text-center text-sm text-gray-300 mt-4 p-4">
                <p><strong>4-Player Pong Controls:</strong> W/S or P/L to move your paddle</p>
                <p><strong>Goal:</strong> Be the last player standing! You lose points when the ball goes through your side.</p>
                <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div class="text-blue-400">Left Player: P/L</div>
                    <div class="text-red-400">Right Player: W/S</div>
                    <div class="text-yellow-400">Top Player: P/L</div>
                    <div class="text-green-400">Bottom Player: W/S</div>
                </div>
            </div>
        `;
        appDiv.appendChild(controlsInfo);
    }
}
