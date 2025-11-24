declare const BABYLON: any;
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
const eyeTexture = "../../public/textures/eye.png";
const flareTexture = "../../public/textures/flare.png";
const backgroundHeightMap = "../../public/heightmap/height.png";
const backgroundTexture = "../../public/heightmap/texture.png";


function displayScore(matchInfos: any, appDiv: HTMLElement, GameState: any) {
    let scoreBoard = document.getElementById("scoreBoard");
    const player1Name = matchInfos.players[0].alias;
    const player2Name = matchInfos.players[1].alias;
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
    ball: any,
    leftPaddle: any,
    rightPaddle: any,
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
                displayScore(matchInfos, appDiv, gameState);

                if (gameState.score.left >= 100 || gameState.score.right >= 100) {
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

function createCamera(scene: any, canvas: HTMLCanvasElement) {
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 30, 35), scene);
    const target = BABYLON.Vector3.Zero();
    camera.setTarget(target);
    camera.lockedTarget = target;
    camera.fov = BABYLON.Tools.ToRadians(55);
    camera.minZ = 0.1;
    camera.maxZ = 1000;
    camera.inertia = 0;
    camera.inputs.clear();

        // Camera
    //const camera = new BABYLON.ArcRotateCamera(
    //    "camera",
    //    Math.PI / 2,
    //    Math.PI / 3,
    //    10,
    //    new BABYLON.Vector3(0, 1.5, 0),
    //    scene
    //);
    //camera.attachControl(canvas, true);
}

function createLight(scene: any) {
    // Lumière principale : au-dessus du centre de la scène
    const mainLight = new BABYLON.DirectionalLight(
        "mainLight",
        new BABYLON.Vector3(0, -1, 0),
        scene
    );
    mainLight.position = new BABYLON.Vector3(0, 50, 0);
    mainLight.intensity = 1.2;
    mainLight.diffuse = new BABYLON.Color3(1, 0.95, 0.9);
    mainLight.specular = new BABYLON.Color3(1, 0.8, 0.6);

    // Génération d’ombres pour les tours et les murs
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, mainLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.darkness = 0.4;

    // Lumière secondaire : ambiance générale (simule la lueur du Mordor)
    const ambient = new BABYLON.HemisphericLight(
        "ambientLight",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    ambient.intensity = 0.6;
    ambient.diffuse = new BABYLON.Color3(1, 0.6, 0.4); // lueur rouge/orange
    ambient.groundColor = new BABYLON.Color3(0.2, 0.05, 0.05);

    // Lumière d’appoint pour la tour de Sauron (halo rougeoyant)
    const eyeLight = new BABYLON.PointLight("eyeLight", new BABYLON.Vector3(-40, 30, -40), scene);
    eyeLight.diffuse = new BABYLON.Color3(1, 0.2, 0);
    eyeLight.specular = new BABYLON.Color3(1, 0.1, 0.1);
    eyeLight.intensity = 1.5;
    eyeLight.range = 80;
}

function update3DMeshPos(meshElement: any, xPos: number, yPos: number, zPos: number) {
    meshElement.position = new BABYLON.Vector3(xPos, yPos, zPos);
}

function scaling3DMesh(meshElement: any, xPos: number, yPos: number, zPos: number) {
    meshElement.scaling = new BABYLON.Vector3(xPos, yPos, zPos);
}

function createTorch(scene : any) {
    const towerRoot = new BABYLON.TransformNode("towerRoot", scene);

    const towerMat = new BABYLON.StandardMaterial("towerMat", scene);
    towerMat.diffuseColor = new BABYLON.Color3(0, 0, 0);

    const spikeMat = new BABYLON.StandardMaterial("spikeMat", scene);
    spikeMat.diffuseColor = new BABYLON.Color3(0.42, 0.42, 0.42);

    const cone = BABYLON.MeshBuilder.CreateCylinder("cone2", {
        diameterTop: 0.5,
        diameterBottom: 0,
        height: 1,
        tessellation: 32
    }, scene);
    cone.position = new BABYLON.Vector3(0, 1.5, 0);
    cone.material = towerMat;
    cone.parent = towerRoot;

    var cylinderFloor = BABYLON.MeshBuilder.CreateCylinder("cylinderFloor", { diameter: 0.3, height: 2 }, scene);
    cylinderFloor.material = towerMat;
    cylinderFloor.position.y = 1;
    cylinderFloor.parent = towerRoot;

    for (let i = 0; i < 10; i++) {
        const spikeHigh = BABYLON.MeshBuilder.CreateBox("spikeHigh" + i, {
            height: 0.25,
            width: 0.04,
            depth: 0.04
        }, scene);

        const angle = (i / 10) * Math.PI * 2;
        const radius = 0.25;

        spikeHigh.position = new BABYLON.Vector3(
            Math.cos(angle) * radius,
            2,
            Math.sin(angle) * radius
        );

        spikeHigh.lookAt(new BABYLON.Vector3(0, 2, 0));
        spikeHigh.material = spikeMat;
        spikeHigh.parent = towerRoot;
    }

    const flameAnchor = new BABYLON.TransformNode("flameAnchor", scene);
    flameAnchor.position = new BABYLON.Vector3(0, 2.1, 0); // au-dessus du cône
    flameAnchor.parent = towerRoot

    const flameSystem = new BABYLON.ParticleSystem("flameParticles", 2000, scene);

    flameSystem.particleTexture = new BABYLON.Texture(flareTexture, scene);

    flameSystem.emitter = flameAnchor; // suit la tour automatiquement

    flameSystem.color1 = new BABYLON.Color4(1, 0.6, 0.1, 1.0);
    flameSystem.color2 = new BABYLON.Color4(1, 0.2, 0, 1.0);
    flameSystem.colorDead = new BABYLON.Color4(0.2, 0, 0, 0.0);

    flameSystem.minSize = 0.05;
    flameSystem.maxSize = 0.15;

    flameSystem.minLifeTime = 0.3;
    flameSystem.maxLifeTime = 0.6;

    flameSystem.direction1 = new BABYLON.Vector3(-0.2, 1, -0.2);
    flameSystem.direction2 = new BABYLON.Vector3(0.2, 1, 0.2);

    flameSystem.minEmitPower = 0.5;
    flameSystem.maxEmitPower = 1.5;

    flameSystem.emitRate = 400;

    flameSystem.gravity = new BABYLON.Vector3(0, 0.1, 0);

    flameSystem.minEmitBox = new BABYLON.Vector3(-0.05, 0, -0.05);
    flameSystem.maxEmitBox = new BABYLON.Vector3(0.05, 0, 0.05);

    flameSystem.updateSpeed = 0.01;
    flameSystem.addSizeGradient(0, 0.5);
    flameSystem.addSizeGradient(1, 0);

    flameSystem.start();

    return towerRoot;
}

function createBaradDur(scene :any) {

    const towerRoot = new BABYLON.TransformNode("towerRoot", scene);

    const eyeMat = new BABYLON.StandardMaterial("eyeMat", scene);
    eyeMat.diffuseColor = new BABYLON.Color3(1, 0.2, 0);
    eyeMat.emissiveColor = new BABYLON.Color3(1, 0.15, 0);

    const towerMat = new BABYLON.StandardMaterial("towerMat", scene);
    towerMat.diffuseColor = new BABYLON.Color3(0, 0, 0);

    const spikeMat = new BABYLON.StandardMaterial("spikeMat", scene);
    spikeMat.diffuseColor = new BABYLON.Color3(0.42, 0.42, 0.42);

    const sauronEye = BABYLON.MeshBuilder.CreateSphere("sauronEye", {
        diameter: 0.10,
        segments: 32
    }, scene);
    sauronEye.position = new BABYLON.Vector3(0, 2.8, 0);
    sauronEye.scaling = new BABYLON.Vector3(1.6, 0.8, 1);
    sauronEye.material = eyeMat;
    sauronEye.parent = towerRoot;

    scene.registerBeforeRender(() => {
        const t = performance.now() * 0.003;
        sauronEye.scaling.y = 0.8 + Math.sin(t) * 0.2;
    });

    const leftHorn = BABYLON.MeshBuilder.CreateBox("leftHorn", { width: 0.03, height: 0.2, depth: 0.15 }, scene);
    leftHorn.position = new BABYLON.Vector3(-0.09, 2.75, 0);
    leftHorn.material = towerMat;
    leftHorn.parent = towerRoot;

    const rightHorn = BABYLON.MeshBuilder.CreateBox("rightHorn", { width: 0.03, height: 0.2, depth: 0.15 }, scene);
    rightHorn.position = new BABYLON.Vector3(0.09, 2.75, 0);
    rightHorn.material = towerMat;
    rightHorn.parent = towerRoot;

    const coneBalcony = BABYLON.MeshBuilder.CreateCylinder("cone", {
        diameterTop: 0,
        diameterBottom: 0.25,
        height: 0.5,
        tessellation: 32
    }, scene);
    coneBalcony.position = new BABYLON.Vector3(0, 2.4, 0);
    coneBalcony.material = towerMat;
    coneBalcony.parent = towerRoot;

    const cone = BABYLON.MeshBuilder.CreateCylinder("cone2", {
        diameterTop: 0.3,
        diameterBottom: 0,
        height: 0.5,
        tessellation: 32
    }, scene);
    cone.position = new BABYLON.Vector3(0, 2.4, 0);
    cone.material = towerMat;
    cone.parent = towerRoot;

    var cylinderFloor = BABYLON.MeshBuilder.CreateCylinder("cylinderFloor", { diameter: 1, height: 0.5 }, scene);
    cylinderFloor.material = towerMat;
    cylinderFloor.position.y = 0.3;
    cylinderFloor.parent = towerRoot;

    var cylinderMiddleGround = BABYLON.MeshBuilder.CreateCylinder("cylinderMiddleGround", { diameter: 0.8, height: 0.5 }, scene);
    cylinderMiddleGround.material = towerMat;
    cylinderMiddleGround.position.y = 0.6;
    cylinderMiddleGround.parent = towerRoot;

    var cylinderMiddle = BABYLON.MeshBuilder.CreateCylinder("cylinderMiddle", { diameter: 0.5, height: 0.5 }, scene);
    cylinderMiddle.material = towerMat;
    cylinderMiddle.position.y = 0.9;
    cylinderMiddle.parent = towerRoot;

    var cylinderMiddleHigh = BABYLON.MeshBuilder.CreateCylinder("cylinderMiddleHigh", { diameter: 0.2, height: 2 }, scene);
    cylinderMiddleHigh.material = towerMat;
    cylinderMiddleHigh.position.y = 1.5;
    cylinderMiddleHigh.parent = towerRoot;


    for (let i = 0; i < 10; i++) {
        const spikeHigh = BABYLON.MeshBuilder.CreateBox("spikeHigh" + i, {
            height: 0.25,
            width: 0.04,
            depth: 0.04
        }, scene);

        const angle = (i / 10) * Math.PI * 2;
        const radius = 0.25;

        spikeHigh.position = new BABYLON.Vector3(
            Math.cos(angle) * radius,
            1.1,
            Math.sin(angle) * radius
        );

        spikeHigh.lookAt(new BABYLON.Vector3(0, 1.1, 0));
        spikeHigh.material = spikeMat;
        spikeHigh.parent = towerRoot;
    }

    for (let i = 0; i < 10; i++) {
        const spikeMiddle = BABYLON.MeshBuilder.CreateBox("spikeMiddle" + i, {
            height: 0.25,
            width: 0.04,
            depth: 0.04
        }, scene);

        const angle = (i / 10) * Math.PI * 2;
        const radius = 0.4;

        spikeMiddle.position = new BABYLON.Vector3(
            Math.cos(angle) * radius,
            0.8,
            Math.sin(angle) * radius
        );

        spikeMiddle.lookAt(new BABYLON.Vector3(0, 0.8, 0));
        spikeMiddle.material = spikeMat;
        spikeMiddle.parent = towerRoot;
    }

    for (let i = 0; i < 10; i++) {
        const spikeBottom = BABYLON.MeshBuilder.CreateBox("spikeBottom" + i, {
            height: 0.25,
            width: 0.04,
            depth: 0.04
        }, scene);

        const angle = (i / 10) * Math.PI * 2;
        const radius = 0.5;

        spikeBottom.position = new BABYLON.Vector3(
            Math.cos(angle) * radius,
            0.5,
            Math.sin(angle) * radius
        );

        spikeBottom.lookAt(new BABYLON.Vector3(0, 0.5, 0));
        spikeBottom.material = spikeMat;
        spikeBottom.parent = towerRoot;
    }

    const gl = new BABYLON.GlowLayer("glow", scene);
    gl.intensity = 0.65;

    return towerRoot;
}


function gotMatchInfos(matchInfos: any): boolean {
    return matchInfos?.id ? true : false;
}

function updateVisionConePos(scene: any, ball: any, cone: any) {
    const sauronEye = scene.getMeshByName("sauronEye");
    const eyePos = sauronEye.getAbsolutePosition();
    cone.position.copyFrom(eyePos);

    const ballPos = ball.getAbsolutePosition();
    cone.lookAt(ballPos);

    const dist = BABYLON.Vector3.Distance(eyePos, ballPos);
    const baseLength = cone.metadata?.baseLength ?? 10;
    cone.scaling.z = dist / baseLength;
}

function createVisionCone(scene: any) {

    const coneMat = new BABYLON.StandardMaterial("coneMat", scene);
    coneMat.emissiveColor = new BABYLON.Color3(1, 0.4, 0);
    coneMat.alpha = 0.35;

    const height = 10;

    const cone = BABYLON.MeshBuilder.CreateCylinder("visionCone", {
        diameterTop: 0,
        diameterBottom: 0.5,
        height: height,
        tessellation: 32,
    }, scene);
    cone.material = coneMat;

    cone.position.y = -height / 2;
    cone.bakeCurrentTransformIntoVertices();

    cone.position.set(0, 0, 0);
    cone.rotation.set(0, 0, 0);
    cone.scaling.set(1, 1, 1);
    cone.computeWorldMatrix(true);

    cone.setPivotPoint(new BABYLON.Vector3.Zero());

    cone.rotation.x = -Math.PI / 2;
    cone.bakeCurrentTransformIntoVertices();
    cone.rotation.set(0, 0, 0);
    cone.computeWorldMatrix(true);

    return cone;
}

function createBackgroundScene() {
    const largeGroundMat = new BABYLON.StandardMaterial("largeGroundMat");
    largeGroundMat.diffuseTexture = new BABYLON.Texture(backgroundTexture);

    const largeGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", backgroundHeightMap,
        {width:150, height:150, subdivisions: 10, minHeight:0, maxHeight: 100});
    largeGround.material = largeGroundMat;
    largeGround.position.y = -20;
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

    const ball = BABYLON.MeshBuilder.CreateCylinder("ball", {
        diameter: 0.5,
        height: 0.01,
    }, scene);
    ball.material = ballMaterial;
    update3DMeshPos(ball, 0, 0.25, 0);
    ball.parent = pongRoot;

    const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", {}, scene);
    leftPaddle.material = paddleMaterial;
    scaling3DMesh(leftPaddle, 0.25, 0.5, 2);
    update3DMeshPos(leftPaddle, -8, 0, 0);
    leftPaddle.parent = pongRoot;

    const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", {}, scene);
    rightPaddle.material = paddleMaterial;
    scaling3DMesh(rightPaddle, 0.25, 0.5, 2);
    update3DMeshPos(rightPaddle, 8, 0, 0);
    rightPaddle.parent = pongRoot;

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

    createCamera(scene, canvas);
    createLight(scene);

    return {engine, scene, ball, leftPaddle, rightPaddle, visionCone};
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

    const {engine, scene, ball, leftPaddle, rightPaddle, visionCone} = setupScene(canvas);

    setupWebSocket(matchInfos, ball, leftPaddle, rightPaddle, onGameEnd);
    engine.runRenderLoop(() => {
    updateVisionConePos(scene, ball, visionCone);
    scene.render();
});
    window.addEventListener("resize", () => engine.resize());
}
