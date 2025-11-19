import { router } from "./router.js";

async function main(): Promise<void> {
    try {
        console.log("Initializing application...");

        document.addEventListener("click", (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.matches("[data-link]")) {
                event.preventDefault();
                const url = target.getAttribute("href")!;
                history.pushState(null, "", url);
                router(url);
            }
        });

        window.addEventListener("popstate", () => {
            router(window.location.pathname);
        });

        await router(window.location.pathname || "/");

    } catch (error) {
        console.error("Error during app initialization:", error);
        document.body.innerHTML =
            "<h1>Error initializing application. Check console for details.</h1>";
    }
}

main();
