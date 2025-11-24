import {renderGame} from "../view/gameView.js";
import {renderTournamentIntermediate} from "../view/tournamentIntermediateView.js";
import {SERVER_BASE} from "../view/utils.js";
import {ViewEventBinder} from "./binderInterface.js";
import {endGameView} from "../view/endGameView.js";

export class Tournament8LobbyViewBinder implements ViewEventBinder {
    bind() {
        document.getElementById("startTournament")?.addEventListener("click", this.startTournament);
    }

    unbind() {}

    private showIntermediatePage = (
        winner: string,
        currentMatch: any,
        isFirstGame: boolean = false,
        nextPlayers?: string[],
        nextMatch?: any,
    ) => {
        const intermediateInfo = {
            winner: isFirstGame ? "Tournament Ready!" : winner,
            currentRound: isFirstGame ? 0 : currentMatch.tournamentRound,
            nextRound: nextMatch
                ? nextMatch.tournamentRound
                : isFirstGame
                ? 1
                : currentMatch.tournamentRound + 1,
            totalRounds: 3,
            tournamentType: "tournament8" as const,
            nextMatch: true,
            nextPlayers: isFirstGame
                ? [currentMatch.players[0].alias, currentMatch.players[1].alias]
                : nextPlayers,
            tournamentId: currentMatch.tournamentId,
        };

        const onNextGame = async () => {
            try {
                if (isFirstGame) {
                    // Start first game
                    const response = await this.startMatch(currentMatch.id);
                    if (response.status === "match started") {
                        renderGame(2, response.match, (winner: string) =>
                            this.handleTournamentGameEnd(winner, response.match),
                        );
                    }
                    return;
                }

                // Get next match
                const matchData = await fetch(
                    `http://${SERVER_BASE}:3002/api/game-orchestration/tournament/match-ended`,
                    {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            tournamentId: currentMatch.tournamentId,
                            matchId: currentMatch.id,
                        }),
                    },
                ).then((r) => r.json());

                if (matchData.status === "next match available") {
                    const response = await this.startMatch(matchData.match.id);
                    if (response.status === "match started") {
                        renderGame(2, response.match, (winner: string) =>
                            this.handleTournamentGameEnd(winner, response.match),
                        );
                    }
                } else if (matchData.status === "tournament complete") {
                    endGameView(`🏆 TOURNAMENT CHAMPION: ${winner}! 🏆`);
                } else {
                    endGameView(`Tournament ended. Status: ${matchData.status}`);
                }
            } catch (error) {
                console.error("Error in tournament progression:", error);
            }
        };

        renderTournamentIntermediate(intermediateInfo, onNextGame);
    };

    private handleTournamentGameEnd = async (winner: string, match: any) => {
        try {
            // Register winner for next round
            await fetch(`http://${SERVER_BASE}:3002/api/game-orchestration/tournament`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    player: {alias: winner},
                    mode: "tournament8" as const,
                    tournamentRound: match.tournamentRound + 1,
                    tournamentId: match.tournamentId,
                }),
            });

            // Get next match info to show next players
            const nextMatchData = await fetch(
                `http://${SERVER_BASE}:3002/api/game-orchestration/tournament/match-ended`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        tournamentId: match.tournamentId,
                        matchId: match.id,
                    }),
                },
            ).then((r) => r.json());

            const nextPlayers =
                nextMatchData.status === "next match available"
                    ? nextMatchData.match.players.map((p: any) => p.alias)
                    : undefined;

            const nextMatch =
                nextMatchData.status === "next match available" ? nextMatchData.match : undefined;

            this.showIntermediatePage(winner, match, false, nextPlayers, nextMatch);
        } catch (error) {
            console.error("Error handling tournament progression:", error);
            endGameView(winner);
        }
    };

    private startMatch = async (matchId: string) => {
        const response = await fetch(
            `http://${SERVER_BASE}:3002/api/game-orchestration/tournament/start-match`,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({matchId}),
            },
        );

        return response.json();
    };

    private handleTournament8 = async () => {
        // Get player names
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
                        alias: playerName,
                    },
                    mode: "tournament8" as const,
                    tournamentRound: 1,
                };

                const res = await fetch(
                    `http://${SERVER_BASE}:3002/api/game-orchestration/tournament`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(matchRequest),
                    },
                );

                if (!res.ok) throw new Error(`Match request failed for player ${playerName}`);
                return res.json();
            });

            // Wait for all match requests to complete
            const results = await Promise.all(matchPromises);

            // Find the result where status === 'game created'
            const tournament = results.find((result) => result.status === "game created").match;
            console.log(tournament);

            if (!tournament) {
                throw new Error("No game created in tournament results");
            }

            this.showIntermediatePage("Tournament Ready", tournament, true);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to create tournament");
        }
    };

    private startTournament = async (e: any) => {
        e.preventDefault();
        await this.handleTournament8();
    };
}
