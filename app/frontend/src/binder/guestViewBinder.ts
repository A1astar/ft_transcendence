import {ViewEventBinder} from "./binderInterface";

export class GuestViewBinder implements ViewEventBinder {
    bind() {
        document.getElementById("guest")?.addEventListener("click", this.onGuestClick);
    }
    unbind() {
        document.getElementById("guest")?.removeEventListener("click", this.onGuestClick);
    }
    private onGuestClick = async () => {
        try {
            const username = (document.getElementById("username") as HTMLInputElement | null)
                ?.value;
            if (!username || username.trim().length === 0) {
                alert("Please enter a valid username");
                return;
            }

            // const res = await ApiClient.post("/api/auth/guest-session", {username});
            // if (!res.ok) {
            //     const err = await res.json().catch(() => ({message: "Guest login failed"}));
            //     alert(err.message || "Guest login failed");
            //     return;
            // }

            localStorage.setItem("guestUsername", username);
            history.pushState({}, "", "/gameMenu");
            window.dispatchEvent(new PopStateEvent("popstate"));
        } catch (error) {
            console.error("Guest login error:", error);
            alert("Network error - Cannot connect to authentication service");
        }
    };
}
