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
import { getUsername } from "../authService.js";

const appDiv = document.getElementById("app");

export async function renderLocalLobby() {
	if (appDiv) {
		clearDiv(appDiv);
		const guestUsername = (await getUsername()) ?? "";

		const player1box = createBoxDiv("player1");
		const player2box = createBoxDiv("player2");

		player1box.appendChild(createSubheadingText("Pseudo:"));
		player1box.appendChild(createParagraphText(guestUsername, "center"));

		player2box.appendChild(createSubheadingText("Pseudo:"));
		player2box.appendChild(createInputElement("Enter Pseudo", "Enter Pseudo", "Enter Pseudo"));

		appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Sauron.mp4"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
	}
}
