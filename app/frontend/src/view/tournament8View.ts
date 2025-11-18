import {
    clearDiv,
    createVideoBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createInputElement,
    createLogoElement,
    createButtonForm,
    createBoxDiv,
	createButtonLink,
	SERVER_BASE
} from "./utils.js";
import { renderGame } from "./gameView.js";
import { renderTournamentIntermediate } from "./tournamentIntermediateView.js";

const appDiv = document.getElementById("app");

// Handle tournament game completion
async function handleTournamentGameEnd(winner: string, match: any) {
    try {
        // Register winner for next round
        await fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/tournament`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                player: { alias: winner },
                mode: "tournament8" as const,
                tournamentRound: match.tournamentRound + 1,
                tournamentId: match.tournamentId
            })
        });
        
        // Get next match info to show next players
        const nextMatchData = await fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/tournament/match-ended`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tournamentId: match.tournamentId,
                matchId: match.id
            })
        }).then(r => r.json());
        
        const nextPlayers = nextMatchData.status === "next match available" 
            ? nextMatchData.match.players.map((p: any) => p.alias)
            : undefined;
        
        const nextMatch = nextMatchData.status === "next match available" 
            ? nextMatchData.match
            : undefined;
            
        showIntermediatePage(winner, match, false, nextPlayers, nextMatch);
        
    } catch (error) {
        console.error('Error handling tournament progression:', error);
        import('./endGameView.js').then(({ endGameView }) => {
            if (appDiv) {
                endGameView(winner, appDiv);
            }
        });
    }
}

function showIntermediatePage(winner: string, currentMatch: any, isFirstGame: boolean = false, nextPlayers?: string[], nextMatch?: any) {
    const intermediateInfo = {
        winner: isFirstGame ? "Tournament Ready!" : winner,
        currentRound: isFirstGame ? 0 : currentMatch.tournamentRound,
        nextRound: nextMatch ? nextMatch.tournamentRound : (isFirstGame ? 1 : currentMatch.tournamentRound + 1),
        totalRounds: 3,
        tournamentType: "tournament8" as const,
        nextMatch: true,
        nextPlayers: isFirstGame ? [currentMatch.players[0].alias, currentMatch.players[1].alias] : nextPlayers,
        isWaiting: false,
        tournamentId: currentMatch.tournamentId
    };
    
    const onNextGame = async () => {
        try {
            if (isFirstGame) {
                // Start first game
                const response = await startMatch(currentMatch.id);
                if (response.status === "match started") {
                    renderGame(response.match, (winner: string) => handleTournamentGameEnd(winner, response.match));
                }
                return;
            }
            
            // Get next match
            const matchData = await fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/tournament/match-ended`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tournamentId: currentMatch.tournamentId,
                    matchId: currentMatch.id
                })
            }).then(r => r.json());
            
            if (matchData.status === "next match available") {
                const response = await startMatch(matchData.match.id);
                if (response.status === "match started") {
                    renderGame(response.match, (winner: string) => handleTournamentGameEnd(winner, response.match));
                }
            } else if (matchData.status === "tournament complete") {
                import('./endGameView.js').then(({ endGameView }) => {
                    if (appDiv) {
                        endGameView(`🏆 TOURNAMENT CHAMPION: ${winner}! 🏆`, appDiv);
                    }
                });
            } else {
                import('./endGameView.js').then(({ endGameView }) => {
                    if (appDiv) {
                        endGameView(`Tournament ended. Status: ${matchData.status}`, appDiv);
                    }
                });
            }
        } catch (error) {
            console.error('Error in tournament progression:', error);
        }
    };
    
    renderTournamentIntermediate(intermediateInfo, onNextGame);
}

// Helper function to start a match
async function startMatch(matchId: string) {
    const response = await fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/tournament/start-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId })
    });
    return response.json();
}

export async function handleTournament8() {
    // Get all player names from the form
    const playerNames = [];
    for (let i = 1; i <= 8; i++) {
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
                mode: "tournament8" as const,
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
        
        // Show intermediate page before the first game instead of starting directly
        showIntermediatePage("Tournament Ready", tournament, true); // true indicates this is the first game
        history.pushState({}, "", "/tournament/8");
        window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to create tournament");
    }
}

export function renderTournament8() {
	if(appDiv) {
		clearDiv(appDiv);

		// Background and header
		appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo", "top-left"));
		appDiv.appendChild(createHeadingText("Tournament 8 Players", "top-right"));

		// Create main container
		const mainContainer = document.createElement("div");
		mainContainer.className = "flex flex-col items-center justify-center min-h-screen p-8";

		// Create tournament setup box
		const tournamentBox = createBoxDiv("tournamentSetup");
		tournamentBox.className += " max-w-6xl w-full";

		// Tournament title
		const titleDiv = document.createElement("div");
		titleDiv.className = "text-center mb-8";
		const title = createSubheadingText("Enter Player Names for Tournament");
		titleDiv.appendChild(title);
		tournamentBox.appendChild(titleDiv);

		// Create grid for player forms (4 columns for 8 players)
		const playersGrid = document.createElement("div");
		playersGrid.className = "grid grid-cols-4 gap-4 mb-8";

		// Create 8 player input forms
		for (let i = 1; i <= 8; i++) {
			const playerBox = document.createElement("div");
			playerBox.className = "bg-gray-800/40 p-4 rounded-lg border border-amber-700/30";

			// Player number label
			const playerLabel = document.createElement("h3");
			playerLabel.className = "text-lg font-bold text-amber-400 mb-3 text-center";
			playerLabel.textContent = `Player ${i}`;

			// Player name input
			const playerInput = createInputElement("text", `player${i}`, `Player ${i}`);
			playerInput.className += " w-full text-sm";
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
			await handleTournament8();
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

