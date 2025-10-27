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
<<<<<<< HEAD:app/frontend/src/view/guest.ts
} from "./domElements.js";
=======
} from "./utils.js";
>>>>>>> dev:app/frontend/src/view/guestView.ts

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

<<<<<<< HEAD:app/frontend/src/view/guest.ts
		appDiv.appendChild(createVideoBackgroundDiv("../../backgrounds/Gandalf.mp4"));
		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
=======
		appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
>>>>>>> dev:app/frontend/src/view/guestView.ts
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(guestBoxDiv);
	}
}
