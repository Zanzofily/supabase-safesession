import { UserAppMetadata, UserMetadata, AuthenticatorAssuranceLevels, AMREntry, SupabaseClient } from '@supabase/supabase-js';
import { JwtPayload } from 'jsonwebtoken';

interface SupabaseJwtPayload extends JwtPayload {
    sub: string;
    id: string;
    aud: string;
    role?: string;
    email?: string;
    phone?: string;
    is_anonymous?: boolean;
    app_metadata: UserAppMetadata;
    user_metadata: UserMetadata;
    session_id?: string;
    aal?: AuthenticatorAssuranceLevels;
    amr?: AMREntry;
}
type AuthResponse = {
    status: "success" | "error";
    data?: SupabaseJwtPayload;
    error?: string;
};

declare class AuthManager {
    private supabase;
    private jwtSecret;
    /**
     * Initializes the authentication manager with necessary dependencies.
     * @param supabase An instance of @supabase/ssr client
     * @param jwtSecret The secret used to verify JWTs.
     */
    constructor(supabase: SupabaseClient<any, any, any>, jwtSecret: string);
    /**
     * Retrieves authentication tokens from cookies.
     * @returns {AuthTokens | null} AuthTokens if found and correctly parsed, null otherwise.
     */
    private getAuthTokensFromCookies;
    /**
     * Verifies the JWT token, refreshes it if expired, and returns user data.
     * @returns {Promise<AuthResponse>} The user session data if successful, or an error message.
     */
    getSafeSession(): Promise<AuthResponse>;
    /**
     * Verifies the JWT access token and decodes it. Handles token expiration by refreshing it.
     * @param tokens The authentication tokens obtained from cookies.
     * @returns {Promise<AuthResponse>} The decoded JWT payload or an error.
     */
    private parseAndVerifySession;
    /**
     * Refreshes the session when the JWT has expired.
     * @param tokens The authentication tokens.
     * @returns {Promise<AuthResponse>} The new session data or an error.
     */
    private refreshSession;
}

export { AuthManager };
