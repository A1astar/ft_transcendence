import { User } from "./user.js"

export interface RegisterFormat {
    name: string;
    password: string;
}

export interface LoginFormat {
    name: string;
    password: string;
}

export interface DeleteFormat {
    name: string;
    password: string;
}

export interface UserFormat {
    name: string;
    password: string;
}

function passwordValid(password: string) : boolean {
    if (password.length < 12 && password.length > 64)
        throw new Error("Password must contain a least 12 - 64 character");
    return true;
}

function usernameValid(username: string) : boolean {
    // if (username.length == 0 && /^[a-zA-Z0-9])
    return true;
}

export function userFormatCorrect(user: UserFormat) : boolean {

    if (usernameValid(user.name) && passwordValid(user.password))
        return true;
    return false;
}