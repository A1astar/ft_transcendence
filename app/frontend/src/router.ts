import {renderGameMenu} from "./view/gameMenuView.js";
import {renderGuestLogin} from "./view/guestView.js";
import {renderHome} from "./view/homeView.js";
import {renderLogin} from "./view/loginView.js";
import {renderRegister} from "./view/registerView.js";
import {renderNotFound} from "./view/notFoundView.js";
import {renderProfile} from "./view/profileView.js";
import {renderSettings} from "./view/settingsView.js";
import {bindEvents} from "./eventsBinder.js";
import {renderGame} from "./view/gameView.js";

let currentBinder: ReturnType<typeof bindEvents> | null = null;

const routeMap: {[key: string]: () => void} = {
    "/": renderHome,
    "/login": renderLogin,
    "/register": renderRegister,
    "/guest": renderGuestLogin,
    "/profile": renderProfile,
    "/settings": renderSettings,
    "/gameMenu": renderGameMenu,
    "/game": renderGame,
};

export async function router(path: string): Promise<void> {
    currentBinder?.unbind();
    currentBinder = null;

    console.log(path);
    const render = routeMap[path];
    if (render) {
        render();
        currentBinder = bindEvents(path);
    } else {
        renderNotFound();
        currentBinder = bindEvents(path);
    }
}
