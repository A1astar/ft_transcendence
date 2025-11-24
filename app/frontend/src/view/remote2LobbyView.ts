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
	createButtonLink
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
	}
}

