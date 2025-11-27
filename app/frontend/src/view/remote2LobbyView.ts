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

		const mainContainer = document.createElement("div");
		mainContainer.className = "flex flex-col items-center justify-center min-h-screen p-8";

		const logo = createLogoElement("../../public/icons/sauron.png", "Barad-dûr Logo");
		logo.className += " mb-6";
		mainContainer.appendChild(logo);

		const heading = createHeadingText("Lord of Transcendence");
		heading.className += " mb-8 mt-2 text-3xl text-center";
		mainContainer.appendChild(heading);

		const box = createBoxDiv("remote2Setup");
		box.className += " max-w-lg w-full";

		const title = createSubheadingText("Join a 2-player remote match");
		title.className += " mb-4 text-xl text-center";
		box.appendChild(title);

		const info = createParagraphText("Matchmaking will start automatically for logged-in users.");
		info.className += " mb-4";
		box.appendChild(info);
		mainContainer.appendChild(box);

		appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Sauron.mp4"));
		appDiv.appendChild(mainContainer);
	}
}

