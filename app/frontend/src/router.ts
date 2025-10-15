import {renderGameMenu} from "./view/gameMenu.js";
import {renderGuestLogin} from "./view/guest.js";
import {renderHome} from "./view/home.js";
import {renderLogin} from "./view/login.js";
import {renderRegister} from "./view/register.js";
import {renderNotFound} from "./view/notFound.js";
import {renderProfile} from "./view/profile.js";
import {renderSettings} from "./view/settings.js";
import {bindEvents} from "./eventsBinder.js";

const routeMap: {[key: string]: () => void} = {
    "/": renderHome,
    "/login": renderLogin,
    "/register": renderRegister,
    "/guest": renderGuestLogin,
    "/profile": renderProfile,
    "/settings": renderSettings,
    "/game-menu": renderGameMenu,
};

let currentBinder: ReturnType<typeof bindEvents> | null = null; // stocke le binder courant

export async function router(path: string): Promise<void> {
    currentBinder?.unbind(); // unbind des événements de la vue précédente

    const render = routeMap[path];
    if (render) {
        render();
        currentBinder = bindEvents(path); // bind après rendu
    } else {
        renderNotFound();
        currentBinder = bindEvents(path);
    }
}
