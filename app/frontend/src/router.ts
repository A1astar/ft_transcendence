import { renderGameMenu } from "./view/gameMenu.js";
import { renderGuestLogin } from "./view/guest.js";
import { renderHome } from "./view/home.js";
import { renderLogin } from "./view/login.js";
import { renderNotFound } from "./view/notFound.js";
import { renderProfile } from "./view/profile.js";
import { renderSettings } from "./view/settings.js";


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
        case "/":
            renderHome();
            break;
        default:
            renderNotFound();
            break;
    }
}
