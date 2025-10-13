import {
    renderNotFound,
    renderLogin,
    renderProfile,
    renderSettings,
    renderGame,
    renderDashboard,
} from "./render.js";

export async function router(path: string): Promise<void> {
    switch (path) {
        case "/login":
            renderLogin();
            break;
        case "/profile":
            renderProfile();
            break;
        case "/settings":
            renderSettings();
            break;
        case "/game":
            renderGame();
            break;
        case "/dashboard":
            renderDashboard();
            break;
        default:
            renderNotFound();
            break;
    }
}
