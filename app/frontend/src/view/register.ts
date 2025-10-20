import {
    clearDiv,
	createGifBackgroundDiv,
	createVideoBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createFormElement,
    createLogoElement,
	createButtonForm,
	createInputElement,
	createBoxDiv
} from "./domElements.js";

const appDiv = document.getElementById("app");

export function renderRegister() {

	if (appDiv) {
		clearDiv(appDiv);

		const formDiv = createFormElement("registerForm");
		formDiv.appendChild(createInputElement("text", "username", "Username"));
		formDiv.appendChild(createInputElement("email", "email", "Email"));
		formDiv.appendChild(createInputElement("password", "password", "Password"));
		formDiv.appendChild(createInputElement("password", "confirmPassword", "Confirm Password"));
		formDiv.appendChild(createButtonForm("Register", "register"));

		const registerBoxDiv = createBoxDiv("registerBoxDiv");
		registerBoxDiv.appendChild(createSubheadingText("Create your account"));
		registerBoxDiv.appendChild(formDiv);

		appDiv.appendChild(createVideoBackgroundDiv("../../backgrounds/Gandalf.mp4"));
		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(registerBoxDiv);
	}
}
