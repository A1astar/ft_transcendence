import {renderGameMenu} from "./view/gameMenu.js";
import {renderGuestLogin} from "./view/guest.js";
import {renderHome} from "./view/home.js";
import {renderLogin} from "./view/login.js";
import {renderRegister} from "./view/register.js";
import {renderNotFound} from "./view/notFound.js";
import {renderProfile} from "./view/profile.js";
import {renderSettings} from "./view/settings.js";
import {bindEvents} from "./eventsBinder.js";
//import {renderPong} from "./view/pong.js";

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
    //"/pong": renderPong,
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
