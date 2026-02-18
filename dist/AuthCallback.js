import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthConfigContext, AuthContext } from './AuthProvider.js';
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
export function AuthCallback({ apiUrl: apiUrlProp, onSuccess, onError }) {
    const config = useContext(AuthConfigContext);
    const auth = useContext(AuthContext);
    const [error, setError] = useState(null);
    const exchangedRef = useRef(false);
    useEffect(() => {
        // Guard against React 18 strict mode double-firing
        if (exchangedRef.current)
            return;
        exchangedRef.current = true;
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');
        if (errorParam) {
            setError(errorParam);
            if (onError) {
                onError(errorParam);
            }
            else {
                let redirectReturnTo = '/';
                if (state) {
                    try {
                        const decoded = JSON.parse(atob(state));
                        redirectReturnTo = decoded.returnTo || '/';
                    }
                    catch {
                        // Invalid state — default to /
                    }
                }
                const loginUrl = new URL('/login', window.location.origin);
                loginUrl.searchParams.set('error', errorParam);
                if (redirectReturnTo !== '/')
                    loginUrl.searchParams.set('returnTo', redirectReturnTo);
                window.location.href = loginUrl.toString();
            }
            return;
        }
        if (!code) {
            setError('Missing authorization code');
            onError?.('Missing authorization code');
            return;
        }
        // Resolve API URL: prop > config.apiUrl > config.appUrl > current origin
        const baseUrl = apiUrlProp || config?.apiUrl || config?.appUrl || window.location.origin;
        async function exchange() {
            try {
                const res = await fetch(`${baseUrl}/api/auth/callback?code=${encodeURIComponent(code)}`, {
                    credentials: 'include',
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Authentication failed');
                }
                // Sync AuthProvider state from the new refresh cookie so
                // isAuthenticated updates immediately (no full page reload needed)
                if (auth?.refreshSession) {
                    await auth.refreshSession();
                }
                // Decode state to get returnTo path
                let returnTo = '/';
                if (state) {
                    try {
                        const decoded = JSON.parse(atob(state));
                        returnTo = decoded.returnTo || '/';
                    }
                    catch {
                        // Invalid state — default to /
                    }
                }
                if (onSuccess) {
                    onSuccess(returnTo);
                }
                else {
                    window.location.href = returnTo;
                }
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Authentication failed';
                setError(message);
                onError?.(message);
            }
        }
        exchange();
    }, [apiUrlProp, config, auth, onSuccess, onError]);
    if (error) {
        return (_jsxs("div", { style: { padding: '2rem', textAlign: 'center' }, children: [_jsx("h2", { children: "Authentication Failed" }), _jsx("p", { children: error }), _jsx("a", { href: "/", children: "Go Home" })] }));
    }
    return (_jsx("div", { style: { padding: '2rem', textAlign: 'center' }, children: _jsx("p", { children: "Signing in..." }) }));
}
//# sourceMappingURL=AuthCallback.js.map