import {
    clearDiv,
	createVideoBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createFormElement,
    createInputElement,
    createLogoElement,
	createButtonForm,
	createBoxDiv
} from "./utils.js";

const appDiv = document.getElementById("app");

export function renderGuestLogin() {
	if (appDiv) {
		clearDiv(appDiv);

		const formDiv = createFormElement("guestForm");
		formDiv.appendChild(createInputElement("text", "username", "Pseudo"));
		formDiv.appendChild(createButtonForm("Continue as Guest", "guest"));

		const guestBoxDiv = createBoxDiv("guestBoxDiv");
		guestBoxDiv.appendChild(createSubheadingText("Join the realm of shadows as guest"));
		guestBoxDiv.appendChild(formDiv);

		appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(guestBoxDiv);
	}
}
