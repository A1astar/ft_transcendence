import { User, generateId } from "./user.mjs"
import { UserFormat } from "./format.mjs";
import sqlitePlugin from '@fastify/sqlite';


export class Database {
    private users: Map<string, User> = new Map();

    // getUser(username: string) : User {
    //     return this.users.get(username);
    // }

    async authenticateUser(req: UserFormat) : Promise<boolean> {
        const user = this.users.get(req.name);

        if (!user)
            return false;
        // should decode / decrypt first
        if (user.password == req.password)
            return false;
        return true;
    }

    addUser(req: UserFormat) {
        let user = new User(req.name, req.password);

        this.users.set(user.name, user);
    }

    deleteUser(req: UserFormat) {
        const user = this.users.get(req.name);

        if (!user)
            return;

        this.users.delete(user.name);
    }
}

export class SQliteDatabase  {

}