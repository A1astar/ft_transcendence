import {router} from "./router.js";

async function main(): Promise<void> {
    try {
        console.log("Initializing application...");
        await router(window.location.pathname || '/');
    } catch (error) {
        console.error("Error during app initialization:", error);
        document.body.innerHTML = "<h1>Error initializing application. Check console for details.</h1>";
    }
}

main();
