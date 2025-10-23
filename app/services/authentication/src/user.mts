interface RegisterRequest {
    name: string;
    password: string;
}

interface LoginRequest {
    name: string;
    password: string;
    email: string;
}

// global.
// window.
// globalThis

export class User  {
    set() {

    }

    get() {

    }

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