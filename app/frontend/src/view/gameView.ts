import {
    Engine,
    Scene,
    Vector3,
    HemisphericLight,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Texture,
    CubeTexture,
    Tools,
    FreeCamera,
    Mesh,
} from "@babylonjs/core";

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
    createCanvas,
} from "./utils.js";

import {endGameView} from "./endGameView.js";

const appDiv = document.getElementById("app");
const groundTexture = "../../public/textures/pongTable.png";

function updateScore(GameState: any) {
    if (GameState.ball.x == -10) GameState.score.left++;
    if (GameState.ball.x == 10) GameState.score.right++;
}

function displayScore(matchInfos: any, appDiv: HTMLElement, GameState: any) {
    let scoreBoard = document.getElementById("scoreBoard");
    const player1Name = matchInfos.players[0].alias;
    const player2Name = matchInfos.players[2].alias;
    let player1Score = GameState.score.left;
    let player2Score = GameState.score.right;
    let scoreDisplay = `${player1Name}: ${player1Score} - ${player2Score} :${player2Name}`;

    if (!scoreBoard) {
        scoreBoard = createBoxDiv("scoreBoard");
        scoreBoard.appendChild(createSubheadingText(scoreDisplay, "center"));
        appDiv.appendChild(scoreBoard);
    }
    scoreBoard.innerHTML = "";
    scoreBoard.appendChild(createSubheadingText(scoreDisplay, "center"));
    appDiv.appendChild(scoreBoard);
}

function setupWebSocket(
    matchInfos: any,
    ball: Mesh,
    leftPaddle: Mesh,
    rightPaddle: Mesh,
    onGameEnd?: (winner: string) => void,
) {
    const ws = new WebSocket(`ws://${SERVER_BASE}:3003/api/game-engine/${matchInfos.id}`);

    const handleKeyDown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (["w", "s", "p", "l"].includes(key)) {
            ws.send(JSON.stringify({type: "keyPress", key}));
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (["w", "s", "p", "l"].includes(key)) {
            ws.send(JSON.stringify({type: "keyRelease", key}));
        }
    };

    ws.onopen = () => {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
    };

    let gameEnded = false;

    ws.onmessage = (event) => {
        if (gameEnded) return;
        const message = JSON.parse(event.data);

        if (message.type === "gameState") {
            const gameState = message.data;

            update3DMeshPos(ball, -gameState.ball.x, 0.25, gameState.ball.y);

            update3DMeshPos(leftPaddle, -gameState.paddles.left.x, 0, gameState.paddles.left.y);

            update3DMeshPos(rightPaddle, -gameState.paddles.right.x, 0, gameState.paddles.right.y);

            if (gameState.score && appDiv) {
                updateScore(gameState);
                displayScore(matchInfos, appDiv, gameState);

                if (gameState.score.left >= 3 || gameState.score.right >= 3) {
                    const winner =
                        gameState.score.left >= 3
                            ? matchInfos.players[0].alias
                            : matchInfos.players[1].alias;

                    gameEnded = true;
                    ws.close();
                    document.removeEventListener("keydown", handleKeyDown);
                    document.removeEventListener("keyup", handleKeyUp);

                    if (onGameEnd) onGameEnd(winner);
                    else endGameView(winner);
                }
            }
        }
    };

    ws.onclose = () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
    };
}

function createCamera(scene: Scene) {
    const camera = new FreeCamera("camera1", new Vector3(0, 18, 8), scene);
    const target = Vector3.Zero();
    camera.setTarget(target);
    camera.lockedTarget = target;
    camera.fov = Tools.ToRadians(55);
    camera.minZ = 0.1;
    camera.maxZ = 1000;
    camera.inertia = 0;
    camera.inputs.clear();
}

function createLight(scene: Scene) {
    var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.diffuse = new Color3(1, 1, 1);
    light.intensity = 0.7;
}

function update3DMeshPos(meshElement: Mesh, xPos: number, yPos: number, zPos: number) {
    meshElement.position = new Vector3(xPos, yPos, zPos);
}

function scaling3DMesh(meshElement: Mesh, xPos: number, yPos: number, zPos: number) {
    meshElement.scaling = new Vector3(xPos, yPos, zPos);
}

function createSkybox(scene: Scene) {
    const skybox = MeshBuilder.CreateBox("skyBox", {size: 1000.0}, scene);
    const skyboxMaterial = new StandardMaterial("skybox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new CubeTexture("../../public/skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
}

function gotMatchInfos(matchInfos: any): boolean {
    return matchInfos?.id ? true : false;
}

function setupScene(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new Texture(groundTexture, scene);

    const wallMaterial = new StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = new Color3(0, 0, 0);

    const ballMaterial = new StandardMaterial("ballMaterial", scene);
    ballMaterial.diffuseColor = new Color3(1, 1, 1);

    const paddleMaterial = new StandardMaterial("paddleMaterial", scene);
    paddleMaterial.diffuseColor = new Color3(1, 1, 1);

    const ground = MeshBuilder.CreateGround("ground", {width: 20, height: 10}, scene);
    ground.material = groundMaterial;

    const ball = MeshBuilder.CreateSphere("sphere", {diameter: 0.35}, scene);
    ball.material = ballMaterial;
    update3DMeshPos(ball, 0, 0.25, 0);

    const leftPaddle = MeshBuilder.CreateBox("leftPaddle", {}, scene);
    leftPaddle.material = paddleMaterial;
    scaling3DMesh(leftPaddle, 0.25, 0.5, 2);
    update3DMeshPos(leftPaddle, -8, 0, 0);

    const rightPaddle = MeshBuilder.CreateBox("rightPaddle", {}, scene);
    rightPaddle.material = paddleMaterial;
    scaling3DMesh(rightPaddle, 0.25, 0.5, 2);
    update3DMeshPos(rightPaddle, 8, 0, 0);

    createCamera(scene);
    createLight(scene);

    return {engine, scene, ball, leftPaddle, rightPaddle};
}

export function renderGame(matchInfos: any, onGameEnd?: (winner: string) => void) {
    if (!appDiv) return;
    clearDiv(appDiv);

    if (!gotMatchInfos(matchInfos)) {
        console.error("Invalid match object");
        return;
    }

    const canvas = createCanvas();
    appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));
    appDiv.appendChild(canvas);

    const {engine, scene, ball, leftPaddle, rightPaddle} = setupScene(canvas);

    setupWebSocket(matchInfos, ball, leftPaddle, rightPaddle, onGameEnd);

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
}
