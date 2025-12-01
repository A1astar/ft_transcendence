import {
    clearDiv,
    createVideoBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createButtonForm,
    createBoxDiv,
    createButtonLink,
    createLogoElement
} from "./utils.js";

const appDiv = document.getElementById("app");

interface TournamentIntermediateInfo {
    winner: string;
    currentRound: number;
    nextRound?: number;
    totalRounds: number;
    tournamentType: "tournament4" | "tournament8";
    nextMatch?: any;
    nextPlayers?: string[];
    tournamentId: string;
}

export function renderTournamentIntermediate(info: TournamentIntermediateInfo, onNextGame: () => void) {
    if (!appDiv) return;

    clearDiv(appDiv);

    // Background and header
    appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));
    appDiv.appendChild(createLogoElement("../../public/icons/sauron.png", "Barad-dûr Logo"));
    appDiv.appendChild(createHeadingText("Lord of Transcendence"));

    // Main container
    const mainContainer = document.createElement("div");
    mainContainer.className = "flex flex-col items-center justify-center min-h-screen p-8";

    const resultsBox = createBoxDiv("tournamentResults");
    resultsBox.className += " max-w-4xl w-full text-center";

    // Winner announcement
    const winnerTitle = createSubheadingText(
        info.currentRound === 0
            ? `${info.winner}`
            : `${info.winner} WINS!`
    );
    winnerTitle.className += info.currentRound === 0
        ? " text-blue-400 text-4xl mb-8"
        : " text-yellow-400 text-4xl mb-8";
    resultsBox.appendChild(winnerTitle);

    // Tournament progress
    const progressDiv = document.createElement("div");
    progressDiv.className = "mb-8 p-6 bg-gray-800/40 rounded-lg border border-amber-700/30";

    const roundInfo = document.createElement("h2");
    roundInfo.className = "text-2xl font-bold text-amber-400 mb-4";

    if (info.currentRound === 0) {
        const roundNames = {
            1: info.tournamentType === "tournament8" ? "Quarterfinals" : "Semifinals",
            2: info.tournamentType === "tournament8" ? "Semifinals" : "Finals",
            3: "Finals"
        };
        roundInfo.textContent = `Up Next: Round 1 - ${roundNames[1]}`;
    } else if (info.currentRound === info.totalRounds) {
        roundInfo.textContent = "TOURNAMENT CHAMPION!";
    } else {
        // Use the actual next round from the backend data
        const nextRound = info.nextRound || (info.currentRound + 1);
        const roundNames = {
            1: info.tournamentType === "tournament8" ? "Quarterfinals" : "Semifinals",
            2: info.tournamentType === "tournament8" ? "Semifinals" : "Finals",
            3: "Finals"
        };
        roundInfo.textContent = `Up Next: Round ${nextRound} - ${roundNames[nextRound as keyof typeof roundNames]}`;
    }
    progressDiv.appendChild(roundInfo);

    // Next players section - only show if tournament is not complete
    if (info.nextPlayers && info.nextPlayers.length > 0 && info.currentRound < info.totalRounds) {
        const nextPlayersDiv = document.createElement("div");
        nextPlayersDiv.className = "mt-4 p-4 bg-slate-700/40 rounded-lg border border-slate-500/30";

        const nextPlayersTitle = document.createElement("h3");
        nextPlayersTitle.className = "text-lg font-bold text-slate-300 mb-2";
        nextPlayersTitle.textContent = info.currentRound === 0
            ? "🎮 First Match:"
            : "⚔️ Next Match:";
        nextPlayersDiv.appendChild(nextPlayersTitle);

        const playersContainer = document.createElement("div");
        playersContainer.className = "flex items-center justify-center gap-4";

        const player1 = document.createElement("span");
        player1.className = "text-white font-semibold text-lg px-3 py-1 bg-indigo-500 rounded";
        player1.textContent = info.nextPlayers[0] || "Player 1";

        const vsText = document.createElement("span");
        vsText.className = "text-amber-400 font-bold text-xl";
        vsText.textContent = "VS";

        const player2 = document.createElement("span");
        player2.className = "text-white font-semibold text-lg px-3 py-1 bg-purple-500 rounded";
        player2.textContent = info.nextPlayers[1] || "Player 2";

        playersContainer.appendChild(player1);
        playersContainer.appendChild(vsText);
        playersContainer.appendChild(player2);
        nextPlayersDiv.appendChild(playersContainer);
        progressDiv.appendChild(nextPlayersDiv);
    }

    resultsBox.appendChild(progressDiv);

    // Action buttons
    const buttonContainer = document.createElement("div");
    // keep container size unchanged; align items vertically and center text inside buttons
    buttonContainer.className = "flex gap-4 justify-center items-center";

    if (info.currentRound === info.totalRounds) {
        // Tournament finished
    const backButton = createButtonLink("/gameMenu", "Back to Menu", "center");
    backButton.className += " text-lg px-8 py-3 bg-green-600 hover:bg-green-700 text-center";
        buttonContainer.appendChild(backButton);
    } else if (info.nextMatch) {
        // Next game ready
        const buttonText = info.currentRound === 0 ? "Start First Game" : "Start Next Game";
        const nextGameButton = createButtonForm(buttonText, "nextGame");
        nextGameButton.className += " text-base px-8 py-3 bg-blue-600 hover:bg-blue-700 text-center";
        nextGameButton.addEventListener("click", (e) => {
            e.preventDefault();
            onNextGame();
        });
        buttonContainer.appendChild(nextGameButton);
        // Exit button
        const exitButton = createButtonLink("/gameMenu", "Exit Tournament", "center");
        exitButton.className += " text-base px-4 py-2 bg-red-600 hover:bg-red-700 ml-4 text-center";
        buttonContainer.appendChild(exitButton);
    }



    resultsBox.appendChild(buttonContainer);
    mainContainer.appendChild(resultsBox);
    appDiv.appendChild(mainContainer);
}
