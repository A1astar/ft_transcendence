declare const BABYLON: any;
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
    SERVER_BASE,
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
    createBackgroundScene,
    createScoreBox,
    displayScore2,
    createVisionCone,
    updateVisionConePos,
} from "./gameViewUtils.js";

import {endGameView} from "./endGameView.js";

const appDiv = document.getElementById("app");
const groundTexture = "../../public/textures/pongTable.png";
const eyeTexture = "../../public/textures/eye.png";

function setupWebSocket(
    matchInfos: any,
    ball: any,
    leftPaddle: any,
    rightPaddle: any,
    scoreText: any,
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
                displayScore2(matchInfos, appDiv, gameState, scoreText);

                if (gameState.score.left >= 5 || gameState.score.right >= 5) {
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

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 10}, scene);
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

    const leftP = createPaddle(scene);
    leftP.parent = pongRoot;

    const rightP = createPaddle(scene);
    rightP.parent = pongRoot;

    const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {}, scene);
    leftWall.material = wallMaterial;
    scaling3DMesh(leftWall, 0.2, 0.5, 10);
    update3DMeshPos(leftWall, -10, 0, 0);
    leftWall.parent = pongRoot;

    const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", {}, scene);
    rightWall.material = wallMaterial;
    scaling3DMesh(rightWall, 0.2, 0.5, 10);
    update3DMeshPos(rightWall, 10, 0, 0);
    rightWall.parent = pongRoot;

    const upperWall = BABYLON.MeshBuilder.CreateBox("upperWall", {}, scene);
    upperWall.material = wallMaterial;
    scaling3DMesh(upperWall, 20.2, 0.5, 0.2);
    update3DMeshPos(upperWall, 0, 0, -5);
    upperWall.parent = pongRoot;

    const lowerWall = BABYLON.MeshBuilder.CreateBox("lowerWall", {}, scene);
    lowerWall.material = wallMaterial;
    scaling3DMesh(lowerWall, 20.2, 0.5, 0.2);
    update3DMeshPos(lowerWall, 0, 0, 5);
    lowerWall.parent = pongRoot;

    const topleftTorch = createTorch(scene);
    update3DMeshPos(topleftTorch, 10, 0, -5);
    topleftTorch.parent = pongRoot;

    const topRightTorch = createTorch(scene);
    update3DMeshPos(topRightTorch, -10, 0, -5);
    topRightTorch.parent = pongRoot;

    const bottomleftTorch = createTorch(scene);
    update3DMeshPos(bottomleftTorch, 10, 0, 5);
    bottomleftTorch.parent = pongRoot;

    const bottomRightTorch = createTorch(scene);
    update3DMeshPos(bottomRightTorch, -10, 0, 5);
    bottomRightTorch.parent = pongRoot;

    scaling3DMesh(pongRoot, 2, 2, 2);

    const tower = createBaradDur(scene);
    scaling3DMesh(tower, 5, 5, 5);
    update3DMeshPos(tower, -20, 0, -20);

    const visionCone = createVisionCone(scene);
    updateVisionConePos(scene, ball, visionCone);

    const scoreText = createScoreBox(scene);
    createCamera(scene, canvas);
    createLight(scene);

    return {engine, scene, ball, leftP, rightP, visionCone, scoreText};
}

export function renderGame(matchInfos: any, onGameEnd?: (winner: string) => void) {
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

    let {engine, scene, ball, leftP, rightP, visionCone, scoreText} = setupScene(canvas);
    setupWebSocket(matchInfos, ball, leftP, rightP, scoreText, onGameEnd);

    engine.runRenderLoop(() => {
        updateVisionConePos(scene, ball, visionCone);
        scene.render();
    });
    window.addEventListener("resize", () => engine.resize());
}
