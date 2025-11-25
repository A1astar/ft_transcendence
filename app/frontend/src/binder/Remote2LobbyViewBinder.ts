import {renderGame} from "../view/gameView.js";
import {SERVER_BASE} from "../view/utils.js";
import {ViewEventBinder} from "./binderInterface.js";

export class Remote2LobbyViewBinder implements ViewEventBinder {
    private activeController: AbortController | null = null;
    private activeMatchRequest: any = null;

    // Handle browser navigation (back/forward) to cancel matchmaking and leave queue
    private navigationHandler = async () => {
        if (this.activeController) {
            try {
                // Abort ongoing requests
                this.activeController.abort();
            } catch (e) {
                console.error(e);
            }

            // Attempt to tell server we leave the queue
            if (this.activeMatchRequest) {
                try {
                    await fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/remote2/leave`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(this.activeMatchRequest),
                    });
                } catch (e) {
                    console.error("Failed to leave queue on navigation:", e);
                }
            }

            // Remove popup if present
            this.hideWaitingPopup();

            // clear active state
            this.activeController = null;
            this.activeMatchRequest = null;
        }
    };
    private showWaitingPopup() {
        const popup = document.createElement("div");
        popup.id = "waitingPopup";
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
        const popup = document.getElementById("waitingPopup");
        if (popup) {
            popup.remove();
        }
    }

    private async pollForMatch2(signal: AbortSignal, matchRequest: any): Promise<any> {
        const res = await fetch(
            `http://${SERVER_BASE}:3002/api/game-orchestration/remote2/status?alias=${encodeURIComponent(
                matchRequest.player.alias,
            )}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                signal,
            },
        );

        if (!res.ok) throw new Error("Failed to check match status");
        const match = await res.json();

        if (match.status === "waiting") {
            // Wait for 1 second before polling again
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return this.pollForMatch2(signal, matchRequest);
        }
        return match;
    }

    async bind() {
        // Bind join button to start matchmaking with chosen alias
        const form = document.getElementById("remote2Form") as HTMLFormElement | null;
        const aliasInput = document.getElementById("remote2AliasInput") as HTMLInputElement | null;

        const startMatchmaking = async (aliasValue: string) => {
            const alias = aliasValue || localStorage.getItem("guestUsername") || "guest";
            localStorage.setItem("remote2Alias", alias);

            const matchRequest = {
                player: { alias },
                mode: "remote2" as const,
                tournamentRound: 0,
            };

            // Show waiting popup
            const waitingPopup = this.showWaitingPopup();
            const cancelButton = waitingPopup.querySelector("#cancelMatchmaking");

            // Create an AbortController to handle cancellation
            const controller = new AbortController();
            const signal = controller.signal;

            // Track active controller and request so navigation handler can access them
            this.activeController = controller;
            this.activeMatchRequest = matchRequest;

            // Add cancel button handler
            cancelButton?.addEventListener("click", () => {
                controller.abort();
                this.hideWaitingPopup();
                // clear active state
                this.activeController = null;
                this.activeMatchRequest = null;
            });

            try {
                // Join queue
                const res = await fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/remote2`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(matchRequest),
                    signal,
                });

                if (!res.ok) throw new Error("Failed to join queue");

                const initialResponse = await res.json();

                let match;
                if (initialResponse.status === "waiting") {
                    match = await this.pollForMatch2(signal, matchRequest);
                } else {
                    match = initialResponse;
                }

                // Hide waiting popup
                this.hideWaitingPopup();

                // clear active state (we're transitioning to game)
                this.activeController = null;
                this.activeMatchRequest = null;

                // Start the game
                sessionStorage.setItem("currentGameId", match.id);
                renderGame(match);
            } catch (error: unknown) {
                this.hideWaitingPopup();
                if (error instanceof Error && error.name === "AbortError") {
                    console.log("Matchmaking cancelled by user");
                    try {
                        await fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/remote2/leave`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(matchRequest),
                        });
                    } catch (e) {
                        console.error("Failed to leave queue:", e);
                    }
                } else {
                    console.error("Error:", error);
                    alert("Failed to start remote game");
                }
            }
        };

        // Register navigation handler so that browser back/forward cancels matchmaking
        window.addEventListener("popstate", this.navigationHandler);

        // If user submits the form (clicks Join), start matchmaking with input value
        form?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            const aliasVal = aliasInput?.value.trim() ?? "";
            startMatchmaking(aliasVal);
        });

        // Also attach to button in case of direct click handlers
        const joinBtn = document.getElementById("joinRemote2Button");
        joinBtn?.addEventListener("click", (ev) => {
            ev.preventDefault();
            const aliasVal = aliasInput?.value.trim() ?? "";
            startMatchmaking(aliasVal);
        });
    }

    unbind() {
        // Remove navigation listener
        try {
            window.removeEventListener("popstate", this.navigationHandler);
        } catch (e) {
            // ignore
        }

        // If there is an active matchmaking, abort and inform server
        if (this.activeController) {
            try {
                this.activeController.abort();
            } catch (e) {
                // ignore
            }

            if (this.activeMatchRequest) {
                fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/remote2/leave`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(this.activeMatchRequest),
                }).catch((e) => console.error("Failed to leave queue on unbind:", e));
            }
        }

        // Clear state and remove popup
        this.activeController = null;
        this.activeMatchRequest = null;
        this.hideWaitingPopup();
    }
}
