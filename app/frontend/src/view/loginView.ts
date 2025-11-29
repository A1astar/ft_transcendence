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
import { getFullUser } from "../authService.js";

const appDiv = document.getElementById("app");

export async function renderLogin() {

    if (appDiv) {
        clearDiv(appDiv);

        const user = await getFullUser();
        if (user && user.username) {
            const alreadyBox = createBoxDiv("alreadyLoggedInBox");
            alreadyBox.appendChild(createSubheadingText(`Welcome back, ${user.username}`));
            const nameDisplay = document.createElement("div");
            nameDisplay.className = "text-center my-4";
            const nameH3 = document.createElement("h3");
            nameH3.className = "text-3xl font-extrabold text-amber-300 drop-shadow-md font-lora";
            nameH3.textContent = user.username;
            const small = document.createElement("div");
            small.className = "text-sm text-amber-200/80 mt-2";
            small.textContent = "You are already signed in";
            nameDisplay.appendChild(small);
            alreadyBox.appendChild(nameDisplay);

            const goProfileButton = createButtonForm("Open Profile", "goProfile");
            goProfileButton.addEventListener("click", (e) => {
                e.preventDefault();
                history.pushState({}, "", "/profile");
                window.dispatchEvent(new PopStateEvent("popstate"));
            });

            const goGameMenuButton = createButtonForm("Game Menu", "goGameMenu");
            goGameMenuButton.addEventListener("click", (e) => {
                e.preventDefault();
                history.pushState({}, "", "/gameMenu");
                window.dispatchEvent(new PopStateEvent("popstate"));
            });

            // place buttons side-by-side, center them and add spacing
            const btnRow = document.createElement("div");
            btnRow.style.display = "flex";
            btnRow.style.justifyContent = "center"; // center buttons
            btnRow.style.alignItems = "center";
            btnRow.style.gap = "14px";
            btnRow.style.marginTop = "18px";
            btnRow.style.paddingTop = "6px";

            // make buttons a consistent size for better aesthetics
            goProfileButton.style.minWidth = "140px";
            goGameMenuButton.style.minWidth = "140px";
            goProfileButton.style.padding = "10px 16px";
            goGameMenuButton.style.padding = "10px 16px";

            btnRow.appendChild(goProfileButton);
            btnRow.appendChild(goGameMenuButton);
            alreadyBox.appendChild(btnRow);

            appDiv.appendChild(createVideoBackgroundDiv("../../public/backgrounds/Gandalf.mp4"));
            appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
            appDiv.appendChild(createHeadingText("Lord of Transcendence"));
            appDiv.appendChild(alreadyBox);
            return;
        }

        const formDiv1 = createFormElement("loginForm");
        formDiv1.method = "POST";
        formDiv1.action = "/api/auth/login";
        formDiv1.appendChild(createInputElement("text", "username", "Username/email"));
        formDiv1.appendChild(createInputElement("password", "password", "Password"));
        formDiv1.appendChild(createButtonForm("Login", "login"));

        const formDiv2 = createFormElement("oauth2Form");
        // We don't strictly need a form for a simple redirect, but keeping structure.
        // Changing to use a button that redirects via JS or simple GET if the form method was GET.
        // But since the backend plugin expects a GET request to redirect to Google, 
        // and form submission with POST might be weird if the plugin expects GET.
        // fastify-oauth2 typically handles GET for the start path.
        
        const googleBtn = createButtonForm("Login with Google", "google");
        // Click handler is managed by LoginViewBinder
        formDiv2.appendChild(googleBtn);
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