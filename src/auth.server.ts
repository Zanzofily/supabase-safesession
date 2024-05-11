import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { SupabaseClient } from "@supabase/supabase-js";
import { AuthResponse, AuthTokens, SupabaseJwtPayload } from "./types";

class AuthManager {
  private supabase: SupabaseClient;
  private jwtSecret: string;

  /**
   * Initializes the authentication manager with necessary dependencies.
   * @param supabase An instance of @supabase/ssr client
   * @param jwtSecret The secret used to verify JWTs.
   */
  constructor(supabase: SupabaseClient<any, any, any>, jwtSecret: string) {
    this.supabase = supabase;
    this.jwtSecret = jwtSecret;
  }

  /**
   * Retrieves authentication tokens from cookies.
   * @returns {AuthTokens | null} AuthTokens if found and correctly parsed, null otherwise.
   */
  private getAuthTokensFromCookies(): AuthTokens | null {
    const cookieNameRegex = /^sb-[a-z]+-auth-token.*$/
    const authCookies = cookies()
      .getAll()
      .filter((cookie) => cookieNameRegex.test(cookie.name))
      .sort((a, b) => a.name.localeCompare(b.name))
    if (!authCookies) {
      return null
    }

    const authCookieValue = authCookies.map((cookie) => cookie.value).join("")

    try {
      const session = JSON.parse(decodeURIComponent(authCookieValue))
      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Verifies the JWT token, refreshes it if expired, and returns user data.
   * @returns {Promise<AuthResponse>} The user session data if successful, or an error message.
   */
  public async getSafeSession(): Promise<AuthResponse> {
    const tokens = this.getAuthTokensFromCookies();
    if (!tokens) {
      return { status: "error", error: "Authentication tokens not found" };
    }
    return this.parseAndVerifySession(tokens);
  }

  /**
   * Verifies the JWT access token and decodes it. Handles token expiration by refreshing it.
   * @param tokens The authentication tokens obtained from cookies.
   * @returns {Promise<AuthResponse>} The decoded JWT payload or an error.
   */
  private async parseAndVerifySession(
    tokens: AuthTokens
  ): Promise<AuthResponse> {
    try {
      const session = jwt.verify(
        tokens.access_token,
        this.jwtSecret
      ) as SupabaseJwtPayload;
      return { status: "success", data: { ...session, id: session.sub } };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return this.refreshSession(tokens);
      } else {
        return { status: "error", error: "JWT verification failed" };
      }
    }
  }

  /**
   * Refreshes the session when the JWT has expired.
   * @param tokens The authentication tokens.
   * @returns {Promise<AuthResponse>} The new session data or an error.
   */
  private async refreshSession(tokens: AuthTokens): Promise<AuthResponse> {
    const session = await this.supabase.auth.setSession(tokens);
    if (session.error) {
      return { status: "error", error: session.error.message };
    }
    if (!session.data || !session.data.user) {
      return {
        status: "error",
        error: "No user data available after refreshing session",
      };
    }
    return {
      status: "success",
      data: { ...session.data.user, sub: session.data.user.id },
    };
  }
}

export default AuthManager;
