export interface User {
    id: string;
    isActive: boolean;
    email: string;
    name?: string;
    passwordHash?: string;

    roles: string[];
    projects: string[];
    auth?: Record<string, any>;
}
