import {ViewEventBinder} from "./binderInterface";
import {ApiClient} from "../apiService.js";

export class SettingsViewBinder implements ViewEventBinder {
    bind() {
        document
            .getElementById("update-settings")
            ?.addEventListener("click", this.updateSettingsClick);
    }
    unbind() {
        document
            .getElementById("update-settings")
            ?.removeEventListener("click", this.updateSettingsClick);
    }
    private updateSettingsClick() {
        const username = (document.getElementById("username") as HTMLInputElement | null)?.value;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Not authenticated");
            history.pushState({}, "", "/login");
            window.dispatchEvent(new PopStateEvent("popstate"));
            return;
        }

        const res = ApiClient.update("/api/auth/update", {username})
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({message: "Update failed"}));
                    alert(err.message || "Update failed");
                    return;
                }
                alert("Settings updated successfully!");
                history.pushState({}, "", "/profile");
                window.dispatchEvent(new PopStateEvent("popstate"));
            })
            .catch((e) => {
                console.error(e);
                alert("Network error");
            });
    }
}
