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

export function endGameView(winner: string, appDiv: HTMLElement) {
	if(appDiv) {
		clearDiv(appDiv);

		const winnerBoxDiv = createBoxDiv("Winner display");
		winnerBoxDiv.appendChild(createSubheadingText(`Winner: ${winner}`));

		const button = createButtonLink("/gameMenu", "Back to Menu");

		appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(winnerBoxDiv);
		appDiv.appendChild(button);
	}
}
