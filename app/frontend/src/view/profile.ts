import {
    clearDiv,
	createGifBackgroundDiv,
	createVideoBackgroundDiv,
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

export function renderProfile() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createGifBackgroundDiv("../../backgrounds/Mordor.gif"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		const formDiv = createFormElement();

		formDiv.appendChild(createSubheadingText("Your Profile"));
		formDiv.appendChild(createParagraphText("Username: [username]"));
		formDiv.appendChild(createParagraphText("Email: [email]"));
		formDiv.appendChild(createButtonLink("/api/authentication/logout", "Logout"));

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(formDiv);
	}
}
