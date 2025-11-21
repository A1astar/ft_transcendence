import * as BABYLON from "babylonjs";
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
    createCanvas
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
    ball: BABYLON.Mesh,
    leftPaddle: BABYLON.Mesh,
    rightPaddle: BABYLON.Mesh,
    onGameEnd?: (winner: string) => void)
{
const ws = new WebSocket(`ws://${SERVER_BASE}:3003/api/game-engine/${matchInfos.id}`);

    const handleKeyDown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (["w", "s", "p", "l"].includes(key)) {
            ws.send(JSON.stringify({ type: "keyPress", key }));
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (["w", "s", "p", "l"].includes(key)) {
            ws.send(JSON.stringify({ type: "keyRelease", key }));
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

            update3DMeshPos(
                leftPaddle,
                -gameState.paddles.left.x,
                0,
                gameState.paddles.left.y
            );

            update3DMeshPos(
                rightPaddle,
                -gameState.paddles.right.x,
                0,
                gameState.paddles.right.y
            );

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

function createCamera(scene: BABYLON.Scene) {
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 18, 8), scene);
    const target = BABYLON.Vector3.Zero();
    camera.setTarget(target);
    camera.lockedTarget = target;
    camera.fov = BABYLON.Tools.ToRadians(55);
    camera.minZ = 0.1;
    camera.maxZ = 1000;
    camera.inertia = 0;
    camera.inputs.clear();
}

function createLight(scene: BABYLON.Scene) {
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.intensity = 0.7;
}

function update3DMeshPos(meshElement: any, xPos: number, yPos: number, zPos: number) {
    meshElement.position = new BABYLON.Vector3(xPos, yPos, zPos);
}

function scaling3DMesh(meshElement: any, xPos: number, yPos: number, zPos: number) {
    meshElement.scaling = new BABYLON.Vector3(xPos, yPos, zPos);
}

function createSkybox(scene: BABYLON.Scene) {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 1000.0}, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../../public/skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
}

function gotMatchInfos(matchInfos : any) : boolean {
    return (matchInfos?.id)? true : false;
}

function setupScene(canvas : HTMLCanvasElement){
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture(groundTexture, scene);

    const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

    const ballMaterial = new BABYLON.StandardMaterial("ballMaterial", scene);
    ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

    const paddleMaterial = new BABYLON.StandardMaterial("paddleMaterial", scene);
    paddleMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 10 }, scene);
    ground.material = groundMaterial;

    const ball = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 0.35 }, scene);
    ball.material = ballMaterial;
    update3DMeshPos(ball, 0, 0.25, 0);

    const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", {}, scene);
    leftPaddle.material = paddleMaterial;
    scaling3DMesh(leftPaddle, 0.25, 0.5, 2);
    update3DMeshPos(leftPaddle, -8, 0, 0);

    const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", {}, scene);
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

    const { engine, scene, ball, leftPaddle, rightPaddle } = setupScene(canvas);

    setupWebSocket(matchInfos, ball, leftPaddle, rightPaddle, onGameEnd);

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
}
