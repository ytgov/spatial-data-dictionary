
export interface AuthUser {
    id: string;
    display_name: string;
    last_name: string;
    first_name: string;
    username: string;
    email: string;
    email_verified: boolean;
    status: string;
}

export namespace AuthUser {
    export function fromOpenId(user: any): AuthUser {
        return {
            id: user.id,
            display_name: user.name,
            last_name: user.family_name,
            first_name: user.given_name,
            username: user.preferred_username,
            email: user.email,
            email_verified: user.email_verified,
            status: "Active"
        };
    }
}
