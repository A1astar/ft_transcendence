import type { ViewEventBinder } from "./binder/binderInterface.js";

let currentBinder: ViewEventBinder | null = null;

type RouteHandler = () => Promise<void>;

async function loadAndBind<T extends ViewEventBinder>(
  viewImport: Promise<{ [k: string]: any }>,
  binderImport: Promise<{ [k: string]: any }>,
  viewFnName: string,
  binderClassName: string
): Promise<void> {
  // Unbind previous route listeners before re-rendering
  currentBinder?.unbind();
  const [viewModule, binderModule] = await Promise.all([
    viewImport,
    binderImport,
  ]);
  const renderFn = viewModule[viewFnName] as () => Promise<void> | void;
  const BinderClass = binderModule[binderClassName] as new () => T;
  await Promise.resolve(renderFn());
  const binder = new BinderClass();
  binder.bind();
  currentBinder = binder;
}

const handlers: Record<string, RouteHandler> = {
  "/": () =>
    loadAndBind(
      import("./view/homeView.js"),
      import("./binder/homeViewBinder.js"),
      "renderHome",
      "HomeViewBinder"
    ),
  "/login": () =>
    loadAndBind(
      import("./view/loginView.js"),
      import("./binder/loginViewBinder.js"),
      "renderLogin",
      "LoginViewBinder"
    ),
  "/register": () =>
    loadAndBind(
      import("./view/registerView.js"),
      import("./binder/registerViewBinder.js"),
      "renderRegister",
      "RegisterViewBinder"
    ),
  "/guest": () =>
    loadAndBind(
      import("./view/guestView.js"),
      import("./binder/guestViewBinder.js"),
      "renderGuestLogin",
      "GuestViewBinder"
    ),
  "/profile": () =>
    loadAndBind(
      import("./view/profileView.js"),
      import("./binder/profileViewBinder.js"),
      "renderProfile",
      "ProfileViewBinder"
    ),
  "/gameMenu": () =>
    loadAndBind(
      import("./view/gameMenuView.js"),
      import("./binder/gameMenuViewBinder.js"),
      "renderGameMenu",
      "GameMenuViewBinder"
    ),
  "/localLobby": () =>
    loadAndBind(
      import("./view/localLobbyView.js"),
      import("./binder/localLobbyViewBinder.js"),
      "renderLocalLobby",
      "LocalLobbyViewBinder"
    ),
  "/remote2Lobby": () =>
    loadAndBind(
      import("./view/remote2LobbyView.js"),
      import("./binder/Remote2LobbyViewBinder.js"),
      "renderRemote2Lobby",
      "Remote2LobbyViewBinder"
    ),
  "/remote4Lobby": () =>
    loadAndBind(
      import("./view/remote4LobbyView.js"),
      import("./binder/Remote4LobbyViewBinder.js"),
      "renderRemote4Lobby",
      "Remote4LobbyViewBinder"
    ),
  "/tournament4Lobby": () =>
    loadAndBind(
      import("./view/tournament4LobbyView.js"),
      import("./binder/Tournament4LobbyViewBinder.js"),
      "renderTournament4Lobby",
      "Tournament4LobbyViewBinder"
    ),
  "/tournament8Lobby": () =>
    loadAndBind(
      import("./view/tournament8LobbyView.js"),
      import("./binder/Tournament8LobbyViewBinder.js"),
      "renderTournament8Lobby",
      "Tournament8LobbyViewBinder"
    ),
};

async function renderNotFoundLazy(): Promise<void> {
  currentBinder?.unbind();
  const { renderNotFound } = await import("./view/notFoundView.js");
  renderNotFound();
  currentBinder = null;
}

export async function router(path: string): Promise<void> {
  console.log(path);
  const handler = handlers[path];
  if (handler) {
    await handler();
  } else {
    await renderNotFoundLazy();
  }
}
