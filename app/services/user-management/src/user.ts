import { UserFormat } from './format.js';
import crypto from 'crypto';

export class User implements UserFormat {
    id: string;
    name: string;
    email: string;
    password: string;

    constructor()
    {
        // this.id = idGenerator.next().value;
        this.id = crypto.randomUUID();
        this.name = request.name;
        this.email = request.email;
        this.password = request.password;
    }
}
