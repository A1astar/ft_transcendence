import {ViewEventBinder} from "./binderInterface";
import { ApiClient } from "../apiService.js";
import { clearUserCache, logoutLocal } from "../authService.js";

export class ProfileViewBinder implements ViewEventBinder {
	bind() {
		document.getElementById("logout")?.addEventListener("click", this.onLogoutClick);
	}
	unbind() {
		document.getElementById("logout")?.removeEventListener("click", this.onLogoutClick);
	}

	// use arrow so add/removeEventListener get the same reference
	private onLogoutClick = async (e: Event) => {
		e.preventDefault();

		try {
			await ApiClient.post("/api/auth/logout", {});
		} catch (err) {
			console.warn("Logout request failed:", err);
		}

		// Clear client-side auth artifacts
		try { clearUserCache(); } catch {}
		try { logoutLocal(); } catch {}
		try { localStorage.removeItem("token"); } catch {}
		try { sessionStorage.removeItem("currentGameId"); } catch {}

		// Navigate to login view
		history.pushState({}, "", "/login");
		window.dispatchEvent(new PopStateEvent("popstate"));
	};
}
