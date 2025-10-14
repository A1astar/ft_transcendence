import {
    clearDiv,
	createGifBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createParagraphText,
    createFormElement,
    createInputElement,
    createButtonLink,
    createLogoElement,
} from "./domElements.js";

const backgroundDiv = document.getElementById("background");
const appDiv = document.getElementById("app");

export function renderSettings() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createGifBackgroundDiv("../../backgrounds/Mordor.gif"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		const formDiv = createFormElement();

		formDiv.appendChild(createSubheadingText("Settings"));
		formDiv.appendChild(createParagraphText("Change your settings here."));
		formDiv.appendChild(createInputElement("text", "username", "New Username"));
		formDiv.appendChild(createInputElement("email", "email", "New Email"));
		formDiv.appendChild(createButtonLink("/api/user/update", "Update Settings"));

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(formDiv);
	}
}
