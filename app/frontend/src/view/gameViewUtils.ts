declare const BABYLON: any;
import {SERVER_BASE} from "./utils.js";

const flareTexture = "../../public/textures/flare.png";
const backgroundHeightMap = "../../public/heightmap/height.png";
const backgroundTexture = "../../public/heightmap/texture.png";
const appDiv = document.getElementById("app");

export function gotMatchInfos(matchInfos: any): boolean {
    return matchInfos?.id ? true : false;
}

export function createCamera(scene: any, canvas: HTMLCanvasElement) {
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 30, 35), scene);
    const target = BABYLON.Vector3.Zero();
    camera.setTarget(target);
    camera.lockedTarget = target;
    camera.fov = BABYLON.Tools.ToRadians(55);
    camera.minZ = 0.1;
    camera.maxZ = 1000;
    camera.inertia = 0;
    camera.inputs.clear();
}

export function createLight(scene: any) {
    const mainLight = new BABYLON.DirectionalLight(
        "mainLight",
        new BABYLON.Vector3(0, -1, 0),
        scene,
    );
    mainLight.position = new BABYLON.Vector3(0, 50, 0);
    mainLight.intensity = 1.2;
    mainLight.diffuse = new BABYLON.Color3(1, 0.95, 0.9);
    mainLight.specular = new BABYLON.Color3(1, 0.8, 0.6);

    const shadowGenerator = new BABYLON.ShadowGenerator(2048, mainLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.darkness = 0.4;

    const ambient = new BABYLON.HemisphericLight(
        "ambientLight",
        new BABYLON.Vector3(0, 1, 0),
        scene,
    );
    ambient.intensity = 0.6;
    ambient.diffuse = new BABYLON.Color3(1, 0.6, 0.4);
    ambient.groundColor = new BABYLON.Color3(0.2, 0.05, 0.05);

    const eyeLight = new BABYLON.PointLight("eyeLight", new BABYLON.Vector3(-20, 50, -60), scene);
    eyeLight.diffuse = new BABYLON.Color3(1, 0.2, 0);
    eyeLight.specular = new BABYLON.Color3(1, 0.1, 0.1);
    eyeLight.intensity = 1.5;
    eyeLight.range = 80;
}

export function update3DMeshPos(meshElement: any, xPos: number, yPos: number, zPos: number) {
    meshElement.position = new BABYLON.Vector3(xPos, yPos, zPos);
}

export function scaling3DMesh(meshElement: any, xPos: number, yPos: number, zPos: number) {
    meshElement.scaling = new BABYLON.Vector3(xPos, yPos, zPos);
}

export function createTorch(scene: any) {
    const towerRoot = new BABYLON.TransformNode("towerRoot", scene);

    const towerMat = new BABYLON.StandardMaterial("towerMat", scene);
    towerMat.diffuseColor = new BABYLON.Color3(0, 0, 0);

    const spikeMat = new BABYLON.StandardMaterial("spikeMat", scene);
    spikeMat.diffuseColor = new BABYLON.Color3(0.42, 0.42, 0.42);

    const cone = BABYLON.MeshBuilder.CreateCylinder(
        "cone2",
        {
            diameterTop: 0.5,
            diameterBottom: 0,
            height: 1,
            tessellation: 32,
        },
        scene,
    );
    cone.position = new BABYLON.Vector3(0, 1.5, 0);
    cone.material = towerMat;
    cone.parent = towerRoot;

    var cylinderFloor = BABYLON.MeshBuilder.CreateCylinder(
        "cylinderFloor",
        {diameter: 0.3, height: 2},
        scene,
    );
    cylinderFloor.material = towerMat;
    cylinderFloor.position.y = 1;
    cylinderFloor.parent = towerRoot;

    for (let i = 0; i < 10; i++) {
        const spikeHigh = BABYLON.MeshBuilder.CreateBox(
            "spikeHigh" + i,
            {
                height: 0.25,
                width: 0.04,
                depth: 0.04,
            },
            scene,
        );

        const angle = (i / 10) * Math.PI * 2;
        const radius = 0.25;

        spikeHigh.position = new BABYLON.Vector3(
            Math.cos(angle) * radius,
            2,
            Math.sin(angle) * radius,
        );

        spikeHigh.lookAt(new BABYLON.Vector3(0, 2, 0));
        spikeHigh.material = spikeMat;
        spikeHigh.parent = towerRoot;
    }

    const flameAnchor = new BABYLON.TransformNode("flameAnchor", scene);
    flameAnchor.position = new BABYLON.Vector3(0, 2.1, 0);
    flameAnchor.parent = towerRoot;

    const flameSystem = new BABYLON.ParticleSystem("flameParticles", 2000, scene);

    flameSystem.particleTexture = new BABYLON.Texture(flareTexture, scene);

    flameSystem.emitter = flameAnchor;

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

export function createBaradDur(scene: any) {
    const towerRoot = new BABYLON.TransformNode("towerRoot", scene);

    const eyeMat = new BABYLON.StandardMaterial("eyeMat", scene);
    eyeMat.diffuseColor = new BABYLON.Color3(1, 0.2, 0);
    eyeMat.emissiveColor = new BABYLON.Color3(1, 0.15, 0);

    const towerMat = new BABYLON.StandardMaterial("towerMat", scene);
    towerMat.diffuseColor = new BABYLON.Color3(0, 0, 0);

    const spikeMat = new BABYLON.StandardMaterial("spikeMat", scene);
    spikeMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    const sauronEye = BABYLON.MeshBuilder.CreateSphere(
        "sauronEye",
        {
            diameter: 0.1,
            segments: 32,
        },
        scene,
    );
    sauronEye.position = new BABYLON.Vector3(0, 2.8, 0);
    sauronEye.scaling = new BABYLON.Vector3(1.6, 0.8, 1);
    sauronEye.material = eyeMat;
    sauronEye.parent = towerRoot;

    scene.registerBeforeRender(() => {
        const t = performance.now() * 0.003;
        sauronEye.scaling.y = 0.8 + Math.sin(t) * 0.2;
    });

    const leftHorn = BABYLON.MeshBuilder.CreateBox(
        "leftHorn",
        {width: 0.03, height: 0.2, depth: 0.15},
        scene,
    );
    leftHorn.position = new BABYLON.Vector3(-0.09, 2.75, 0);
    leftHorn.material = towerMat;
    leftHorn.parent = towerRoot;

    const rightHorn = BABYLON.MeshBuilder.CreateBox(
        "rightHorn",
        {width: 0.03, height: 0.2, depth: 0.15},
        scene,
    );
    rightHorn.position = new BABYLON.Vector3(0.09, 2.75, 0);
    rightHorn.material = towerMat;
    rightHorn.parent = towerRoot;

    const coneBalcony = BABYLON.MeshBuilder.CreateCylinder(
        "cone",
        {
            diameterTop: 0,
            diameterBottom: 0.25,
            height: 0.5,
            tessellation: 32,
        },
        scene,
    );
    coneBalcony.position = new BABYLON.Vector3(0, 2.4, 0);
    coneBalcony.material = towerMat;
    coneBalcony.parent = towerRoot;

    const cone = BABYLON.MeshBuilder.CreateCylinder(
        "cone2",
        {
            diameterTop: 0.3,
            diameterBottom: 0,
            height: 0.5,
            tessellation: 32,
        },
        scene,
    );
    cone.position = new BABYLON.Vector3(0, 2.4, 0);
    cone.material = towerMat;
    cone.parent = towerRoot;

    var cylinderFloor = BABYLON.MeshBuilder.CreateCylinder(
        "cylinderFloor",
        {diameter: 1, height: 0.5},
        scene,
    );
    cylinderFloor.material = towerMat;
    cylinderFloor.position.y = 0.3;
    cylinderFloor.parent = towerRoot;

    var cylinderMiddleGround = BABYLON.MeshBuilder.CreateCylinder(
        "cylinderMiddleGround",
        {diameter: 0.8, height: 0.5},
        scene,
    );
    cylinderMiddleGround.material = towerMat;
    cylinderMiddleGround.position.y = 0.6;
    cylinderMiddleGround.parent = towerRoot;

    var cylinderMiddle = BABYLON.MeshBuilder.CreateCylinder(
        "cylinderMiddle",
        {diameter: 0.5, height: 0.5},
        scene,
    );
    cylinderMiddle.material = towerMat;
    cylinderMiddle.position.y = 0.9;
    cylinderMiddle.parent = towerRoot;

    var cylinderMiddleHigh = BABYLON.MeshBuilder.CreateCylinder(
        "cylinderMiddleHigh",
        {diameter: 0.2, height: 2},
        scene,
    );
    cylinderMiddleHigh.material = towerMat;
    cylinderMiddleHigh.position.y = 1.5;
    cylinderMiddleHigh.parent = towerRoot;

    for (let i = 0; i < 10; i++) {
        const spikeHigh = BABYLON.MeshBuilder.CreateBox(
            "spikeHigh" + i,
            {
                height: 0.25,
                width: 0.04,
                depth: 0.04,
            },
            scene,
        );

        const angle = (i / 10) * Math.PI * 2;
        const radius = 0.25;

        spikeHigh.position = new BABYLON.Vector3(
            Math.cos(angle) * radius,
            1.1,
            Math.sin(angle) * radius,
        );

        spikeHigh.lookAt(new BABYLON.Vector3(0, 1.1, 0));
        spikeHigh.material = spikeMat;
        spikeHigh.parent = towerRoot;
    }

    for (let i = 0; i < 10; i++) {
        const spikeMiddle = BABYLON.MeshBuilder.CreateBox(
            "spikeMiddle" + i,
            {
                height: 0.25,
                width: 0.04,
                depth: 0.04,
            },
            scene,
        );

        const angle = (i / 10) * Math.PI * 2;
        const radius = 0.4;

        spikeMiddle.position = new BABYLON.Vector3(
            Math.cos(angle) * radius,
            0.8,
            Math.sin(angle) * radius,
        );

        spikeMiddle.lookAt(new BABYLON.Vector3(0, 0.8, 0));
        spikeMiddle.material = spikeMat;
        spikeMiddle.parent = towerRoot;
    }

    for (let i = 0; i < 10; i++) {
        const spikeBottom = BABYLON.MeshBuilder.CreateBox(
            "spikeBottom" + i,
            {
                height: 0.25,
                width: 0.04,
                depth: 0.04,
            },
            scene,
        );

        const angle = (i / 10) * Math.PI * 2;
        const radius = 0.5;

        spikeBottom.position = new BABYLON.Vector3(
            Math.cos(angle) * radius,
            0.5,
            Math.sin(angle) * radius,
        );

        spikeBottom.lookAt(new BABYLON.Vector3(0, 0.5, 0));
        spikeBottom.material = spikeMat;
        spikeBottom.parent = towerRoot;
    }

    const gl = new BABYLON.GlowLayer("glow", scene);
    gl.intensity = 0.65;

    return towerRoot;
}

export function createPaddle(scene: any) {
    const paddleRoot = new BABYLON.TransformNode("paddleRoot", scene);

    const paddle = BABYLON.MeshBuilder.CreateBox("paddle", {}, scene);
    paddle.scaling = new BABYLON.Vector3(0.25, 0.5, 2);
    paddle.position.y = 0.25;
    paddle.parent = paddleRoot;

    for (let i = 0; i < 10; i++) {
        const spike = BABYLON.MeshBuilder.CreateBox(`spike_${i}`, {}, scene);
        spike.scaling = new BABYLON.Vector3(0.05, 0.2, 0.08);
        spike.position.y = 0.55;
        spike.position.x = -0.15;
        spike.position.z = -0.9 + i * 0.2;
        spike.parent = paddleRoot;
    }

    for (let i = 0; i < 10; i++) {
        const spike = BABYLON.MeshBuilder.CreateBox(`spike_${i}`, {}, scene);
        spike.scaling = new BABYLON.Vector3(0.05, 0.2, 0.08);
        spike.position.y = 0.55;
        spike.position.x = 0.15;
        spike.position.z = -0.9 + i * 0.2;
        spike.parent = paddleRoot;
    }

    const tower1 = BABYLON.MeshBuilder.CreateCylinder("tower", {diameter: 0.6}, scene);
    tower1.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
    tower1.position.y = 0.5;
    tower1.position.z = 0.9;
    tower1.parent = paddleRoot;

    const tower2 = BABYLON.MeshBuilder.CreateCylinder("tower", {diameter: 0.6}, scene);
    tower2.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
    tower2.position.y = 0.5;
    tower2.position.z = -0.9;
    tower2.parent = paddleRoot;

    const createTowerCrenels = (tower: any) => {
        const nb = 12;
        const radius = 0.3;
        for (let i = 0; i < nb; i++) {
            const spike = BABYLON.MeshBuilder.CreateBox(
                `${tower.name}_crenel_${i}`,
                {
                    height: 0.25,
                    width: 0.05,
                    depth: 0.05,
                },
                scene,
            );

            const angle = (i / nb) * Math.PI * 2;
            spike.position = new BABYLON.Vector3(
                Math.cos(angle) * radius,
                1,
                Math.sin(angle) * radius,
            );
            spike.lookAt(new BABYLON.Vector3(0, 1, 0));
            spike.parent = tower;
        }
    };

    createTowerCrenels(tower1);
    createTowerCrenels(tower2);

    return paddleRoot;
}

export function createPaddleRotate(scene: any) {
    const paddleRoot = new BABYLON.TransformNode("paddleRoot", scene);

    const paddle = BABYLON.MeshBuilder.CreateBox("paddle", {}, scene);
    paddle.scaling = new BABYLON.Vector3(0.25, 0.5, 2);
    paddle.position.y = 0.25;
    paddle.parent = paddleRoot;

    for (let i = 0; i < 10; i++) {
        const spike = BABYLON.MeshBuilder.CreateBox(`spike_${i}`, {}, scene);
        spike.scaling = new BABYLON.Vector3(0.05, 0.2, 0.08);
        spike.position.y = 0.55;
        spike.position.x = -0.15;
        spike.position.z = -0.9 + i * 0.2;
        spike.parent = paddleRoot;
    }

    for (let i = 0; i < 10; i++) {
        const spike = BABYLON.MeshBuilder.CreateBox(`spike_${i}`, {}, scene);
        spike.scaling = new BABYLON.Vector3(0.05, 0.2, 0.08);
        spike.position.y = 0.55;
        spike.position.x = 0.15;
        spike.position.z = -0.9 + i * 0.2;
        spike.parent = paddleRoot;
    }

    const tower1 = BABYLON.MeshBuilder.CreateCylinder("tower", {diameter: 0.6}, scene);
    tower1.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
    tower1.position.y = 0.5;
    tower1.position.z = 0.9;
    tower1.parent = paddleRoot;

    const tower2 = BABYLON.MeshBuilder.CreateCylinder("tower", {diameter: 0.6}, scene);
    tower2.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
    tower2.position.y = 0.5;
    tower2.position.z = -0.9;
    tower2.parent = paddleRoot;

    const createTowerCrenels = (tower: any) => {
        const nb = 12;
        const radius = 0.3;
        for (let i = 0; i < nb; i++) {
            const spike = BABYLON.MeshBuilder.CreateBox(
                `${tower.name}_crenel_${i}`,
                {
                    height: 0.25,
                    width: 0.05,
                    depth: 0.05,
                },
                scene,
            );

            const angle = (i / nb) * Math.PI * 2;
            spike.position = new BABYLON.Vector3(
                Math.cos(angle) * radius,
                1,
                Math.sin(angle) * radius,
            );
            spike.lookAt(new BABYLON.Vector3(0, 1, 0));
            spike.parent = tower;
        }
    };

    createTowerCrenels(tower1);
    createTowerCrenels(tower2);

    paddleRoot.rotation = new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(90), 0);

    return paddleRoot;
}

export function createBackgroundScene() {
    const largeGroundMat = new BABYLON.StandardMaterial("largeGroundMat");
    largeGroundMat.diffuseTexture = new BABYLON.Texture(backgroundTexture);

    const largeGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
        "largeGround",
        backgroundHeightMap,
        {width: 150, height: 150, subdivisions: 10, minHeight: 0, maxHeight: 100},
    );
    largeGround.material = largeGroundMat;
    largeGround.position.y = -20;
}

