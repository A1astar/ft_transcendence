import {
	clearDiv,
	createVideoBackgroundDiv,
	createHeadingText,
	createSubheadingText,
	createParagraphText,
	createLogoElement,
	createBoxDiv,
} from "./utils.js";
import { renderGame } from "./gameView.js";
import { renderTournamentIntermediate } from "./tournamentIntermediateView.js";

const appDiv = document.getElementById("app");

export function renderRemote2Lobby() {
	if(appDiv) {
		clearDiv(appDiv);

		appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Sauron.mp4"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));

		// Main container
		const mainContainer = document.createElement("div");
		mainContainer.className = "flex flex-col items-center justify-center min-h-screen p-8";

		const box = createBoxDiv("remote2Setup");
		box.className += " max-w-lg w-full";

		const title = createSubheadingText("Join a 2-player remote match");
		box.appendChild(title);

		const info = createParagraphText("Matchmaking will start automatically for logged-in users.");
		info.className += " mb-4";
		box.appendChild(info);
		mainContainer.appendChild(box);
		appDiv.appendChild(mainContainer);
	}
}

