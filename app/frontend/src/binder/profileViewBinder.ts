import {ViewEventBinder} from "./binderInterface";
import { ApiClient } from "../apiService.js";
import { clearUserCache, logoutLocal } from "../authService.js";

export class ProfileViewBinder implements ViewEventBinder {
	bind() {
		document.getElementById("logout")?.addEventListener("click", this.onLogoutClick);
		document.getElementById("enable2fa")?.addEventListener("click", this.onEnable2faClick);
		document.getElementById("disable2fa")?.addEventListener("click", this.onDisable2faClick);
		console.log("ProfileViewBinder: bind called");
	}
	unbind() {
		document.getElementById("logout")?.removeEventListener("click", this.onLogoutClick);
		document.getElementById("enable2fa")?.removeEventListener("click", this.onEnable2faClick);
		document.getElementById("disable2fa")?.removeEventListener("click", this.onDisable2faClick);
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

		history.pushState({}, "", "/");
		window.dispatchEvent(new PopStateEvent("popstate"));
	};

	private onEnable2faClick = async (e: Event) => {
		e.preventDefault();
		try {
			const res = await ApiClient.post("/api/auth/2fa/enable", {});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				alert(err?.error || "Failed to enable 2FA");
				return;
			}
			const data = await res.json().catch(() => null);
			// Show QR code + secret so the user can configure 2FA in their authenticator
			if (data?.otpauthUrl) {
				const qrContainer = document.getElementById("qrcodeContainer") as HTMLDivElement | null;
				if (qrContainer) {
					// Clear previous content and append a new QR code image
					while (qrContainer.firstChild) qrContainer.removeChild(qrContainer.firstChild);
					const img = document.createElement("img");
					img.alt = "2FA QR code";
					img.width = 200;
					img.height = 200;
					img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
						data.otpauthUrl
					)}`;
					qrContainer.appendChild(img);

					// Additionally show the secret text in case the QR code cannot be scanned
					if (data.secret) {
						const secretText = document.createElement("p");
						secretText.className = "text-xs mt-2 text-center break-all";
						secretText.textContent = `If you cannot scan the QR code, you can manually enter this key: ${data.secret}`;
						qrContainer.appendChild(secretText);
					}
				}
				alert("2FA has been enabled. Please use your authenticator app to scan the QR code on this page.");
			} else {
				alert("2FA has been enabled.");
			}

			const statusEl = document.getElementById("twoFaStatus");
			if (statusEl) statusEl.textContent = "Enabled";
			const enableBtn = document.getElementById("enable2fa") as HTMLButtonElement | null;
			const disableBtn = document.getElementById("disable2fa") as HTMLButtonElement | null;
			if (enableBtn) enableBtn.style.display = "none";
			if (disableBtn) disableBtn.style.display = "";
		} catch (err) {
			console.error("Failed to enable 2FA:", err);
			alert("Failed to enable 2FA");
		}
	};

	private onDisable2faClick = async (e: Event) => {
		e.preventDefault();
		if (!confirm("Are you sure you want to disable 2FA?")) return;
		try {
			const res = await ApiClient.post("/api/auth/2fa/disable", {});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				alert(err?.error || "Failed to disable 2FA");
				return;
			}
			alert("2FA has been disabled.");
			const statusEl = document.getElementById("twoFaStatus");
			if (statusEl) statusEl.textContent = "Disabled";
			const enableBtn = document.getElementById("enable2fa") as HTMLButtonElement | null;
			const disableBtn = document.getElementById("disable2fa") as HTMLButtonElement | null;
			if (enableBtn) enableBtn.style.display = "";
			if (disableBtn) disableBtn.style.display = "none";
		} catch (err) {
			console.error("Failed to disable 2FA:", err);
			alert("Failed to disable 2FA");
		}
	};
}
