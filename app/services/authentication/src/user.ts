import { RegistrationFormat  } from "./format.js";
import crypto from 'crypto';

const idGenerator = generateId();

export function* generateId() : Generator<number> {
    let id = 1;
    while (true) {
        yield id;
        ++id;
    }
}

export class User {
    id: string;
    name: string;
    email: string;
    password: string;

    constructor(request: RegistrationFormat)
    {
        // this.id = idGenerator.next().value;
        this.id = crypto.randomUUID();
        this.name = request.name;
        this.email = request.email;
        this.password = request.password;
    }
}
