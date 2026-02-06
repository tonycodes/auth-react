interface AuthCallbackProps {
    /** API URL to exchange code (overrides config.apiUrl, defaults to current origin) */
    apiUrl?: string;
    /** Where to redirect after successful auth */
    onSuccess?: (returnTo: string) => void;
    /** Called on auth failure */
    onError?: (error: string) => void;
}
/**
 * Component that handles the OAuth callback.
 * Mount at /auth/callback route in your React router.
 *
 * When mounted, this component:
 * 1. Extracts the authorization code from the URL
 * 2. Calls /api/auth/callback on the backend to exchange the code for tokens
 * 3. Redirects to the original page (from state)
 *
 * Your Express backend should mount callbackHandler() at /api/auth/callback.
 *
 * The API URL is resolved in this order:
 * 1. `apiUrl` prop (explicit override)
 * 2. `config.apiUrl` from AuthProvider
 * 3. `config.appUrl` from AuthProvider
 * 4. Current window origin (fallback)
 */
export declare function AuthCallback({ apiUrl: apiUrlProp, onSuccess, onError }: AuthCallbackProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AuthCallback.d.ts.map