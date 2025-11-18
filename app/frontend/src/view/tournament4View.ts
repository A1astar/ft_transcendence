import {
    clearDiv,
    createVideoBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createParagraphText,
    createFormElement,
    createInputElement,
    createLogoElement,
    createButtonForm,
    createBoxDiv,
	createButtonLink,
	SERVER_BASE
} from "./utils.js";
import { renderGame } from "./gameView.js";

const appDiv = document.getElementById("app");

// Handle tournament game completion and progression
async function handleTournamentGameEnd(winner: string) {
    const tournamentId = sessionStorage.getItem('currentTournamentId');
    const gameId = sessionStorage.getItem('currentGameId');
    
    if (!tournamentId || !gameId) {
        console.error('Missing tournament or game ID');
        return;
    }
    
    try {
        // First, add the winner to the next round using the main tournament endpoint
        const winnerMatchRequest = {
            player: {
                alias: winner
            },
            mode: "tournament4" as const,
            tournamentRound: 2, // Next round for 4-player tournament
            tournamentId: tournamentId
        };
        
        const winnerResponse = await fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/tournament`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(winnerMatchRequest)
        });
        
        const winnerData = await winnerResponse.json();
        console.log('Winner registered for next round:', winnerData);
        
        // Then, try to start the next match in the current round
        const matchEndedResponse = await fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/tournament/match-ended`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tournamentId: tournamentId,
                matchId: gameId
            })
        });
        
        const matchData = await matchEndedResponse.json();
        console.log('Tournament match-ended response:', matchData);
        
        if (matchData.status === "next match started") {
            console.log('Next match started:', matchData.match);
            // Update session storage with new match ID and render next game
            sessionStorage.setItem('currentGameId', matchData.match.id);
            renderGame(matchData.match, handleTournamentGameEnd);
        } else {
            console.log('All matches in current round completed');
            // Show winner screen - check if next round is ready
            if (winnerData.status === "game created") {
                // Next round match is ready!
                sessionStorage.setItem('currentGameId', winnerData.match.id);
                renderGame(winnerData.match, handleTournamentGameEnd);
            } else {
                // Waiting for more winners
                import('./endGameView.js').then(({ endGameView }) => {
                    if (appDiv) {
                        endGameView(`${winner} wins the match! Waiting for other matches to complete...`, appDiv);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error handling tournament progression:', error);
        // Fallback to regular end game view
        import('./endGameView.js').then(({ endGameView }) => {
            if (appDiv) {
                endGameView(winner, appDiv);
            }
        });
    }
}

export async function handleTournament4() {
    // Get all player names from the form
    const playerNames = [];
    for (let i = 1; i <= 4; i++) {
        const input = document.getElementById(`player${i}`) as HTMLInputElement;
        const playerName = input?.value?.trim();
        if (!playerName) {
            alert(`Please enter a name for Player ${i}`);
            return;
        }
        playerNames.push(playerName);
    }

    try {
        // Send individual match requests for each player
        const matchPromises = playerNames.map(async (playerName) => {
            const matchRequest = {
                player: {
                    alias: playerName
                },
                mode: "tournament4" as const,
                tournamentRound: 1
            };

            const res = await fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/tournament`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(matchRequest)
            });

            if (!res.ok) throw new Error(`Match request failed for player ${playerName}`);
            return res.json();
        });

        // Wait for all match requests to complete
        const results = await Promise.all(matchPromises);
        
        // Find the result where status === 'game created'
        const tournament = results.find(result => result.status === 'game created').match;
		console.log(tournament);
        
        if (!tournament) {
            throw new Error('No game created in tournament results');
        }
        sessionStorage.setItem('currentGameId', tournament.id);
        sessionStorage.setItem('currentTournamentId', tournament.tournamentId);
        
        // Render tournament view or first match with tournament callback
        renderGame(tournament, handleTournamentGameEnd);
        history.pushState({}, "", "/tournament/4");
        window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to create tournament");
    }
}

export function renderTournament4() {
	if(appDiv) {
		clearDiv(appDiv);

		// Background and header
		appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo", "top-left"));
		appDiv.appendChild(createHeadingText("Tournament 4 Players", "top-right"));

		// Create main container
		const mainContainer = document.createElement("div");
		mainContainer.className = "flex flex-col items-center justify-center min-h-screen p-8";

		// Create tournament setup box
		const tournamentBox = createBoxDiv("tournamentSetup");
		tournamentBox.className += " max-w-4xl w-full";

		// Tournament title
		const titleDiv = document.createElement("div");
		titleDiv.className = "text-center mb-8";
		const title = createSubheadingText("Enter Player Names for Tournament");
		titleDiv.appendChild(title);
		tournamentBox.appendChild(titleDiv);

		// Create grid for player forms
		const playersGrid = document.createElement("div");
		playersGrid.className = "grid grid-cols-2 gap-6 mb-8";

		// Create 4 player input forms
		for (let i = 1; i <= 4; i++) {
			const playerBox = document.createElement("div");
			playerBox.className = "bg-gray-800/40 p-4 rounded-lg border border-amber-700/30";

			// Player number label
			const playerLabel = document.createElement("h3");
			playerLabel.className = "text-xl font-bold text-amber-400 mb-3 text-center";
			playerLabel.textContent = `Player ${i}`;

			// Player name input
			const playerInput = createInputElement("text", `player${i}`, `Enter Player ${i} name`);
			playerInput.className += " w-full";
			playerInput.maxLength = 20;
			playerInput.required = true;

			playerBox.appendChild(playerLabel);
			playerBox.appendChild(playerInput);
			playersGrid.appendChild(playerBox);
		}

		tournamentBox.appendChild(playersGrid);

		// Start tournament button
		const buttonContainer = document.createElement("div");
		buttonContainer.className = "text-center";
		
		const startButton = createButtonForm("Start Tournament", "startTournament");
		startButton.className += " text-lg px-8 py-3";
		startButton.addEventListener("click", async (e) => {
			e.preventDefault();
			await handleTournament4();
		});

		buttonContainer.appendChild(startButton);
		tournamentBox.appendChild(buttonContainer);

		// Back button
		const backContainer = document.createElement("div");
		backContainer.className = "text-center mt-4";
		const backButton = createButtonLink("/gameMenu", "Back to Menu", "center");
		backButton.className += " text-sm px-4 py-2";
		backContainer.appendChild(backButton);
		tournamentBox.appendChild(backContainer);

		mainContainer.appendChild(tournamentBox);
		appDiv.appendChild(mainContainer);
	}
}

