import { User } from "./user.mjs"

export class Database {
    private users: Map<string, User> = new Map();

    async authenticateUser(login: string, password: string) {

    }

    addUser(user: User) {
        this.users.set(user.name, user);
    }

    deleteUser(user: User) {
        this.users.delete(user.name);
    }
}