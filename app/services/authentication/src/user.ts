import { RegistrationFormat  } from "./format";
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
    passwordHash: string; // 存儲雜湊後的密碼 / Store hashed password

    constructor(request: RegistrationFormat, passwordHash: string)
    {
        // this.id = idGenerator.next().value;
        this.id = crypto.randomUUID();
        this.name = request.name;
        this.email = request.email;
        this.passwordHash = passwordHash; // 存儲已經雜湊的密碼 / Store already hashed password
    }
}
