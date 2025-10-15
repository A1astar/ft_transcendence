export function clearDiv(Div: HTMLElement | null): void {
    if (Div) {
        Div.innerHTML = "";
    }
}

export function createGifBackgroundDiv(backgroundPath: string): HTMLDivElement {
    const backgroundDiv = document.createElement("div");
    backgroundDiv.className =
        "flex flex-col justify-center items-center h-screen m-0 \
    bg-gradient-to-br from-gray-900 via-gray-800 to-black font-serif";
    backgroundDiv.style.background = `url('${backgroundPath}') center center / cover no-repeat fixed`;
    return backgroundDiv;
}

export function createVideoBackgroundDiv(videoPath: string): HTMLVideoElement {
    const videoBg = document.createElement("video");
    videoBg.src = videoPath;
    videoBg.autoplay = true;
    videoBg.loop = true;
    videoBg.muted = true;
    videoBg.preload = "metadata";
    videoBg.className = "fixed top-0 left-0 w-full h-full object-cover -z-10 pointer-events-none";
    return videoBg;
}

export function createLogoElement(
    logoPath: string,
    logoName: string,
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" = "center"
): HTMLImageElement {
    const logoImg = document.createElement("img");
    logoImg.src = logoPath;
    logoImg.alt = logoName;
    logoImg.className = "w-24 h-24 mb-4 drop-shadow-2xl";
    logoImg.style.filter =
        "brightness(0) saturate(100%) invert(64%) sepia(92%) saturate(3557%) \
    hue-rotate(2deg) brightness(101%) contrast(104%)";

    switch (position) {
        case "top-left":
            logoImg.style.position = "absolute";
            logoImg.style.top = "1rem";
            logoImg.style.left = "1rem";
            break;
        case "top-right":
            logoImg.style.position = "absolute";
            logoImg.style.top = "1rem";
            logoImg.style.right = "1rem";
            break;
        case "bottom-left":
            logoImg.style.position = "absolute";
            logoImg.style.bottom = "1rem";
            logoImg.style.left = "1rem";
            break;
        case "bottom-right":
            logoImg.style.position = "absolute";
            logoImg.style.bottom = "1rem";
            logoImg.style.right = "1rem";
            break;
        case "center":
        default:
            break;
    }
    return logoImg;
}

export function createHeadingText(
    text: string,
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" = "center"
): HTMLHeadingElement {
    const titleH1 = document.createElement("h1");
    titleH1.className =
        "mb-4 text-7xl font-extrabold text-amber-500 drop-shadow-lg \
    tracking-widest font-lora italic";
    titleH1.style.textShadow = "0 2px 12px #ff6600, 0 0px 1px #fff";
    titleH1.textContent = text;

    switch (position) {
        case "top-left":
            titleH1.style.position = "absolute";
            titleH1.style.top = "2rem";
            titleH1.style.left = "2rem";
            break;
        case "top-right":
            titleH1.style.position = "absolute";
            titleH1.style.top = "2rem";
            titleH1.style.right = "2rem";
            break;
        case "bottom-left":
            titleH1.style.position = "absolute";
            titleH1.style.bottom = "2rem";
            titleH1.style.left = "2rem";
            break;
        case "bottom-right":
            titleH1.style.position = "absolute";
            titleH1.style.bottom = "2rem";
            titleH1.style.right = "2rem";
            break;
        case "center":
        default:
            break;
    }
    return titleH1;
}

export function createSubheadingText(
    text: string,
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" = "center"
): HTMLHeadingElement {
    const subtitleH2 = document.createElement("h2");
    subtitleH2.className =
        "text-2xl font-bold mb-6 text-center text-amber-400 tracking-wider \
    font-lora";
    subtitleH2.textContent = text;

    switch (position) {
        case "top-left":
            subtitleH2.style.position = "absolute";
            subtitleH2.style.top = "4rem";
            subtitleH2.style.left = "2rem";
            break;
        case "top-right":
            subtitleH2.style.position = "absolute";
            subtitleH2.style.top = "4rem";
            subtitleH2.style.right = "2rem";
            break;
        case "bottom-left":
            subtitleH2.style.position = "absolute";
            subtitleH2.style.bottom = "4rem";
            subtitleH2.style.left = "2rem";
            break;
        case "bottom-right":
            subtitleH2.style.position = "absolute";
            subtitleH2.style.bottom = "4rem";
            subtitleH2.style.right = "2rem";
            break;
        case "center":
        default:
            break;
    }
    return subtitleH2;
}

