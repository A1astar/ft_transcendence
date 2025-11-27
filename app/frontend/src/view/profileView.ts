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

            appDiv.appendChild(createVideoBackgroundDiv("../public/backgrounds/Sauron.mp4"));

            const mainContainer = document.createElement("div");
            mainContainer.className =
                "flex flex-col items-center justify-center min-h-screen p-8 relative z-10";

            const logo = createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo");
            logo.className += " mb-6";
            mainContainer.appendChild(logo);

            const heading = createHeadingText("Lord of Transcendence");
            heading.className += " mb-8 mt-0 text-3xl text-center";
            heading.style.marginTop = "0px";
            mainContainer.appendChild(heading);

            const boxesRow = document.createElement("div");
            boxesRow.className =
                "flex flex-col md:flex-row gap-4 w-full max-w-lg justify-center items-stretch mb-2";

            const accountBoxDiv = createBoxDiv("accountBox");
            accountBoxDiv.className += " flex-1 px-3 py-1 min-w-[320px] max-w-[480px]";
            accountBoxDiv.appendChild(createSubheadingText("Account"));
            const accountFormDiv = createFormElement("profileForm");
            const usernameBox = document.createElement("div");
            usernameBox.className = "bg-gray-800/30 rounded-lg p-2 mb-2 flex flex-col items-center";
            const usernameLabel = createParagraphText("Username:");
            usernameLabel.className += " font-semibold mb-1";
            usernameBox.appendChild(usernameLabel);
            const usernameValue = createParagraphText(userData.username);
            usernameValue.className += " text-lg";
            usernameBox.appendChild(usernameValue);
            accountFormDiv.appendChild(usernameBox);

            const emailBox = document.createElement("div");
            emailBox.className =
                "bg-gray-800/30 rounded-lg px-2 py-1 mb-1 flex flex-col items-center";
            const emailLabel = createParagraphText("Email:");
            emailLabel.className += " font-semibold mb-1";
            emailBox.appendChild(emailLabel);
            const emailValue = createParagraphText(userData.email);
            emailValue.className += " text-lg";
            emailBox.appendChild(emailValue);
            accountFormDiv.appendChild(emailBox);
            accountBoxDiv.appendChild(accountFormDiv);

            const statBoxDiv = createBoxDiv("statsBox");
            statBoxDiv.className += " flex-1 px-3 py-1 min-w-[320px] max-w-[480px]";
            statBoxDiv.appendChild(createSubheadingText("Game Stats"));

            const statRow1 = document.createElement("div");
            statRow1.className = "flex flex-row gap-2 mb-1";

            const playedBox = document.createElement("div");
            playedBox.className =
                "bg-gray-800/30 rounded-lg px-2 py-1 flex-1 flex flex-col items-center";
            const playedLabel = createParagraphText("Played:");
            playedLabel.className += " font-semibold mb-1";
            playedBox.appendChild(playedLabel);
            const playedValue = createParagraphText(userData.gamePlayed);
            playedValue.className += " text-lg";
            playedBox.appendChild(playedValue);
            statRow1.appendChild(playedBox);

            const winRateBox = document.createElement("div");
            winRateBox.className =
                "bg-gray-800/30 rounded-lg px-2 py-1 flex-1 flex flex-col items-center";
            const winRateLabel = createParagraphText("Win Rate:");
            winRateLabel.className += " font-semibold mb-1";
            winRateBox.appendChild(winRateLabel);
            const winRateValue = createParagraphText(userData.winRate + "%");
            winRateValue.className += " text-lg";
            winRateBox.appendChild(winRateValue);
            statRow1.appendChild(winRateBox);

            const statRow2 = document.createElement("div");
            statRow2.className = "flex flex-row gap-2 mb-1";

            const wonBox = document.createElement("div");
            wonBox.className =
                "bg-gray-800/30 rounded-lg px-2 py-1 flex-1 flex flex-col items-center";
            const wonLabel = createParagraphText("Won:");
            wonLabel.className += " font-semibold mb-1";
            wonBox.appendChild(wonLabel);
            const wonValue = createParagraphText(userData.gameWon);
            wonValue.className += " text-lg";
            wonBox.appendChild(wonValue);
            statRow2.appendChild(wonBox);

            const lostBox = document.createElement("div");
            lostBox.className =
                "bg-gray-800/30 rounded-lg px-2 py-1 flex-1 flex flex-col items-center";
            const lostLabel = createParagraphText("Lost:");
            lostLabel.className += " font-semibold mb-1";
            lostBox.appendChild(lostLabel);
            const lostValue = createParagraphText(userData.gameLost);
            lostValue.className += " text-lg";
            lostBox.appendChild(lostValue);
            statRow2.appendChild(lostBox);

            statBoxDiv.appendChild(statRow1);
            statBoxDiv.appendChild(statRow2);

            boxesRow.appendChild(accountBoxDiv);
            boxesRow.appendChild(statBoxDiv);
            mainContainer.appendChild(boxesRow);

            const sessionBoxDiv = createBoxDiv("sessionBox");
            sessionBoxDiv.className += " w-full max-w-xs mx-auto p-3 mt-2";
            sessionBoxDiv.appendChild(createSubheadingText("Session"));
            const sessionFormDiv = createFormElement("sessionForm");
            const logoutBtn = createButtonForm("Logout", "logout");
            logoutBtn.type = "button";
            sessionFormDiv.appendChild(logoutBtn);
            sessionBoxDiv.appendChild(sessionFormDiv);
            mainContainer.appendChild(sessionBoxDiv);

            appDiv.appendChild(mainContainer);
        } catch (err) {
            const box = createBoxDiv("errorBox");
            box.className += " max-w-md mx-auto mt-16 p-8";
            box.appendChild(createSubheadingText("Error"));
            box.appendChild(createParagraphText("Failed to load profile"));
            appDiv.appendChild(box);
        }
    }
}
