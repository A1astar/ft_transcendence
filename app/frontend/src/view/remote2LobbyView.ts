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

		const inputForm = createFormElement("remote2Form");
		const aliasInput = createInputElement("text", "remote2Alias", "Enter alias for this match");
		aliasInput.id = "remote2AliasInput";
		aliasInput.className += " w-full mb-4";
		inputForm.appendChild(aliasInput);

		const joinButton = createButtonForm("Join Queue", "joinRemote2");
		joinButton.id = "joinRemote2Button";
		joinButton.className += " w-full text-lg py-2";
		inputForm.appendChild(joinButton);

		box.appendChild(inputForm);
		mainContainer.appendChild(box);

		appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Sauron.mp4"));
		appDiv.appendChild(mainContainer);
	}
}

