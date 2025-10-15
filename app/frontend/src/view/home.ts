import {
    clearDiv,
	createVideoBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createFormElement,
    createButtonLink,
    createLogoElement,
} from "./domElements.js";

const backgroundDiv = document.getElementById("background");
const appDiv = document.getElementById("app");

export function renderHome() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createVideoBackgroundDiv("../../backgrounds/Mordor.gif"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		const formDiv = createFormElement("homeForm");
		formDiv.appendChild(createSubheadingText("Enter the realm of shadows"));
		formDiv.appendChild(createButtonLink("/login", "Login"));
		formDiv.appendChild(createButtonLink("/register", "Register"));
		formDiv.appendChild(createButtonLink("/guest", "Continue as Guest"));

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(formDiv);
	}
}
