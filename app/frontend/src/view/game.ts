
function createCamera(scene) {
    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 20, 10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
}

function createLight(scene) {
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;
}

function update3DMeshPos(meshElement, xPos, yPos, zPos) {
    meshElement.position = new BABYLON.Vector3(xPos, yPos, zPos)
}

function scaling3DMesh(meshElement, xPos, yPos, zPos) {
    meshElement.scaling = new BABYLON.Vector3(xPos, yPos, zPos);
}

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    createCamera(scene);
    createLight(scene);


    //const groundMaterial = new BABYLON.StandardMaterial("groundMaterial");
    //groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.35, 0.64);

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial");
    groundMaterial.diffuseTexture = new BABYLON.Texture("textures/grass.png")

    const wallMaterial = new BABYLON.StandardMaterial("wallMaterial");
    wallMaterial.diffuseTexture = new BABYLON.Texture("textures/speckles.jpg");

    const ballMaterial = new BABYLON.StandardMaterial("ballMaterial");
    ballMaterial.diffuseTexture = new BABYLON.Texture("textures/fire.png");

    const paddleMaterial = new BABYLON.StandardMaterial("paddleMaterial");
    paddleMaterial.diffuseTexture = new BABYLON.Texture("textures/rock.png");

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 10}, scene)
    ground.material = groundMaterial;

    const ball = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.35, segments: 128}, scene);
    ball.material = ballMaterial;
    update3DMeshPos(ball, 0, 0.25, 0);

    const upperWall = BABYLON.MeshBuilder.CreateBox("upperWall", {}, scene);
    upperWall.material = wallMaterial;
    scaling3DMesh(upperWall, 20, 0.5, 0.25);
    update3DMeshPos(upperWall, 0, 0, -5);

    const lowerWall = BABYLON.MeshBuilder.CreateBox("lowerWall", {}, scene);
    lowerWall.material = wallMaterial;
    scaling3DMesh(lowerWall, 20, 0.5, 0.25);
    update3DMeshPos(lowerWall, 0, 0, 5);

    const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {}, scene);
    leftWall.material = wallMaterial;
    scaling3DMesh(leftWall, 0.25, 0.5, 10);
    update3DMeshPos(leftWall, 10, 0, 0);

    const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", {}, scene);
    rightWall.material = wallMaterial;
    scaling3DMesh(rightWall, 0.25, 0.5, 10);
    update3DMeshPos(rightWall, -10, 0, 0);

    const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", {}, scene);
    leftPaddle.material = paddleMaterial;
    scaling3DMesh(leftPaddle, 0.25, 0.5, 2);
    update3DMeshPos(leftPaddle, -8, 0, 0);

    const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", {}, scene);
    rightPaddle.material = paddleMaterial;
    scaling3DMesh(rightPaddle, 0.25, 0.5, 2);
    update3DMeshPos(rightPaddle, 8, 0, 0);

    return scene;
};
