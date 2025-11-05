import {ApiClient} from "./apiService.js";
import {renderGame} from "./view/gameView.js";

export interface ViewEventBinder {
    bind(): void;
    unbind(): void;
}

export class GameMenuViewBinder implements ViewEventBinder {
    bind() {
        document.getElementById("local")?.addEventListener("click", this.onLocalClick);
        document.getElementById("Remote2")?.addEventListener("click", this.onRemote2Click);
        document.getElementById("Remote4")?.addEventListener("click", this.onRemote4Click);
        document.getElementById("Tournament4")?.addEventListener("click", this.onTournament4Click);
        document.getElementById("Tournament8")?.addEventListener("click", this.onTournament8Click);
    }
    unbind() {
        document.getElementById("local")?.removeEventListener("click", this.onLocalClick);
        document.getElementById("Remote2")?.removeEventListener("click", this.onRemote2Click);
        document.getElementById("Remote4")?.removeEventListener("click", this.onRemote4Click);
        document
            .getElementById("Tournament4")
            ?.removeEventListener("click", this.onTournament4Click);
        document
            .getElementById("Tournament8")
            ?.removeEventListener("click", this.onTournament8Click);
    }
    private onLocalClick = async (event: MouseEvent) => {
        event.preventDefault();

        const guestUsername = localStorage.getItem("guestUsername");
        
        // First match request for player 1
        const matchRequest1 = {
            player: {
                alias: guestUsername || "guest"
            },
            mode: "local" as const,
            tournamentRound: 0
        };

        // Second match request for player 2
        const matchRequest2 = {
            player: {
                alias: "guest"
            },
            mode: "local" as const,
            tournamentRound: 0
        };

        try {
            // Send first player
            const res1 = await fetch("http://localhost:3002/api/game-orchestration/local", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(matchRequest1)
            });

            if (!res1.ok) throw new Error('First player request failed');
            
            // Send second player
            const res2 = await fetch("http://localhost:3002/api/game-orchestration/local", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(matchRequest2)
            });

            if (!res2.ok) throw new Error('Second player request failed');

            // Get the match data from the second response
            const match = await res2.json();
            
            // Store the match ID in sessionStorage for the game view
            sessionStorage.setItem('currentGameId', match.id);
            
            // Render game view
            renderGame();
            
            // Update URL
            history.pushState({}, "", "/game/local");
            window.dispatchEvent(new PopStateEvent("popstate"));
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to start local game");
        }
    }
    private onRemote2Click(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/api/game-orchestration/remote2");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }
    private onRemote4Click(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/api/game-orchestration/remote4");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }
    private onTournament4Click(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/api/game-orchestration/tournament");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }
    private onTournament8Click(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/api/game-orchestration/tournament");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }
}

export class GuestViewBinder implements ViewEventBinder {
    bind() {
        document.getElementById("guest")?.addEventListener("click", this.onGuestClick);
    }
    unbind() {
        document.getElementById("guest")?.removeEventListener("click", this.onGuestClick);
    }
    private onGuestClick = async () => {
        try {
            const username = (document.getElementById("username") as HTMLInputElement | null)?.value;
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
            console.error('Guest login error:', error);
            alert("Network error - Cannot connect to authentication service");
        }
    }
}

export class HomeViewBinder implements ViewEventBinder {
    bind() {
        document.getElementById("login")?.addEventListener("click", this.onLoginClick);
        document.getElementById("register")?.addEventListener("click", this.onRegisterClick);
        document.getElementById("guest")?.addEventListener("click", this.onGuestClick);
    }
    unbind() {
        document.getElementById("login")?.removeEventListener("click", this.onLoginClick);
        document.getElementById("register")?.removeEventListener("click", this.onRegisterClick);
        document.getElementById("guest")?.removeEventListener("click", this.onGuestClick);
    }
    private onLoginClick(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/login");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }
    private onRegisterClick(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/register");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }
    private onGuestClick(this: HTMLElement, event: MouseEvent) {
        event.preventDefault();
        history.pushState({}, "", "/guest");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }
}

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

export class RegisterViewBinder implements ViewEventBinder {
    bind() {
        document.getElementById("register")?.addEventListener("click", this.onRegisterClick);
    }
    unbind() {
        document.getElementById("register")?.removeEventListener("click", this.onRegisterClick);
    }
    private onRegisterClick = async () => {
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

export class GameViewBinder implements ViewEventBinder {
    bind(): void {

    }
    unbind(): void {

    }
}

export function bindEvents(path: string) {
    let binder: ViewEventBinder | null = null;
    switch (path) {
        case "/":
            binder = new HomeViewBinder();
            break;
        case "/login":
            binder = new LoginViewBinder();
            break;
        case "/register":
            binder = new RegisterViewBinder();
            break;
        case "/guest":
            binder = new GuestViewBinder();
            break;
        case "/profile":
            binder = new ProfileViewBinder();
            break;
        case "/settings":
            binder = new SettingsViewBinder();
            break;
        case "/gameMenu":
            binder = new GameMenuViewBinder();
            break;
        case "/game/local":
            binder = new GameViewBinder();
            break;
        case "/game":
            binder = new GameViewBinder();
            break;
        // Add more cases as needed
        default:
            binder = null;
            break;
    }
    binder?.bind();
    return binder;
}
