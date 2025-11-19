import {ViewEventBinder} from "./binderInterface.js";
import {ApiClient} from "../apiService.js";

export class LoginViewBinder implements ViewEventBinder {
	bind() {
		document.getElementById("login")?.addEventListener("click", this.onLoginClick);
		document.getElementById("google")?.addEventListener("click", this.onGoogleClick);
		document.getElementById("intra42")?.addEventListener("click", this.onIntra42Click);
	}
	unbind() {
		document.getElementById("login")?.removeEventListener("click", this.onLoginClick);
		document.getElementById("google")?.removeEventListener("click", this.onGoogleClick);
		document.getElementById("intra42")?.removeEventListener("click", this.onIntra42Click);
	}
	private onLoginClick = async (event: MouseEvent) => {
		event.preventDefault();
		const username = (document.getElementById("username") as HTMLInputElement | null)?.value;
		const password = (document.getElementById("password") as HTMLInputElement | null)?.value;
		try {
			const res = await ApiClient.post("/api/auth/login", {username, password});
			if (!res.ok) {
				const err = await res.json().catch(() => ({message: "Login failed"}));
				alert(err.message || "Login failed");
				return;
			}
			const data = await res.json().catch(() => null);
			if (data?.token) localStorage.setItem("token", data.token);
			history.pushState({}, "", "/gameMenu");
			window.dispatchEvent(new PopStateEvent("popstate"));
		} catch (e) {
			console.error(e);
			alert("Network error");
		}
	};
	private onGoogleClick(this: HTMLElement, event: MouseEvent) {
		const res = ApiClient.get("/api/auth/google");
		if (res) {
			// redirect to Google OAuth URL
			window.location.href = (res as unknown as {url: string}).url;
		}
	}
	private onIntra42Click(this: HTMLElement, event: MouseEvent) {
		const res = ApiClient.get("/api/auth/intra-42");
		if (res) {
			// redirect to Google OAuth URL
			window.location.href = (res as unknown as {url: string}).url;
		}
	}
}
