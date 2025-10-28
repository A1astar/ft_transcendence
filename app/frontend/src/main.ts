import {router} from "./router.js";
import chalk from 'chalk';

const API_URL = "http://localhost:3000";

async function checkApiConnection(): Promise<boolean> {
    try {
        const response = await fetch(API_URL);
        return response.ok;
    } catch (error) {
        console.error("API connection error:", error);
        return false;
    }
}

async function main(): Promise<void> {
    try {
        const apiConnected = await checkApiConnection();
        if (!apiConnected) {
            console.error("Cannot connect to API");
            document.body.innerHTML = "<h1>Cannot connect to API. Please try again later.</h1>";
            return;
        }
        // console.log(chalk.white.bold("Frontend state: ") + chalk.green.bold.italic("connected"));
        router(window.location.pathname);
    } catch (error) {
        console.error("Error during app initialization:", error);
    }
}

main();
