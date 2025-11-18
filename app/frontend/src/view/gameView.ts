declare const BABYLON: any; // Global BABYLON from CDN
import { SERVER_BASE } from "./utils.js";

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

const appDiv = document.getElementById("app");

function updateScore(GameState : any) {
    if(GameState.ball.x == -10)
        GameState.score.left++;
    if(GameState.ball.x == 10)
        GameState.score.right++;
}

function displayScore(GameState : any) {

}

function createCamera(scene: any, canvas: HTMLCanvasElement) {
    const camera = new BABYLON.FreeCamera(
        "camera1",
        new BABYLON.Vector3(0, 18, 8),
        scene,
    );

    const target = BABYLON.Vector3.Zero();
    camera.setTarget(target);
    camera.lockedTarget = target;

    camera.fov = BABYLON.Tools.ToRadians(55);
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
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size : 1000.0,}, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../../public/skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
}

export function renderGame() {
    if (appDiv) {
        clearDiv(appDiv);

        // Get the game ID from session storage
        const gameId = sessionStorage.getItem('currentGameId');
        if (!gameId) {
            console.error('No game ID found');
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.height = 1080;
        canvas.width = 1920;

        const engine = new BABYLON.Engine(canvas, true);
        const scene = new BABYLON.Scene(engine);

        // Create all game objects first
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("../../public/textures/pongTable.png", scene);

        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
        wallMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

        const ballMaterial = new BABYLON.StandardMaterial("ballMaterial", scene);
        ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

        const paddleMaterial = new BABYLON.StandardMaterial("paddleMaterial", scene);
        paddleMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 10}, scene);
        ground.material = groundMaterial;

        const ball = BABYLON.MeshBuilder.CreateSphere(
            "sphere",
            {diameter: 0.35, segments: 16},  // Reduced segments for better performance
            scene,
        );
        ball.material = ballMaterial;
        update3DMeshPos(ball, 0, 0.25, 0);

        const upperWall = BABYLON.MeshBuilder.CreateBox("upperWall", {}, scene);
        upperWall.material = wallMaterial;
        scaling3DMesh(upperWall, 20.25, 0.5, 0.25);
        update3DMeshPos(upperWall, 0, 0, -5);

        const lowerWall = BABYLON.MeshBuilder.CreateBox("lowerWall", {}, scene);
        lowerWall.material = wallMaterial;
        scaling3DMesh(lowerWall, 20.25, 0.5, 0.25);
        update3DMeshPos(lowerWall, 0, 0, 5);

        const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {}, scene);
        leftWall.material = wallMaterial;
        scaling3DMesh(leftWall, 0.25, 0.5, 10);
        update3DMeshPos(leftWall, -10, 0, 0);  // Flip X coordinate

        const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", {}, scene);
        rightWall.material = wallMaterial;
        scaling3DMesh(rightWall, 0.25, 0.5, 10);
        update3DMeshPos(rightWall, 10, 0, 0);   // Flip X coordinate

        const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", {}, scene);
        leftPaddle.material = paddleMaterial;
        scaling3DMesh(leftPaddle, 0.25, 0.5, 2);  // Using exact game dimensions
        update3DMeshPos(leftPaddle, -8, 0, 0);

        const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", {}, scene);
        rightPaddle.material = paddleMaterial;
        scaling3DMesh(rightPaddle, 0.25, 0.5, 2);  // Using exact game dimensions
        update3DMeshPos(rightPaddle, 8, 0, 0);

        createCamera(scene, canvas);
        createLight(scene);

        // Connect to WebSocket
        const ws = new WebSocket(`ws://${SERVER_BASE}:3003/api/game-engine/${gameId}`);
        
        // Set up keyboard controls
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (['w', 's', 'p', 'l'].includes(key)) {
                ws.send(JSON.stringify({
                    type: 'keyPress',
                    key: key
                }));
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (['w', 's', 'p', 'l'].includes(key)) {
                ws.send(JSON.stringify({
                    type: 'keyRelease',
                    key: key
                }));
            }
        };

        ws.onopen = () => {
            console.log('Connected to game engine');
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            // console.log('Received game state:', message);

            if (message.error) {
                console.error('Game engine error:', message.error);
                return;
            }

            if (message.type === 'gameState') {
                const gameState = message.data;
                // console.log('Game state data:', gameState);

                // Update ball position
                if (ball && gameState.ball) {
                    // Flip X coordinate to match camera view
                    update3DMeshPos(ball, -gameState.ball.x, 0.25, gameState.ball.y);
                }

                // Update paddles position
                if (leftPaddle && gameState.paddles && gameState.paddles.left) {
                    // Flip X coordinate to match camera view
                    update3DMeshPos(leftPaddle, -gameState.paddles.left.x, 0, gameState.paddles.left.y);
                }
                if (rightPaddle && gameState.paddles && gameState.paddles.right) {
                    // Flip X coordinate to match camera view
                    update3DMeshPos(rightPaddle, -gameState.paddles.right.x, 0, gameState.paddles.right.y);
                }

                // Update score if you have score elements
                if (gameState.score) {
                    updateScore(gameState);
                    displayScore(gameState);
                    // console.log('Score:', gameState.score);
                }
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from game engine');
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };

        const render = () => scene.render();
        engine.runRenderLoop(render);

        const onResize = () => engine.resize();
        window.addEventListener("resize", onResize);

        // appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));
        appDiv.appendChild(canvas);
    }
}
