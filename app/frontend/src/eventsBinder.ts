// Définition d'une interface pour les binders d'événements
export interface ViewEventBinder {
	bind(): void;
    unbind(): void;
}

export class GameMenuBinder implements ViewEventBinder {
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
		document.getElementById("Tournament4")?.removeEventListener("click", this.onTournament4Click);
		document.getElementById("Tournament8")?.removeEventListener("click", this.onTournament8Click);
	}
	private onLocalClick(this: HTMLElement, event: MouseEvent) {/*fun*/}
	private onRemote2Click(this: HTMLElement, event: MouseEvent) {/*super fun*/}
	private onRemote4Click(this: HTMLElement, event: MouseEvent) {/*giga fun*/}
	private onTournament4Click(this: HTMLElement, event: MouseEvent) {/*ultra fun*/}
	private onTournament8Click(this: HTMLElement, event: MouseEvent) {/*mega fun*/}
}

export class GuestMenuBinder implements ViewEventBinder {
    bind() {
		document.getElementById("guest")?.addEventListener("click", this.onGuestClick);
    }
    unbind() {
		document.getElementById("guest")?.removeEventListener("click", this.onGuestClick);
    }
    private onGuestClick() {/*fun*/}
}

export class HomeViewBinder implements ViewEventBinder {
    bind() {}
    unbind() {}
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
    private onLoginClick(this: HTMLElement, event: MouseEvent) {/*fun*/}
	private onGoogleClick(this: HTMLElement, event: MouseEvent) {/*super fun*/}
	private onIntra42Click(this: HTMLElement, event: MouseEvent) {/*giga fun*/}
}

export class ProfileViewBinder implements ViewEventBinder {
    bind() {
        document.getElementById("logout")?.addEventListener("click", this.onLogoutClick);
    }
    unbind() {
		document.getElementById("logout")?.removeEventListener("click", this.onLogoutClick);
	}
    private onLogoutClick() {/*fun*/}
}

export class RegisterViewBinder implements ViewEventBinder {
    bind() {
        document.getElementById("register")?.addEventListener("click", this.onRegisterClick);
    }
    unbind() {
        document.getElementById("register")?.removeEventListener("click", this.onRegisterClick);
    }
    private onRegisterClick() {/*fun*/}
}

export class SettingsViewBinder implements ViewEventBinder {
    bind() {
        document.getElementById("update-settings")?.addEventListener("click", this.updateSettingsClick);
    }
    unbind() {
		document.getElementById("update-settings")?.removeEventListener("click", this.updateSettingsClick);
	}
    private updateSettingsClick() {/*fun*/}
}

// Fonction principale pour binder selon le path
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
			binder = new GuestMenuBinder();
			break;
		case "/profile":
			binder = new ProfileViewBinder();
			break;
		case "/settings":
			binder = new SettingsViewBinder();
			break;
        case "/game-menu":
            binder = new GameMenuBinder();
            break;
		// Ajoutez d'autres cas pour chaque vue
		default:
			binder = null;
			break;
    }
    binder?.bind();
    return binder;
}
