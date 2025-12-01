import {renderGame} from "../view/gameView.js";
import {SERVER_BASE} from "../view/utils.js";
import {ViewEventBinder} from "./binderInterface.js";
import { getUsername } from "../authService.js";

export class LocalLobbyViewBinder implements ViewEventBinder {
    async bind() {
        const fetched = await getUsername();
        const alias = fetched || localStorage.getItem("guestUsername");
        const matchRequest1 = {
            player: {alias: alias || "guest"},
            mode: "local" as const,
            tournamentRound: 0,
        };
        const matchRequest2 = {
            player: {alias: "guest"},
            mode: "local" as const,
            tournamentRound: 0,
        };

        try {
            const res1 = await fetch(`https://${SERVER_BASE}:8443/api/game-orchestration/local`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(matchRequest1),
            });
            if (!res1.ok) throw new Error("First player request failed");

            const res2 = await fetch(`https://${SERVER_BASE}:8443/api/game-orchestration/local`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(matchRequest2),
            });
            if (!res2.ok) throw new Error("Second player request failed");

            const match = await res2.json();
            sessionStorage.setItem("currentGameId", match.id);

            renderGame(match);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to start local game");
        }
    }
    unbind() {}
}
