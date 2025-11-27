import { ApiClient } from "./apiService.js";

type UserInfo = {
    username: string;
    email?: string;
    gamePlayed?: number;
    gameWon?: number;
    gameLost?: number;
    winRate?: number;
};

let cachedUser: UserInfo | null = null;

export async function getFullUser(forceRefresh = false): Promise<UserInfo | null> {
    if (cachedUser && !forceRefresh) return cachedUser;

    try {
        const res = await ApiClient.get("/api/auth/userinfo");
        if (!res.ok) return null;
        const user = await res.json();
        cachedUser = user;
        return user;
    } catch (e) {
        return null;
    }
}

export async function getUsername(): Promise<string | null> {
    // Prefer authenticated user
    const user = await getFullUser();
    if (user && user.username) return user.username;

    // Fallback to guest stored locally
    const guest = localStorage.getItem("guestUsername");
    return guest ?? null;
}

export function setGuestUsername(name: string) {
    localStorage.setItem("guestUsername", name);
    // keep cache in sync
    if (cachedUser) cachedUser.username = name;
}

export function clearUserCache() {
    cachedUser = null;
}

export function logoutLocal() {
    localStorage.removeItem("guestUsername");
    clearUserCache();
}


export default { getFullUser, getUsername, setGuestUsername, clearUserCache, logoutLocal };
