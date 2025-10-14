import {
    clearDiv,
	createGifBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createFormElement,
    createButtonLink,
    createLogoElement,
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
		LocalGameformDiv.appendChild(createButtonLink("/api/game-orchestration/local", "Local"));

		const RemoteGameformDiv = createFormElement();
		RemoteGameformDiv.appendChild(createSubheadingText("Remote Battle"));
		RemoteGameformDiv.appendChild(createButtonLink("/api/game-orchestration/remote2", "Remote 2 players"));
		RemoteGameformDiv.appendChild(createButtonLink("/api/game-orchestration/remote4", "Remote 4 players"));

		const TournamentGameformDiv = createFormElement();
		TournamentGameformDiv.appendChild(createSubheadingText("Tournament for Middle-earth"));
		TournamentGameformDiv.appendChild(createButtonLink("/api/game-orchestration/tournament4", "Tournament 4 players"));
		TournamentGameformDiv.appendChild(createButtonLink("/api/game-orchestration/tournament8", "Tournament 8 players"));


		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(LocalGameformDiv);
		appDiv.appendChild(RemoteGameformDiv);
		appDiv.appendChild(TournamentGameformDiv);
		appDiv.appendChild(createButtonLink("/api/authentication/profile", "Profile", "top-right"));
		appDiv.appendChild(createButtonLink("/api/authentication/settings", "Settings", "top-left"));
	}
}
