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
import {renderLocalLobby} from "./view/localView.js"
import {renderRemote2Lobby} from "./view/remote2View.js";
import {renderRemote4Lobby} from "./view/remote4View.js";
import {renderTournament4Lobby} from "./view/tournament4View.js";
import {renderTournament8Lobby} from "./view/tournament8View.js";

let currentBinder: ReturnType<typeof bindEvents> | null = null;

const routeMap: {[key: string]: () => void} = {
    "/": renderHome,
    "/login": renderLogin,
    "/register": renderRegister,
    "/guest": renderGuestLogin,
    "/profile": renderProfile,
    "/settings": renderSettings,
    "/gameMenu": renderGameMenu,
    "/local" : renderLocalLobby,
    "/remote2" : renderRemote2Lobby,
    "/remote4" : renderRemote4Lobby,
    "/tournament4" : renderTournament4Lobby,
    "/tournament8" : renderTournament8Lobby
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
