import {
    clearDiv,
	createGifBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createFormElement,
    createButtonLink,
    createLogoElement,
	createButtonForm,
} from "./domElements.js";

const backgroundDiv = document.getElementById("background");
const appDiv = document.getElementById("app");

export function renderGameMenu() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createGifBackgroundDiv("../../backgrounds/Mordor.gif"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		const LocalGameformDiv = createFormElement("localGameForm");
		LocalGameformDiv.appendChild(createSubheadingText("Local Battle"));
		LocalGameformDiv.appendChild(createButtonForm("Local", "local"));

		const RemoteGameformDiv = createFormElement("remoteGameForm");
		RemoteGameformDiv.appendChild(createSubheadingText("Remote Battle"));
		RemoteGameformDiv.appendChild(createButtonForm("Remote 2 players", "Remote2"));
		RemoteGameformDiv.appendChild(createButtonForm("Remote 4 players", "Remote4"));

		const TournamentGameformDiv = createFormElement("tournamentGameForm");
		TournamentGameformDiv.appendChild(createSubheadingText("Tournament for Middle-earth"));
		TournamentGameformDiv.appendChild(createButtonForm("Tournament 4 players", "Tournament4"));
		TournamentGameformDiv.appendChild(createButtonForm("Tournament 8 players", "Tournament8"));

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(LocalGameformDiv);
		appDiv.appendChild(RemoteGameformDiv);
		appDiv.appendChild(TournamentGameformDiv);
		appDiv.appendChild(createButtonLink("/profile", "Profile", "top-right"));
		appDiv.appendChild(createButtonLink("/settings", "Settings", "top-left"));
	}
}
