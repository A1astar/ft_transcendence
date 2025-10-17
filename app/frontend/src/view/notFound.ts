import {
    clearDiv,
	createGifBackgroundDiv,
    createHeadingText,
    createParagraphText,
    createButtonLink,
	createBoxDiv
} from "./domElements.js";

const appDiv = document.getElementById("app");

export function renderNotFound() {

	if (appDiv) {
		clearDiv(appDiv);

		const backToLoginBox = createBoxDiv("backToLoginBox");
		backToLoginBox.appendChild(createParagraphText('"Not all those who wander are lost..."'));
		backToLoginBox.appendChild(createButtonLink("/", "Back to the Mordor"));

		appDiv.appendChild(createGifBackgroundDiv("../../backgrounds/Mordor.gif"));
		appDiv.appendChild(createHeadingText("404: page not found"));
		appDiv.appendChild(backToLoginBox);
	}
}
