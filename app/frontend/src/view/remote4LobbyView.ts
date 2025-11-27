import {
	clearDiv,
	createVideoBackgroundDiv,
	createHeadingText,
	createSubheadingText,
	createParagraphText,
	createFormElement,
	createInputElement,
	createLogoElement,
	createButtonForm,
	createBoxDiv,
	createButtonLink
} from "./utils.js";

const appDiv = document.getElementById("app");

export function renderRemote4Lobby() {
	if(appDiv) {
		clearDiv(appDiv);

		appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Sauron.mp4"));

		const mainContainer = document.createElement("div");
		mainContainer.className = "flex flex-col items-center justify-center min-h-screen p-8";

		const logo = createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo");
		logo.className += " mb-6";
		mainContainer.appendChild(logo);

		const heading = createHeadingText("Lord of Transcendence");
		heading.className += " mb-8 mt-0 text-3xl text-center";
		heading.style.marginTop = "0px";
		mainContainer.appendChild(heading);

		const box = createBoxDiv("remote4Setup");
		box.className += " max-w-lg w-full";

		const title = createSubheadingText("Join a 4-player remote match");
		title.className += " mb-4 text-xl text-center";
		box.appendChild(title);

		const inputForm = createFormElement("remote4Form");
		const aliasInput = createInputElement("text", "remote4Alias", "Enter alias for this match");
		aliasInput.id = "remote4AliasInput";
		aliasInput.className += " w-full mb-4";
		inputForm.appendChild(aliasInput);

		const joinButton = createButtonForm("Join Queue", "joinRemote4");
		joinButton.id = "joinRemote4Button";
		joinButton.className += " w-full text-lg py-2";
		inputForm.appendChild(joinButton);

		box.appendChild(inputForm);
		mainContainer.appendChild(box);
		appDiv.appendChild(mainContainer);
	}
}

