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
} from "./utils.js";

const appDiv = document.getElementById("app");

export function renderTournament8Lobby() {
    if (appDiv) {
        clearDiv(appDiv);

        appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));

        const mainContainer = document.createElement("div");
        mainContainer.className = "flex flex-col items-center justify-center min-h-screen p-8";

        const logo = createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo");
        logo.className += " mb-6";
        mainContainer.appendChild(logo);

        const heading = createHeadingText("Lord of Transcendence");
        heading.className += " mb-8 mt-0 text-3xl text-center";
        heading.style.marginTop = "0px";
        mainContainer.appendChild(heading);

        const tournamentBox = createBoxDiv("tournamentSetup");
        tournamentBox.className += " max-w-6xl w-full";

        const titleDiv = document.createElement("div");
        titleDiv.className = "text-center mb-8";
        const title = createSubheadingText("Enter Player Names for Tournament");
        title.className += " mb-4 text-xl text-center";
        titleDiv.appendChild(title);
        tournamentBox.appendChild(titleDiv);

        const playersGrid = document.createElement("div");
        playersGrid.className = "grid grid-cols-4 gap-4 mb-8";

        for (let i = 1; i <= 8; i++) {
            const playerBox = document.createElement("div");
            playerBox.className = "bg-gray-800/40 p-4 rounded-lg border border-amber-700/30";

            const playerLabel = document.createElement("h3");
            playerLabel.className = "text-lg font-bold text-amber-400 mb-3 text-center";
            playerLabel.textContent = `Player ${i}`;

            const playerInput = createInputElement("text", `player${i}`, `Player ${i}`);
            playerInput.className += " w-full text-sm";
            playerInput.maxLength = 20;
            playerInput.required = true;

            playerBox.appendChild(playerLabel);
            playerBox.appendChild(playerInput);
            playersGrid.appendChild(playerBox);
        }

        tournamentBox.appendChild(playersGrid);

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "text-center";

        const startButton = createButtonForm("Start Tournament", "startTournament");
        startButton.className += " text-lg px-8 py-3";

        buttonContainer.appendChild(startButton);
        tournamentBox.appendChild(buttonContainer);

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
