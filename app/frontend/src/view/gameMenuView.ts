import {
    clearDiv,
	createVideoBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createFormElement,
    createButtonLink,
    createLogoElement,
	createButtonForm,
	createBoxDiv

<<<<<<< HEAD:app/frontend/src/view/gameMenu.ts
} from "./domElements.js";
=======
} from "./utils.js";
>>>>>>> dev:app/frontend/src/view/gameMenuView.ts

const appDiv = document.getElementById("app");

export function renderGameMenu() {
	if (appDiv) {
		clearDiv(appDiv);

		const LocalGameformDiv = createFormElement("localGameForm");
		LocalGameformDiv.appendChild(createButtonForm("Local", "local"));

		const RemoteGameformDiv = createFormElement("remoteGameForm");
		RemoteGameformDiv.appendChild(createButtonForm("Remote 2 players", "Remote2"));
		RemoteGameformDiv.appendChild(createButtonForm("Remote 4 players", "Remote4"));

		const TournamentGameformDiv = createFormElement("tournamentGameForm");
		TournamentGameformDiv.appendChild(createButtonForm("Tournament 4 players", "Tournament4"));
		TournamentGameformDiv.appendChild(createButtonForm("Tournament 8 players", "Tournament8"));


		const localBox = createBoxDiv("localBox");
		localBox.appendChild(createSubheadingText("Local Battle"));
		localBox.appendChild(LocalGameformDiv);

		const remoteBox = createBoxDiv("remoteBox");
		remoteBox.appendChild(createSubheadingText("Remote Battle"));
		remoteBox.appendChild(RemoteGameformDiv);

		const tournamentBox = createBoxDiv("tournamentBox");
		tournamentBox.appendChild(createSubheadingText("Tournament for Middle-earth"));
		tournamentBox.appendChild(TournamentGameformDiv);

<<<<<<< HEAD:app/frontend/src/view/gameMenu.ts
		appDiv.appendChild(createVideoBackgroundDiv("../backgrounds/Sauron.mp4"));
		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
=======
		appDiv.appendChild(createVideoBackgroundDiv("../public/backgrounds/Sauron.mp4"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
>>>>>>> dev:app/frontend/src/view/gameMenuView.ts
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(localBox);
		appDiv.appendChild(remoteBox);
		appDiv.appendChild(tournamentBox);
		appDiv.appendChild(createButtonLink("/profile", "Profile", "top-right"));
		appDiv.appendChild(createButtonLink("/settings", "Settings", "top-left"));
	}
}
