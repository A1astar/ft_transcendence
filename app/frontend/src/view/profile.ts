import {
    clearDiv,
	createGifBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createParagraphText,
    createFormElement,
    createLogoElement,
	createButtonForm,
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

		const formDiv = createFormElement("profileForm");
		formDiv.appendChild(createSubheadingText("Your Profile"));
		formDiv.appendChild(createParagraphText("Username: [username]"));
		formDiv.appendChild(createParagraphText("Email: [email]"));
		formDiv.appendChild(createButtonForm("Logout", "logout"));

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(formDiv);
	}
}
