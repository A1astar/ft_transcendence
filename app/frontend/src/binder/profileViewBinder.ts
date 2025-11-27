import {ViewEventBinder} from "./binderInterface";
import { ApiClient } from "../apiService.js";
import { clearUserCache, logoutLocal } from "../authService.js";

export class ProfileViewBinder implements ViewEventBinder {
	bind() {
		document.getElementById("logout")?.addEventListener("click", this.onLogoutClick);
			console.log("ProfileViewBinder: bind called");
	}
	unbind() {
		document.getElementById("logout")?.removeEventListener("click", this.onLogoutClick);
	}

	private onLogoutClick = async (e: Event) => {
		console.log("logout click");

		e.preventDefault();

		try {
			await ApiClient.post("/api/auth/logout", {});
		} catch (err) {
			console.warn("Logout request failed:", err);
		}

		try { clearUserCache(); } catch {}
		try { logoutLocal(); } catch {}
		try { localStorage.removeItem("token"); } catch {}
		try { sessionStorage.removeItem("currentGameId"); } catch {}

		history.pushState({}, "", "/login");
		window.dispatchEvent(new PopStateEvent("popstate"));
	};
}
