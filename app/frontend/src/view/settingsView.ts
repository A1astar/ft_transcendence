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
	createBoxDiv
} from "./utils.js";

const appDiv = document.getElementById("app");

export function renderSettings() {
	if (appDiv) {
		clearDiv(appDiv);

		const formDiv = createFormElement("settingsForm");
		formDiv.appendChild(createInputElement("text", "username", "New Pseudo"));
		formDiv.appendChild(createButtonForm("Update Settings", "update-settings"));

		const settingBox = createBoxDiv("settingsBox");
		settingBox.appendChild(createSubheadingText("Settings"));
		settingBox.appendChild(formDiv);

		appDiv.appendChild(createVideoBackgroundDiv("../public/backgrounds/Sauron.mp4"));
		appDiv.appendChild(createLogoElement("../public/icons/sauron.png", "Barad-dûr Logo"));
		appDiv.appendChild(createHeadingText("Lord of Transcendence"));
		appDiv.appendChild(settingBox);
	}
}

// Store
//   AuthStore, state, singleton getInstance, getter, setters


// Vue
// 3 files html, css, js

// html -> id
// css -> class
// js ->


// import
// states, setters,  (user, friends, games),
// init (import html)-> fetch -> states -> feed le dom setters -> listerners()

// const listeners = () =>{
// 	listener_ handleLogin()
//     ...
// }


// handleLogin() {
// 	const button_Login = document.getElementById("buttonLogin")


// 	const form = document...
// 	const login_response = login(email, password)
// 	if(login_response.status) {
// 		store.set_token()
// 		redirect
// 	}
// }

// Services:
// 	API:
// 	Import auth_store

// 	Class -> singleton
//     constructor base_url = http://localhost:3003/
// 	methods
// 	.post, .get, .update, .delete
// 	const generate_headers = (header) => {
// 		if(auth_store.getToken())
// 			header = {...headers, {Authorization: autStore.getToken()}}
// 	}

// 	const post = async (enpoint, body) => {
// 		return await fetch(baseURL + endpoint, {
// 			method: "POST",
// 			headers: {"Content-Type": "application/json"},
// 			body: JSON.stringify(body)
// 		});
// 	}
// 	user_service.ts:
// 		const login = (email, password) => {
// 			return await apiService("/login", {email, password})
// 		}
// 		const register ...
// 	friend_service:
