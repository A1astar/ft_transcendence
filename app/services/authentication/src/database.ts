export interface User  {
    id: string;
    name: string;
    password: string;
    session: string;
    isActive: boolean;
}

export interface Database {
    // users: Map<string, User>();
}