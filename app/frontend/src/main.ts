import {router} from "./router.js";

const API_URL = "http://localhost:3000";

async function main(): Promise<void> {
    try {
        const response: Response = await fetch(API_URL);
        if (response.ok) {
            router(response.url);
        } else {
            throw new Error(`API connection failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error connecting to the API:", error);
    }
}

main();
