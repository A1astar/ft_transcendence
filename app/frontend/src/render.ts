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

export function renderLogin() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createGifBackgroundDiv("../backgrounds/Mordor.gif"));
	}
	if (appDiv) {
        clearDiv(appDiv);

        const formDiv = createFormElement();

        formDiv.appendChild(createSubheadingText("Join the realm of shadows"));
        formDiv.appendChild(createInputElement("text", "username", "Username"));
        formDiv.appendChild(createInputElement("password", "password", "Password"));
        formDiv.appendChild(createButtonLink("/", "Login"));

        appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
        appDiv.appendChild(createHeadingText("Lord of Transcendence"));
        appDiv.appendChild(formDiv);
    }
}

export function renderNotFound() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createGifBackgroundDiv("../backgrounds/Mordor.gif"));
	}
    if (appDiv) {
        clearDiv(appDiv);

        appDiv.appendChild(createLogoElement("../icons/oneRing.png", "One Ring Logo"));
        appDiv.appendChild(createHeadingText("404: page not found"));
        appDiv.appendChild(createParagraphText('"Not all those who wander are lost..."'));
        appDiv.appendChild(createButtonLink("/", "Back to the Mordor"));
    }
}

export function renderGame() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createGifBackgroundDiv("../backgrounds/Mordor.gif"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Game Page"));
		appDiv.appendChild(createParagraphText('"The world is changed. I feel it in the water, I feel it in the earth, I smell it in the air."'));
		appDiv.appendChild(createButtonLink("/dashboard", "Back to Dashboard"));
	}
}

export function renderSettings() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createGifBackgroundDiv("../backgrounds/Mordor.gif"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Settings Page"));
		appDiv.appendChild(createParagraphText('"Even the smallest person can change the course of the future."'));
		appDiv.appendChild(createButtonLink("/dashboard", "Back to Dashboard"));
	}
}

export function renderProfile() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createVideoBackgroundDiv("../backgrounds/Gandalf.mp4"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Profile Page"));
		appDiv.appendChild(createParagraphText('"All we have to decide is what to do with the time that is given us."'));
		appDiv.appendChild(createButtonLink("/dashboard", "Back to Dashboard"));
	}
}

export function renderDashboard() {
	if (backgroundDiv) {
		clearDiv(backgroundDiv);
		backgroundDiv.appendChild(createVideoBackgroundDiv("../backgrounds/Sauron.mp4"));
	}
	if (appDiv) {
		clearDiv(appDiv);

		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Dashboard Page"));
		appDiv.appendChild(createParagraphText('"There is some good in this world, and it’s worth fighting for."'));
		appDiv.appendChild(createButtonLink("/game", "Enter the Game"));
		appDiv.appendChild(createButtonLink("/profile", "View Profile"));
		appDiv.appendChild(createButtonLink("/settings", "Settings"));
	}
}
