import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
/**
 * Component that handles the OAuth callback.
 * Mount at /auth/callback route.
 *
 * Exchanges the authorization code for tokens via the backend proxy,
 * then redirects to the original page.
 */
export function AuthCallback({ apiUrl, onSuccess, onError }) {
    const [error, setError] = useState(null);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');
        if (errorParam) {
            setError(errorParam);
            onError?.(errorParam);
            return;
        }
        if (!code) {
            setError('Missing authorization code');
            onError?.('Missing authorization code');
            return;
        }
        const baseUrl = apiUrl || window.location.origin;
        async function exchange() {
            try {
                const res = await fetch(`${baseUrl}/auth/callback?code=${encodeURIComponent(code)}`, {
                    credentials: 'include',
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Authentication failed');
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
    }, [apiUrl, onSuccess, onError]);
    if (error) {
        return (_jsxs("div", { style: { padding: '2rem', textAlign: 'center' }, children: [_jsx("h2", { children: "Authentication Failed" }), _jsx("p", { children: error }), _jsx("a", { href: "/", children: "Go Home" })] }));
    }
    return (_jsx("div", { style: { padding: '2rem', textAlign: 'center' }, children: _jsx("p", { children: "Signing in..." }) }));
}
//# sourceMappingURL=AuthCallback.js.map