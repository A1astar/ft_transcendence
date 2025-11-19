//view
import {renderGameMenu} from "./view/gameMenuView.js";
import {renderGuestLogin} from "./view/guestView.js";
import {renderHome} from "./view/homeView.js";
import {renderLogin} from "./view/loginView.js";
import {renderRegister} from "./view/registerView.js";
import {renderNotFound} from "./view/notFoundView.js";
import {renderProfile} from "./view/profileView.js";
import {renderSettings} from "./view/settingsView.js";
import {renderLocalLobby} from "./view/localLobbyView.js";
import {renderRemote2Lobby} from "./view/remote2LobbyView.js";
import {renderRemote4Lobby} from "./view/remote4LobbyView.js";
import {renderTournament4Lobby} from "./view/tournament4LobbyView.js";
import {renderTournament8Lobby} from "./view/tournament8LobbyView.js";

//binder
import {ViewEventBinder} from "./binder/binderInterface.js";
import {GameMenuViewBinder} from "./binder/gameMenuViewBinder.js";
import {GuestViewBinder} from "./binder/guestViewBinder.js";
import {HomeViewBinder} from "./binder/homeViewBinder.js";
import {LoginViewBinder} from "./binder/loginViewBinder.js";
import {ProfileViewBinder} from "./binder/profileViewBinder.js";
import {RegisterViewBinder} from "./binder/registerViewBinder.js";
import {SettingsViewBinder} from "./binder/settingsViewBinder.js";
import {LocalLobbyViewBinder} from "./binder/localLobbyViewBinder.js";
import {Remote2LobbyViewBinder} from "./binder/Remote2LobbyViewBinder.js";
import {Remote4LobbyViewBinder} from "./binder/Remote4LobbyViewBinder.js";
import {Tournament4LobbyViewBinder} from "./binder/Tournament4LobbyViewBinder.js";
import {Tournament8LobbyViewBinder} from "./binder/Tournament8LobbyViewBinder.js";

const viewMap: {[key: string]: () => void} = {
    "/": renderHome,
    "/login": renderLogin,
    "/register": renderRegister,
    "/guest": renderGuestLogin,
    "/profile": renderProfile,
    "/settings": renderSettings,
    "/gameMenu": renderGameMenu,
    "/localLobby": renderLocalLobby,
    "/remote2Lobby": renderRemote2Lobby,
    "/remote4Lobby": renderRemote4Lobby,
    "/tournament4Lobby": renderTournament4Lobby,
    "/tournament8Lobby": renderTournament8Lobby,
};

const bindMap: {[key: string]: ViewEventBinder} = {
    "/": new HomeViewBinder(),
    "/login": new LoginViewBinder(),
    "/register": new RegisterViewBinder(),
    "/guest": new GuestViewBinder(),
    "/profile": new ProfileViewBinder(),
    "/settings": new SettingsViewBinder(),
    "/gameMenu": new GameMenuViewBinder(),
    "/localLobby": new LocalLobbyViewBinder(),
    "/remote2Lobby": new Remote2LobbyViewBinder(),
    "/remote4Lobby": new Remote4LobbyViewBinder(),
    "/tournament4Lobby": new Tournament4LobbyViewBinder(),
    "/tournament8Lobby": new Tournament8LobbyViewBinder(),
};

export async function router(path: string): Promise<void> {
    console.log(path);
    let renderFunction = viewMap[path];
    let binderInterface = bindMap[path];
    renderFunction ? renderFunction() : renderNotFound();
    binderInterface?.bind();
}
