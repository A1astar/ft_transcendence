import {renderGame} from "./view/gameView.js";
import { ViewEventBinder } from "./eventsBinder.js";

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
        document
            .getElementById("Tournament4")
            ?.removeEventListener("click", this.onTournament4Click);
        document
            .getElementById("Tournament8")
            ?.removeEventListener("click", this.onTournament8Click);
    }
    private onLocalClick = async (event: MouseEvent) => {
        event.preventDefault();
        const guestUsername = localStorage.getItem("guestUsername");
        const matchRequest1 = {
            player: {
                alias: guestUsername || "guest"
            },
            mode: "local" as const,
            tournamentRound: 0
        };
        const matchRequest2 = {
            player: {
                alias: "guest"
            },
            mode: "local" as const,
            tournamentRound: 0
        };
        try {
            const res1 = await fetch("http://localhost:3002/api/game-orchestration/local", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(matchRequest1)
            });

            if (!res1.ok) throw new Error('First player request failed');
            const res2 = await fetch("http://localhost:3002/api/game-orchestration/local", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(matchRequest2)
            });
            if (!res2.ok) throw new Error('Second player request failed');
            const match = await res2.json();
            sessionStorage.setItem('currentGameId', match.id);

            // Render game view
            renderGame(match);
            history.pushState({}, "", "/game/local");
            window.dispatchEvent(new PopStateEvent("popstate"));
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to start local game");
        }
    }
    private showWaitingPopup() {
        const popup = document.createElement('div');
        popup.id = 'waitingPopup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 1000;
            color: white;
        `;
        popup.innerHTML = `
            <h3>Waiting for opponent...</h3>
            <div class="spinner"></div>
            <button id="cancelMatchmaking" style="margin-top: 10px;">Cancel</button>
        `;
        document.body.appendChild(popup);
        return popup;
    }
    private hideWaitingPopup() {
        const popup = document.getElementById('waitingPopup');
        if (popup) {
            popup.remove();
        }
    }
    private async pollForMatch(signal: AbortSignal, matchRequest: any): Promise<any> {
        const res = await fetch(`http://localhost:3002/api/game-orchestration/remote2/status?alias=${encodeURIComponent(matchRequest.player.alias)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            signal
        });

        if (!res.ok) throw new Error('Failed to check match status');
        const match = await res.json();

        if (match.status === 'waiting') {
            // Wait for 1 second before polling again
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.pollForMatch(signal, matchRequest);
        }
        return match;
    }

    private onRemote2Click = async (event: MouseEvent) => {
        event.preventDefault();
        const guestUsername = localStorage.getItem("guestUsername");

        const matchRequest = {
            player: {
                alias: guestUsername || "guest"
            },
            mode: "remote2" as const,
            tournamentRound: 0
        };

        // Show waiting popup
        const waitingPopup = this.showWaitingPopup();
        const cancelButton = waitingPopup.querySelector('#cancelMatchmaking');

        // Create an AbortController to handle cancellation
        const controller = new AbortController();
        const signal = controller.signal;

        // Add cancel button handler
        cancelButton?.addEventListener('click', () => {
            controller.abort();
            this.hideWaitingPopup();
        });

        try {
            // Join queue
            const res = await fetch("http://localhost:3002/api/game-orchestration/remote2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(matchRequest),
                signal
            });

            if (!res.ok) throw new Error('Failed to join queue');

            const initialResponse = await res.json();

            let match;
            if (initialResponse.status === 'waiting') {
                match = await this.pollForMatch(signal, matchRequest);
            } else {
                match = initialResponse;
            }

            // Hide waiting popup
            this.hideWaitingPopup();

            // Start the game
            sessionStorage.setItem('currentGameId', match.id);
            renderGame(match);
            history.pushState({}, "", "/game/remote2");
            window.dispatchEvent(new PopStateEvent("popstate"));
        } catch (error: unknown) {
            this.hideWaitingPopup();
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Matchmaking cancelled by user');
                // Notify server to remove from queue
                try {
                    await fetch("http://localhost:3002/api/game-orchestration/remote2/leave", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(matchRequest)
                    });
                } catch (e) {
                    console.error("Failed to leave queue:", e);
                }
            } else {
                console.error("Error:", error);
                alert("Failed to start remote game");
            }
        }
    }
    private onRemote4Click(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/api/game-orchestration/remote4");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }
    private onTournament4Click(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/api/game-orchestration/tournament");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }
    private onTournament8Click(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/api/game-orchestration/tournament");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }
}
