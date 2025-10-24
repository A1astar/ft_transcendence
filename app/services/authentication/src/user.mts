// global.
// window.
// globalThis

export function* generateId() : Generator<number> {
    let id = 1;

    while (true) {
        yield id;
        ++id;
    }
}

export class User {
    // constructor(id: number, mail: string, name: string, password: string, session: string,
    //     isActive: boolean
    constructor(name: string, password: string)
    {
        this.name = name;
        this.password = password;
    }

    name: string;
    password: string;
}
