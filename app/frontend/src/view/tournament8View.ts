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

const appDiv = document.getElementById("app");

export function renderTournament8Lobby() {
	if(appDiv) {
		clearDiv(appDiv);


		appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Sauron.mp4"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
	}
}

