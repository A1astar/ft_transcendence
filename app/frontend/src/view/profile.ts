import {
    clearDiv,
	createVideoBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createParagraphText,
    createFormElement,
    createLogoElement,
	createButtonForm,
	createBoxDiv
} from "./domElements.js";
//import { ApiClient } from "../apiService.js";

const appDiv = document.getElementById("app");

//! Renders the profile page with placeholder data
export function renderProfile() {
	if (appDiv) {
		clearDiv(appDiv);

		const accountFormDiv = createFormElement("profileForm");
		accountFormDiv.appendChild(createParagraphText("*Username: placeholder*"));
		accountFormDiv.appendChild(createParagraphText("*Email: placeholder*"));

		const sessionFormDiv = createFormElement("sessionForm");
		sessionFormDiv.appendChild(createButtonForm("Logout", "logout"));

		const statFormDiv = createFormElement("statForm");
		statFormDiv.appendChild(createParagraphText("*played: placeholder*"));
		statFormDiv.appendChild(createParagraphText("*Won: placeholder*"));
		statFormDiv.appendChild(createParagraphText("*Lose: placeholder*"));
		statFormDiv.appendChild(createParagraphText("*Win Rate: placeholder*"));

		const accountBoxDiv = createBoxDiv("accountBox");
		accountBoxDiv.appendChild(createSubheadingText("Account"));
		accountBoxDiv.appendChild(accountFormDiv);

		const sessionBoxDiv = createBoxDiv("sessionBox");
		sessionBoxDiv.appendChild(createSubheadingText("Session"));
		sessionBoxDiv.appendChild(sessionFormDiv);

		const statBoxDiv = createBoxDiv("statsBox");
		statBoxDiv.appendChild(createSubheadingText("Game Stats"));
		statBoxDiv.appendChild(statFormDiv);

		appDiv.appendChild(createVideoBackgroundDiv("../backgrounds/Sauron.mp4"));
		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(accountBoxDiv);
		appDiv.appendChild(statBoxDiv);
		appDiv.appendChild(sessionBoxDiv);
	}
}


//! Renders the profile page with API call
// export function renderProfile() {
// 	if (appDiv) {
// 		clearDiv(appDiv);

// 		const userData = ApiClient.get("/authentication/userinfo")

// 		const accountFormDiv = createFormElement("profileForm");
// 		accountFormDiv.appendChild(createParagraphText("Username: " + userData.username));
// 		accountFormDiv.appendChild(createParagraphText("Email: " + userData.email));

// 		const sessionFormDiv = createFormElement("sessionForm");
// 		sessionFormDiv.appendChild(createButtonForm("Logout", "logout"));

// 		const statFormDiv = createFormElement("statForm");
// 		statFormDiv.appendChild(createParagraphText("played: " + userData.gamePlayed));
// 		statFormDiv.appendChild(createParagraphText("Won: " + userData.gameWon));
// 		statFormDiv.appendChild(createParagraphText("Lost: " + userData.gameLost));
// 		statFormDiv.appendChild(createParagraphText("Win Rate: " + userData.winRate + "%"));

// 		const accountBoxDiv = createBoxDiv("accountBox");
// 		accountBoxDiv.appendChild(createSubheadingText("Account"));
// 		accountBoxDiv.appendChild(accountFormDiv);

// 		const sessionBoxDiv = createBoxDiv("sessionBox");
// 		sessionBoxDiv.appendChild(createSubheadingText("Session"));
// 		sessionBoxDiv.appendChild(sessionFormDiv);

// 		const statBoxDiv = createBoxDiv("statsBox");
// 		statBoxDiv.appendChild(createSubheadingText("Game Stats"));
// 		statBoxDiv.appendChild(statFormDiv);

// 		appDiv.appendChild(createVideoBackgroundDiv("../backgrounds/Sauron.mp4"));
// 		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
// 		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
// 		appDiv.appendChild(accountBoxDiv);
// 		appDiv.appendChild(statBoxDiv);
// 		appDiv.appendChild(sessionBoxDiv);
// 	}
// }
