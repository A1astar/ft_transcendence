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

export function renderLogin() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createGifBackgroundDiv("../../backgrounds/Mordor.gif"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		const formDiv1 = createFormElement();

		formDiv1.appendChild(createSubheadingText("Join the realm of shadows with account"));
		formDiv1.appendChild(createInputElement("text", "username", "Username/email"));
		formDiv1.appendChild(createInputElement("password", "password", "Password"));
		formDiv1.appendChild(createButtonLink("/api/authentication/login", "Login"));

		const formDiv2 = createFormElement();

		formDiv2.appendChild(createSubheadingText("Join the realm of shadows with Oauth2"));
		formDiv2.appendChild(createButtonLink("/api/authentication/google", "Login with Google"));
		formDiv2.appendChild(createButtonLink("/api/authentication/intra-42", "Login with Intra 42"));

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(formDiv1);
		appDiv.appendChild(formDiv2);
	}
}


