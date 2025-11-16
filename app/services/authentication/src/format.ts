import { User } from "./user.js"

export interface RegisterFormat {
    name: string;
    email: string;
    password: string;
}

export interface UserFormat {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
}

export interface Session {
    sessoinID: number;
    userID: number;
    createdAt: Date;
    expiresAt: Date;
}

function passwordValid(password: string) : boolean {
    if (password.length < 12 && password.length > 64)
        throw new Error("Password must contain a least 12 - 64 character");
    return true;
}

function usernameValid(username: string) : boolean {
    if (username.length === 0 || !/^[a-zA-Z0-9_]+$/.test(username))
        throw new Error("Username must contain only alphanumeric characters");
    return true;
}

// export function userFormatCorrect(user: UserFormat) : boolean {

//     if (usernameValid(user.name) && passwordValid(user.password))
//         return true;
//     return false;
// }