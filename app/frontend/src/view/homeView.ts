import {
    clearDiv,
	createGifBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createFormElement,
    createButtonLink,
    createLogoElement,
	createBoxDiv
} from "./utils.js";

const appDiv = document.getElementById("app");

export function renderHome() {
	if (appDiv) {
		clearDiv(appDiv);

		const formDiv = createFormElement("homeForm");
		formDiv.appendChild(createButtonLink("/login", "Login"));
		formDiv.appendChild(createButtonLink("/register", "Register"));
		formDiv.appendChild(createButtonLink("/guest", "Continue as Guest"));

		const boxDiv = createBoxDiv("Form Container");
		boxDiv.appendChild(createSubheadingText("Enter the realm of shadows"));
		boxDiv.appendChild(formDiv);

		appDiv.appendChild(createGifBackgroundDiv("../../public/backgrounds/Mordor.gif"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(boxDiv);
	}
}
