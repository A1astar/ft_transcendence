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

		const LocalGameformDiv = createFormElement();
		LocalGameformDiv.appendChild(createSubheadingText("Local Battle"));
		LocalGameformDiv.appendChild(createButtonForm("local", "Local"));

		const RemoteGameformDiv = createFormElement();
		RemoteGameformDiv.appendChild(createSubheadingText("Remote Battle"));
		RemoteGameformDiv.appendChild(createButtonForm("Remote2", "Remote 2 players"));
		RemoteGameformDiv.appendChild(createButtonForm("Remote4", "Remote 4 players"));4

		const TournamentGameformDiv = createFormElement();
		TournamentGameformDiv.appendChild(createSubheadingText("Tournament for Middle-earth"));
		TournamentGameformDiv.appendChild(createButtonForm("Tournament4", "Tournament 4 players"));
		TournamentGameformDiv.appendChild(createButtonForm("Tournament8", "Tournament 8 players"));

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(LocalGameformDiv);
		appDiv.appendChild(RemoteGameformDiv);
		appDiv.appendChild(TournamentGameformDiv);
		appDiv.appendChild(createButtonLink("/profile", "Profile", "top-right"));
		appDiv.appendChild(createButtonLink("/settings", "Settings", "top-left"));
	}
}
