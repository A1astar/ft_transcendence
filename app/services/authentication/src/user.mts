export class User  {
    constructor(id: string, mail: string, name: string, password: string, session: string,
        isActive: boolean
    ) {
        this.id = id;
        this.mail = mail;
        this.name = name;
        this.password = password;
        this.session = session;
        this.isActive = false;
    }

    id: string;
    mail: string;
    name: string;
    password: string;
    session: string;
    isActive: boolean;
}