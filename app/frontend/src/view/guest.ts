import {
    clearDiv,
	createGifBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createFormElement,
    createInputElement,
    createButtonLink,
    createLogoElement,
} from "./domElements.js";

const backgroundDiv = document.getElementById("background");
const appDiv = document.getElementById("app");

export function renderGuestLogin() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createGifBackgroundDiv("../../backgrounds/Mordor.gif"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		const formDiv = createFormElement();

		formDiv.appendChild(createSubheadingText("Join the realm of shadows as guest"));
		formDiv.appendChild(createInputElement("text", "username", "Pseudo"));
		formDiv.appendChild(createButtonLink("/api/authentication/guest-session", "Continue as Guest"));

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(formDiv);
	}
}
