import {ViewEventBinder} from "./binderInterface";

export class ProfileViewBinder implements ViewEventBinder {
	bind() {
		document.getElementById("logout")?.addEventListener("click", this.onLogoutClick);
	}
	unbind() {
		document.getElementById("logout")?.removeEventListener("click", this.onLogoutClick);
	}
	private onLogoutClick() {
		localStorage.removeItem("token");
		history.pushState({}, "", "/login");
		window.dispatchEvent(new PopStateEvent("popstate"));
	}
}