export function createScoreBox2(scene: any) {
    const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    const scoreBox = new BABYLON.GUI.Rectangle("scoreBox");
    scoreBox.width = "30%";
    scoreBox.height = "80px";
    scoreBox.cornerRadius = 8;
    scoreBox.thickness = 2;
    scoreBox.color = "#b32b00";
    scoreBox.background = "rgba(30, 0, 0, 0.7)";
    scoreBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    scoreBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    scoreBox.paddingBottom = "20px";
    ui.addControl(scoreBox);

    const scoreText = new BABYLON.GUI.TextBlock("scoreText");
    scoreText.text = "";
    scoreText.color = "#ffb347";
    scoreText.fontFamily = "Cinzel, serif";
    scoreText.fontSize = 28;
    scoreText.fontWeight = "bold";
    scoreText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    scoreText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    scoreBox.addControl(scoreText);

    scoreText.shadowBlur = 5;
    scoreText.shadowOffsetX = 0;
    scoreText.shadowOffsetY = 0;
    scoreText.shadowColor = "#ff4500";

    return scoreText;
}

export function createScoreBox4(scene: any) {
    const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    const scoreBox = new BABYLON.GUI.Rectangle("scoreBox");
    scoreBox.width = "30%";
    scoreBox.height = "90px";
    scoreBox.cornerRadius = 8;
    scoreBox.thickness = 2;
    scoreBox.color = "#b32b00";
    scoreBox.background = "rgba(30, 0, 0, 0.7)";
    scoreBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    scoreBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    scoreBox.paddingBottom = "20px";
    ui.addControl(scoreBox);

    const scoreText = new BABYLON.GUI.TextBlock("scoreText");
    scoreText.text = "";
    scoreText.color = "#ffb347";
    scoreText.fontFamily = "Cinzel, serif";
    scoreText.fontSize = 28;
    scoreText.fontWeight = "bold";
    scoreText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    scoreText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    scoreBox.addControl(scoreText);

    scoreText.shadowBlur = 5;
    scoreText.shadowOffsetX = 0;
    scoreText.shadowOffsetY = 0;
    scoreText.shadowColor = "#ff4500";

    return scoreText;
}

