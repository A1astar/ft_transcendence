import {
	clearDiv,
	createVideoBackgroundDiv,
	createHeadingText,
	createSubheadingText,
	createParagraphText,
	createLogoElement,
	createBoxDiv,
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

		const info = createParagraphText("Matchmaking will start automatically for logged-in users.");
		info.className += " mb-4";
		box.appendChild(info);
		mainContainer.appendChild(box);
		appDiv.appendChild(mainContainer);
	}
}

