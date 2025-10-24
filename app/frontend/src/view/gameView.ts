// import * as BABYLON from "@babylonjs/core";

// function createCamera(scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
//     //?This creates and positions a free camera (non-mesh)
//     var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 20, 10), scene);

//     // ?This targets the camera to scene origin
//     camera.setTarget(BABYLON.Vector3.Zero());

//     // ?This attaches the camera to the canvas
//     camera.attachControl(canvas, true);
// }

// function createLight(scene: BABYLON.Scene) {
//     // ?This creates a light, aiming 0,1,0 - to the sky (non-mesh)
//     var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

//     light.diffuse = new BABYLON.Color3(1, 1, 1);
//     // ?Default intensity is 1. Let's dim the light a small amount
//     light.intensity = 0.7;
// }

// function update3DMeshPos(meshElement: BABYLON.Mesh, xPos: number, yPos: number, zPos: number) {
//     meshElement.position = new BABYLON.Vector3(xPos, yPos, zPos);
// }

// function scaling3DMesh(meshElement: BABYLON.Mesh, xPos: number, yPos: number, zPos: number) {
//     meshElement.scaling = new BABYLON.Vector3(xPos, yPos, zPos);
// }
// const canvas = document.getElementById("renderCanvas");
// const engine = new BABYLON.Engine(canvas as HTMLCanvasElement, true);

//  async function createScene(): Promise<BABYLON.Scene> {
//     const engine = new BABYLON.Engine(canvas as HTMLCanvasElement);
//     var scene = new BABYLON.Scene(engine);
//     createCamera(scene, canvas as HTMLCanvasElement);
//     createLight(scene);

//     const groundMaterial = new BABYLON.StandardMaterial("groundMaterial");
//     groundMaterial.diffuseTexture = new BABYLON.Texture("textures/pongTable.png");

//     //const groundMaterial = new BABYLON.StandardMaterial("groundMaterial");
//     //groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.35, 0.64);

//     //const wallMaterial = new BABYLON.StandardMaterial("wallMaterial");
//     //wallMaterial.diffuseTexture = new BABYLON.Texture("textures/speckles.jpg");

//     const wallMaterial = new BABYLON.StandardMaterial("wallMaterial");
//     wallMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

//     //const ballMaterial = new BABYLON.StandardMaterial("ballMaterial");
//     //ballMaterial.diffuseTexture = new BABYLON.Texture("textures/fire.png");

//     const ballMaterial = new BABYLON.StandardMaterial("ballMaterial");
//     ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

//     //const paddleMaterial = new BABYLON.StandardMaterial("paddleMaterial");
//     //paddleMaterial.diffuseTexture = new BABYLON.Texture("textures/rock.png");

//     const paddleMaterial = new BABYLON.StandardMaterial("paddleMaterial");
//     paddleMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

//     const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 10}, scene);
//     ground.material = groundMaterial;

//     const ball = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.35, segments: 128}, scene);
//     ball.material = ballMaterial;
//     update3DMeshPos(ball, 0, 0.25, 0);

//     const upperWall = BABYLON.MeshBuilder.CreateBox("upperWall", {}, scene);
//     upperWall.material = wallMaterial;
//     scaling3DMesh(upperWall, 20, 0.5, 0.25);
//     update3DMeshPos(upperWall, 0, 0, -5);

//     const lowerWall = BABYLON.MeshBuilder.CreateBox("lowerWall", {}, scene);
//     lowerWall.material = wallMaterial;
//     scaling3DMesh(lowerWall, 20, 0.5, 0.25);
//     update3DMeshPos(lowerWall, 0, 0, 5);

//     const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {}, scene);
//     leftWall.material = wallMaterial;
//     scaling3DMesh(leftWall, 0.25, 0.5, 10);
//     update3DMeshPos(leftWall, 10, 0, 0);

//     const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", {}, scene);
//     rightWall.material = wallMaterial;
//     scaling3DMesh(rightWall, 0.25, 0.5, 10);
//     update3DMeshPos(rightWall, -10, 0, 0);

//     const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", {}, scene);
//     leftPaddle.material = paddleMaterial;
//     scaling3DMesh(leftPaddle, 0.25, 0.5, 2);
//     update3DMeshPos(leftPaddle, -8, 0, 0);

//     const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", {}, scene);
//     rightPaddle.material = paddleMaterial;
//     scaling3DMesh(rightPaddle, 0.25, 0.5, 2);
//     update3DMeshPos(rightPaddle, 8, 0, 0);

//     const render = () => scene.render();
//     engine.runRenderLoop(render);

//     const onResize = () => engine.resize();
//     window.addEventListener("resize", onResize);

//     return scene;
// };

// const scene = await createScene();

// engine.runRenderLoop(function () {
//     scene.render();
// });

// window.addEventListener("resize", function () {
//     engine.resize();
// });

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

export function renderGame() {
    if (appDiv) {
        clearDiv(appDiv);

        const canvas = document.createElement("canvas");
        canvas.style.cssText = "width:100%;height:100%;display:block";

        appDiv.appendChild(createHeadingText("Hello"));
        appDiv.appendChild(canvas);
    }
}
