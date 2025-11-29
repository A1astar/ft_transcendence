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
		const name = (document.getElementById("username") as HTMLInputElement | null)?.value;
		const password = (document.getElementById("password") as HTMLInputElement | null)?.value;
		try {
			const res = await ApiClient.post("/api/auth/login", {name, password});
			if (!res.ok) {
				const err = await res.json();
				alert(err.error || "Login failed");
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
		event.preventDefault();
		window.location.href = "/api/auth/oauth/google";
	}
	private onIntra42Click(this: HTMLElement, event: MouseEvent) {
		event.preventDefault();
		// Assuming similar path for intra42 or placeholder
		// window.location.href = "/api/auth/oauth/intra42"; 
		console.log("Intra42 login not implemented yet");
	}
}