export function createParagraphText(
    text: string,
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" = "center"
): HTMLParagraphElement {
    const quoteP = document.createElement("p");
    quoteP.className =
        "mb-4 text-2xl font-semibold text-amber-400 drop-shadow-md tracking-wide font-lora italic";
    quoteP.style.textShadow = "0 1px 8px #ff6600, 0 0px 1px #fff";
    quoteP.textContent = text;

    switch (position) {
        case "top-left":
            quoteP.style.position = "absolute";
            quoteP.style.top = "6rem";
            quoteP.style.left = "2rem";
            break;
        case "top-right":
            quoteP.style.position = "absolute";
            quoteP.style.top = "6rem";
            quoteP.style.right = "2rem";
            break;
        case "bottom-left":
            quoteP.style.position = "absolute";
            quoteP.style.bottom = "6rem";
            quoteP.style.left = "2rem";
            break;
        case "bottom-right":
            quoteP.style.position = "absolute";
            quoteP.style.bottom = "6rem";
            quoteP.style.right = "2rem";
            break;
        case "center":
        default:
            break;
    }
    return quoteP;
}

export function createButtonLink(
    href: string,
    text: string,
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" = "center",
): HTMLAnchorElement {
    const backLink = document.createElement("a");
    backLink.href = href;
    backLink.className =
        "px-4 py-2 bg-gradient-to-r from-amber-900 via-amber-700 to-red-900 text-amber-100 \
        rounded-lg font-bold hover:from-amber-700 hover:to-red-800 shadow-lg transition-all \
        duration-200 tracking-wider font-lora border-2 border-amber-900";
    backLink.style.textShadow = "1px 1px 6px #000";
    backLink.textContent = text;

    switch (position) {
        case "top-left":
            backLink.style.position = "absolute";
            backLink.style.top = "8rem";
            backLink.style.left = "2rem";
            break;
        case "top-right":
            backLink.style.position = "absolute";
            backLink.style.top = "8rem";
            backLink.style.right = "2rem";
            break;
        case "bottom-left":
            backLink.style.position = "absolute";
            backLink.style.bottom = "8rem";
            backLink.style.left = "2rem";
            break;
        case "bottom-right":
            backLink.style.position = "absolute";
            backLink.style.bottom = "8rem";
            backLink.style.right = "2rem";
            break;
        case "center":
        default:
            break;
    }
    return backLink;
}

export function createButtonForm(
    text: string,
    name: string
): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "submit";
    button.name = name;
    button.className =
        "px-4 py-2 bg-gradient-to-r from-amber-900 via-amber-700 to-red-900 text-amber-100 \
        rounded-lg font-bold hover:from-amber-700 hover:to-red-800 shadow-lg transition-all \
        duration-200 tracking-wider font-lora border-2 border-amber-900";
    button.style.textShadow = "1px 1px 6px #000";
    button.textContent = text;
    return button;
}

export function createFormElement(
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" = "center"
): HTMLFormElement {
    const formEl = document.createElement("form");
    formEl.action = "login.html";
    formEl.method = "POST";
    formEl.className = "flex flex-col gap-5";

    switch (position) {
        case "top-left":
            formEl.style.position = "absolute";
            formEl.style.top = "2rem";
            formEl.style.left = "2rem";
            break;
        case "top-right":
            formEl.style.position = "absolute";
            formEl.style.top = "2rem";
            formEl.style.right = "2rem";
            break;
        case "bottom-left":
            formEl.style.position = "absolute";
            formEl.style.bottom = "2rem";
            formEl.style.left = "2rem";
            break;
        case "bottom-right":
            formEl.style.position = "absolute";
            formEl.style.bottom = "2rem";
            formEl.style.right = "2rem";
            break;
        case "center":
        default:
            break;
    }
    return formEl;
}

export function createInputElement(
    type: string,
    name: string,
    placeholder: string,
): HTMLInputElement {
    const input = document.createElement("input");
    input.type = type;
    input.name = name;
    input.placeholder = placeholder;
    input.required = true;
    input.className =
        "px-4 py-2 border border-amber-900/40 rounded-lg bg-gray-900/60 \
	text-amber-200 placeholder-amber-600 focus:outline-none focus:ring-2 \
	focus:ring-amber-700 focus:border-amber-700 transition font-lora";
    return input;
}
