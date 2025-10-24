import {
    clearDiv,
    createVideoBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createParagraphText,
    createFormElement,
    createLogoElement,
    createButtonForm,
    createBoxDiv,
} from "./utils.js";
import {ApiClient} from "../apiService.js";

const appDiv = document.getElementById("app");

export async function renderProfile() {
    if (appDiv) {
        clearDiv(appDiv);

        try {
            const res = await ApiClient.get("/api/auth/userinfo");
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const userData = await res.json();

            const accountFormDiv = createFormElement("profileForm");
            accountFormDiv.appendChild(createParagraphText("Username: " + userData.username));
            accountFormDiv.appendChild(createParagraphText("Email: " + userData.email));

            const sessionFormDiv = createFormElement("sessionForm");
            sessionFormDiv.appendChild(createButtonForm("Logout", "logout"));

            const statFormDiv = createFormElement("statForm");
            statFormDiv.appendChild(createParagraphText("played: " + userData.gamePlayed));
            statFormDiv.appendChild(createParagraphText("Won: " + userData.gameWon));
            statFormDiv.appendChild(createParagraphText("Lost: " + userData.gameLost));
            statFormDiv.appendChild(createParagraphText("Win Rate: " + userData.winRate + "%"));

            const accountBoxDiv = createBoxDiv("accountBox");
            accountBoxDiv.appendChild(createSubheadingText("Account"));
            accountBoxDiv.appendChild(accountFormDiv);

            const sessionBoxDiv = createBoxDiv("sessionBox");
            sessionBoxDiv.appendChild(createSubheadingText("Session"));
            sessionBoxDiv.appendChild(sessionFormDiv);

            const statBoxDiv = createBoxDiv("statsBox");
            statBoxDiv.appendChild(createSubheadingText("Game Stats"));
            statBoxDiv.appendChild(statFormDiv);

            appDiv.appendChild(createVideoBackgroundDiv("../public/backgrounds/Sauron.mp4"));
            appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
            appDiv.appendChild(createHeadingText("Lord of Transcendence"));
            appDiv.appendChild(accountBoxDiv);
            appDiv.appendChild(statBoxDiv);
            appDiv.appendChild(sessionBoxDiv);

        } catch (err) {
            const box = createBoxDiv("errorBox");
            box.appendChild(createSubheadingText("Error"));
            box.appendChild(createParagraphText("Failed to load profile"));
            appDiv.appendChild(box);
        }
    }
}
