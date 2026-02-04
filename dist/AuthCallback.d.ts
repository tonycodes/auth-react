interface AuthCallbackProps {
    /** API URL to exchange code (defaults to current origin) */
    apiUrl?: string;
    /** Where to redirect after successful auth */
    onSuccess?: (returnTo: string) => void;
    /** Called on auth failure */
    onError?: (error: string) => void;
}
/**
 * Component that handles the OAuth callback.
 * Mount at /auth/callback route.
 *
 * Exchanges the authorization code for tokens via the backend proxy,
 * then redirects to the original page.
 */
export declare function AuthCallback({ apiUrl, onSuccess, onError }: AuthCallbackProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AuthCallback.d.ts.map