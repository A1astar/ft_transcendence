import {ViewEventBinder} from "./binderInterface";
import {ApiClient} from "../apiService.js";

export class RegisterViewBinder implements ViewEventBinder {
	bind() {
		document.getElementById("register")?.addEventListener("click", this.onRegisterClick);
	}
	unbind() {
		document.getElementById("register")?.removeEventListener("click", this.onRegisterClick);
	}
	private onRegisterClick = async (event: MouseEvent) => {
		event.preventDefault();
		const email = (document.getElementById("email") as HTMLInputElement | null)?.value;
		const username = (document.getElementById("username") as HTMLInputElement | null)?.value;
		const password = (document.getElementById("password") as HTMLInputElement | null)?.value;
		const confirmPassword = (
			document.getElementById("confirmPassword") as HTMLInputElement | null
		)?.value;

		if (password !== confirmPassword) {
			alert("Passwords do not match");
			return;
		}
		const res = await ApiClient.post("/api/auth/register", {email, username, password});
		if (!res.ok) {
			const err = await res.json().catch(() => ({message: "Registration failed"}));
			alert(err.message || "Registration failed");
			return;
		}
		alert("Registration successful! Please log in.");
		history.pushState({}, "", "/login");
		window.dispatchEvent(new PopStateEvent("popstate"));
	};
}
