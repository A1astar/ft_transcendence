import {
    clearDiv,
	createGifBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createFormElement,
    createButtonLink,
    createLogoElement,
	createBoxDiv
<<<<<<< HEAD:app/frontend/src/view/home.ts
} from "./domElements.js";
=======
} from "./utils.js";
>>>>>>> dev:app/frontend/src/view/homeView.ts

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

<<<<<<< HEAD:app/frontend/src/view/home.ts
		appDiv.appendChild(createGifBackgroundDiv("../../backgrounds/Mordor.gif"));
		appDiv.appendChild(createLogoElement("../icons/sauron.png", "Barad-dûr Logo"));
=======
		appDiv.appendChild(createGifBackgroundDiv("../../public/backgrounds/Mordor.gif"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
>>>>>>> dev:app/frontend/src/view/homeView.ts
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(boxDiv);
	}
}
