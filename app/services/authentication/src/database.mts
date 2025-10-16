import { User } from "./user.mjs"

export class Database {
    private users: Map<string, User> = new Map();

    async authenticateUser(login: string, password: string) {

    }

    addUser(user: User) {

    }

    deleteUser(user: User) {

    }

}