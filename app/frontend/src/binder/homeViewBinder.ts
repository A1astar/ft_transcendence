import {ViewEventBinder} from "./binderInterface";

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
