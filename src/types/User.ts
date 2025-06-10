export interface User {
    id: string;
    isActive: boolean;
    email: string;
    passwordHash: string;
    roles: string[];
    projects: string[];
}
