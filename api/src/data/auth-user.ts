
export interface AuthUser {
    id: string;
    display_name: string;
    family_name: string;
    given_name: string;
    username: string;
    email: string;
    email_verified: boolean;
}

export namespace AuthUser {
    export function fromPassport(user: any): AuthUser {
        return {
            id: user.id,
            display_name: user.displayName,
            family_name: user.name.familyName,
            given_name: user.name.givenName,
            username: user._json.preferred_username,
            email: user._json.email,
            email_verified: user._json.email_verified
        };
    }
}
