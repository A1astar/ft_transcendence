export function* generateId() : Generator<number> {
    let id = 1;

    while (true) {
        yield id;
        ++id;
    }
}

export class User {
    name: string;
    email: string;
    password: string;

    // get printUser(user: User) {
    //     console.log(user.name + user.email);
    // }

    constructor(name: string, password: string, email: string)
    {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
