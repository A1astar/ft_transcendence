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

		// Main container
		const mainContainer = document.createElement("div");
		mainContainer.className = "flex flex-col items-center justify-center min-h-screen p-8";

		const box = createBoxDiv("remote2Setup");
		box.className += " max-w-lg w-full";

		const title = createSubheadingText("Join a 2-player remote match");
		box.appendChild(title);

		// Alias input
		const inputForm = createFormElement("remote2Form");
		const aliasInput = createInputElement("text", "remote2Alias", "Enter alias for this match");
		aliasInput.id = "remote2AliasInput";
		aliasInput.className += " w-full mb-4";
		// start with an empty input; user should enter alias for this session
		inputForm.appendChild(aliasInput);

		// Join button
		const joinButton = createButtonForm("Join Queue", "joinRemote2");
		joinButton.id = "joinRemote2Button";
		joinButton.className += " w-full text-lg py-2";
		inputForm.appendChild(joinButton);

		box.appendChild(inputForm);
		mainContainer.appendChild(box);
		appDiv.appendChild(mainContainer);
	}
}

