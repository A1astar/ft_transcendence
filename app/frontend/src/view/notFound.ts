import {
    clearDiv,
	createGifBackgroundDiv,
    createHeadingText,
    createParagraphText,
    createButtonLink,
} from "./domElements.js";

const backgroundDiv = document.getElementById("background");
const appDiv = document.getElementById("app");

export function renderNotFound() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createGifBackgroundDiv("../../backgrounds/Mordor.gif"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		appDiv.appendChild(createHeadingText("404: page not found"));
		appDiv.appendChild(createParagraphText('"Not all those who wander are lost..."'));
		appDiv.appendChild(createButtonLink("/", "Back to the Mordor"));
	}
}
