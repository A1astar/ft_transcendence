import {
    clearDiv,
    createGifBackgroundDiv,
    createVideoBackgroundDiv,
    createHeadingText,
    createSubheadingText,
    createFormElement,
    createInputElement,
    createLogoElement,
    createButtonForm,
    createBoxDiv
} from "./utils.js";

const appDiv = document.getElementById("app");

export function renderLogin() {

    if (appDiv) {
        clearDiv(appDiv);

        const formDiv1 = createFormElement("loginForm");
        formDiv1.appendChild(createInputElement("text", "username", "Username/email"));
        formDiv1.appendChild(createInputElement("password", "password", "Password"));
        formDiv1.appendChild(createButtonForm("Login", "login"));

        const formDiv2 = createFormElement("oauth2Form");
        formDiv2.appendChild(createButtonForm("Login with Google", "google"));
        formDiv2.appendChild(createButtonForm("Login with Intra 42", "intra42"));

        const loginBoxDiv = createBoxDiv("loginBoxDiv");
        loginBoxDiv.appendChild(createSubheadingText("Join the realm of shadows with account"));
        loginBoxDiv.appendChild(formDiv1);

        const oauth2BoxDiv = createBoxDiv("oauth2BoxDiv");
        oauth2BoxDiv.appendChild(createSubheadingText("Join the realm of shadows with Oauth2"));
        oauth2BoxDiv.appendChild(formDiv2);

        appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));
        appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
        appDiv.appendChild(createHeadingText("Lord of Transcendence"));
        appDiv.appendChild(loginBoxDiv);
        appDiv.appendChild(oauth2BoxDiv);
    }
}
