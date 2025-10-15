import {router} from "./router.js";

const API_URL = "http://localhost:3000";

// Initialisation de l'application
// 1. Vérifier la connexion à l'API
// 2. Vérifier si l'utilisateur est connecté (exemple basique avec localStorage)
// 3. Charger les données utilisateur si besoin
// 4. Initialiser le routeur avec l'URL actuelle
// 5. Binder les événements globaux (boutons, formulaires, etc.)
// 6. Autres initialisations (WebSocket, notifications, etc.

async function eventsBinding() {
    // Exemple : bouton de déconnexion
    // document.getElementById('logoutBtn')?.addEventListener('click', () => {
    //     localStorage.removeItem('token');
    //     router('/login');
    // });
}

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

        router(window.location.pathname);
    } catch (error) {
        console.error("Error during app initialization:", error);
    }
}

main();
