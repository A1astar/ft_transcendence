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

export function createLogoElement(logoPath: string, logoName: string): HTMLImageElement {
    const logoImg = document.createElement("img");
    logoImg.src = logoPath;
    logoImg.alt = logoName;
    logoImg.className = "w-24 h-24 mb-4 drop-shadow-2xl";
    logoImg.style.filter =
        "brightness(0) saturate(100%) invert(64%) sepia(92%) saturate(3557%) \
	hue-rotate(2deg) brightness(101%) contrast(104%)";
    return logoImg;
}

export function createHeadingText(text: string): HTMLHeadingElement {
    const titleH1 = document.createElement("h1");
    titleH1.className =
        "mb-4 text-7xl font-extrabold text-amber-500 drop-shadow-lg \
	tracking-widest font-lora italic";
    titleH1.style.textShadow = "0 2px 12px #ff6600, 0 0px 1px #fff";
    titleH1.textContent = text;
    return titleH1;
}

export function createSubheadingText(text: string): HTMLHeadingElement {
    const subtitleH2 = document.createElement("h2");
    subtitleH2.className =
        "text-2xl font-bold mb-6 text-center text-amber-400 tracking-wider \
	font-lora";
    subtitleH2.textContent = text;
    return subtitleH2;
}

export function createParagraphText(text: string): HTMLParagraphElement {
    const quoteP = document.createElement("p");
    quoteP.className =
        "mb-4 text-2xl font-semibold text-amber-400 drop-shadow-md tracking-wide font-lora italic";
    quoteP.style.textShadow = "0 1px 8px #ff6600, 0 0px 1px #fff";
    quoteP.textContent = text;
    return quoteP;
}

export function createButtonLink(href: string, text: string): HTMLAnchorElement {
    const backLink = document.createElement("a");
    backLink.href = href;
    backLink.className =
        "px-4 py-2 bg-gradient-to-r from-amber-900 via-amber-700 to-red-900 text-amber-100 \
		rounded-lg font-bold hover:from-amber-700 hover:to-red-800 shadow-lg transition-all \
		duration-200 tracking-wider font-lora border-2 border-amber-900";
    backLink.style.textShadow = "1px 1px 6px #000";
    backLink.textContent = text;
    return backLink;
}

export function createFormElement(): HTMLFormElement {
    const formEl = document.createElement("form");
    formEl.action = "login.html";
    formEl.method = "POST";
    formEl.className = "flex flex-col gap-5";
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
