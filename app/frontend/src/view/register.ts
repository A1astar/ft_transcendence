import {
    clearDiv,
	createGifBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createFormElement,
    createLogoElement,
	createButtonForm,
	createInputElement
} from "./domElements.js";

const backgroundDiv = document.getElementById("background");
const appDiv = document.getElementById("app");

export function renderRegister() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createGifBackgroundDiv("../../backgrounds/Mordor.gif"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		const formDiv = createFormElement("registerForm");
		formDiv.appendChild(createSubheadingText("Create your account"));
		formDiv.appendChild(createInputElement("text", "username", "Username"));
		formDiv.appendChild(createInputElement("email", "email", "Email"));
		formDiv.appendChild(createInputElement("password", "password", "Password"));
		formDiv.appendChild(createInputElement("password", "confirmPassword", "Confirm Password"));
		formDiv.appendChild(createButtonForm("Register", "register"));

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(formDiv);
	}
}
