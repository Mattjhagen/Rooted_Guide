/**
 * User session information
 */
export interface UserSession {
  userId: string;
  email?: string;
  provider: 'email' | 'google' | 'apple';
  createdAt: Date;
}

/**
 * Gateway interface for authentication
 * Production implementation will use server-side OAuth and secure session management
 *
 * NOTE: This is an interface definition only. Do not implement authentication in Prompt 2.
 */
export interface AuthGateway {
  /**
   * Get the current user session (if any)
   */
  getCurrentSession(): Promise<UserSession | null>;

  /**
   * Sign in with email and password
   */
  signInWithEmail(email: string, password: string): Promise<UserSession>;

  /**
   * Sign in with OAuth provider
   */
  signInWithOAuth(provider: 'google' | 'apple'): Promise<UserSession>;

  /**
   * Sign out
   */
  signOut(): Promise<void>;

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (session: UserSession | null) => void): () => void;
}
