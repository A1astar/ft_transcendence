import {
    createButtonLink,
    createFormElement,
    createHeadingText,
    createInputElement,
    createLogoElement,
    createParagraphText,
    createSubheadingText,
} from "./DomElements.js";

const appDiv = document.querySelector("app");

export function renderLogin() {
    const formDiv = createFormElement();
    formDiv.appendChild(createSubheadingText("Join the realm of shadows"));
    formDiv.appendChild(createInputElement("text", "username", "Username"));
    formDiv.appendChild(createInputElement("password", "password", "Password"));
    formDiv.appendChild(createButtonLink("/", "Login"));

    if (appDiv) {
        appDiv.appendChild(createLogoElement("../icons/sauron.png"));
        appDiv.appendChild(createHeadingText("Lord of the Transcendence"));
        appDiv.appendChild(formDiv);
    }
}

export function renderNotFound() {
    if (appDiv) {
        appDiv.appendChild(createLogoElement("../icons/sauron.png"));
        appDiv.appendChild(createHeadingText("404: page not found"));
        appDiv.appendChild(createParagraphText('"Not all those who wander are lost..."'));
        appDiv.appendChild(createButtonLink("/", "Back to the Mordor"));
    }
}

export function renderGame() {}
export function renderSettings() {}
export function renderProfile() {}
export function renderDashboard() {}
