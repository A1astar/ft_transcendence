import {renderGame} from "../view/gameView.js";
import { SERVER_BASE } from "../view/utils.js";
import {ViewEventBinder} from "./binderInterface.js";

export class GameMenuViewBinder implements ViewEventBinder {
    bind() {
        document.getElementById("local")?.addEventListener("click", this.onLocalClick);
        document.getElementById("Remote2")?.addEventListener("click", this.onRemote2Click);
        document.getElementById("Remote4")?.addEventListener("click", this.onRemote4Click);
        document.getElementById("Tournament4")?.addEventListener("click", this.onTournament4Click);
        document.getElementById("Tournament8")?.addEventListener("click", this.onTournament8Click);
    }
    unbind() {
        document.getElementById("local")?.removeEventListener("click", this.onLocalClick);
        document.getElementById("Remote2")?.removeEventListener("click", this.onRemote2Click);
        document.getElementById("Remote4")?.removeEventListener("click", this.onRemote4Click);
        document.getElementById("Tournament4")?.removeEventListener("click", this.onTournament4Click);
        document.getElementById("Tournament8")?.removeEventListener("click", this.onTournament8Click);
    }

    private onLocalClick = async (event: MouseEvent) => {
        event.preventDefault();
        history.pushState({}, "", "/localLobby");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }

    private onRemote2Click = async (event: MouseEvent) => {
        event.preventDefault();
        history.pushState({}, "", "/remote2Lobby");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }

    private onRemote4Click = async (event: MouseEvent) => {
        event.preventDefault();
        history.pushState({}, "", "/remote4Lobby");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }

    // tournament 4
    private onTournament4Click(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/tournament4Lobby");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }

    // tournament 8
    private onTournament8Click(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/tournament8Lobby");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }
}