export function displayScore2(
    matchInfos: any,
    appDiv: HTMLElement,
    gameState: any,
    scoreText: any,
) {
    const player1Name = matchInfos.players[0].alias;
    const player2Name = matchInfos.players[1].alias;
    const player1Score = gameState.score.left;
    const player2Score = gameState.score.right;

    scoreText.text = `${player1Name}: ${player1Score}  -  ${player2Score} : ${player2Name}`;
}

export function displayScore4(
    matchInfos: any,
    appDiv: HTMLElement,
    gameState: any,
    scoreText: any,
) {
    // Map sides to player names using assignments
    const getPlayerNameForSide = (side: string) => {
        if (matchInfos.assignments && matchInfos.assignments[side]) {
            return matchInfos.assignments[side];
        }
        // Fallback: try to find by index
        const sideIndex = ["left", "right", "up", "down"].indexOf(side);
        return matchInfos.players[sideIndex]?.alias || `Player ${sideIndex + 1}`;
    };

    const leftPlayerName = getPlayerNameForSide("left");
    const rightPlayerName = getPlayerNameForSide("right");
    const upPlayerName = getPlayerNameForSide("up");
    const downPlayerName = getPlayerNameForSide("down");

    const leftScore = gameState.score.left;
    const rightScore = gameState.score.right;
    const upScore = gameState.score.up;
    const downScore = gameState.score.down;

    scoreText.text =
        `${rightPlayerName}: ${rightScore} ${leftPlayerName}: ${leftScore}\n` +
        `${downPlayerName}: ${downScore} ${upPlayerName}: ${upScore}`;
}


export function createVisionCone(scene: any) {
    const coneMat = new BABYLON.StandardMaterial("coneMat", scene);
    coneMat.emissiveColor = new BABYLON.Color3(1, 0.4, 0);
    coneMat.alpha = 0.35;

    const height = 10;

    const cone = BABYLON.MeshBuilder.CreateCylinder(
        "visionCone",
        {
            diameterTop: 0,
            diameterBottom: 0.5,
            height: height,
            tessellation: 32,
        },
        scene,
    );
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

export function updateVisionConePos(scene: any, ball: any, cone: any) {
    const sauronEye = scene.getMeshByName("sauronEye");
    const eyePos = sauronEye.getAbsolutePosition();
    cone.position.copyFrom(eyePos);

    const ballPos = ball.getAbsolutePosition();
    cone.lookAt(ballPos);

    const dist = BABYLON.Vector3.Distance(eyePos, ballPos);
    const baseLength = cone.metadata?.baseLength ?? 10;
    cone.scaling.z = dist / baseLength;
}
