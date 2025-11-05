import {
    clearDiv,
	createGifBackgroundDiv,
    createHeadingText,
    createParagraphText,
    createButtonLink,
	createBoxDiv
} from "./utils.js";

const appDiv = document.getElementById("app");

export async function renderPongRoom() {
    if(appDiv) {
        clearDiv(appDiv);

        const playerOneBox = createBoxDiv("player-one");
        playerOneBox.appendChild(createParagraphText("player one"));

        const playerTwoBox = createBoxDiv("player-two");

        appDiv.appendChild(createHeadingText("Helllo"))
        appDiv.appendChild(playerOneBox);
        appDiv.appendChild(playerTwoBox);
    }

}
