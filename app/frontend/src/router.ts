import {renderGameMenu} from "./view/gameMenuView.js";
import {renderGuestLogin} from "./view/guestView.js";
import {renderHome} from "./view/homeView.js";
import {renderLogin} from "./view/loginView.js";
import {renderRegister} from "./view/registerView.js";
import {renderNotFound} from "./view/notFoundView.js";
import {renderProfile} from "./view/profileView.js";
import {renderSettings} from "./view/settingsView.js";
import {bindEvents} from "./eventsBinder.js";

type Unmount = () => void;
type RenderFn = () => void | Unmount;

let currentBinder: ReturnType<typeof bindEvents> | null = null;
let currentUnmount: Unmount | null = null;

const routeMap: {[key: string]: () => void} = {
    "/": renderHome,
    "/login": renderLogin,
    "/register": renderRegister,
    "/guest": renderGuestLogin,
    "/profile": renderProfile,
    "/settings": renderSettings,
    "/gameMenu": renderGameMenu,
};

export async function router(path: string): Promise<void> {
    currentBinder?.unbind();
    currentBinder = null;

    currentUnmount?.();
    currentUnmount = null;

    const render = routeMap[path];
    if (render) {
        render();
        currentBinder = bindEvents(path);
    } else {
        renderNotFound();
        currentBinder = bindEvents(path);
    }
}
