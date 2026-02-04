import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
function decodeJWT(token) {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
}
export const AuthContext = createContext(null);
export function AuthProvider({ config, children }) {
    const { authUrl, clientId, appUrl, apiUrl } = config;
    const baseApiUrl = apiUrl || appUrl;
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [orgRole, setOrgRole] = useState('member');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const refreshTimerRef = useRef();
    const refreshLockRef = useRef(false);
    const updateFromToken = useCallback((token) => {
        const payload = decodeJWT(token);
        setUser({
            id: payload.sub,
            email: payload.email,
            name: payload.name || 'User',
            role: payload.org?.role === 'owner' || payload.org?.role === 'admin' ? 'admin' : 'member',
            imageUrl: payload.avatarUrl,
        });
        if (payload.org) {
            setOrganization({
                id: payload.org.id,
                name: payload.org.name,
                slug: payload.org.slug,
                imageUrl: null,
            });
            setOrgRole(payload.org.role);
        }
        else {
            setOrganization(null);
            setOrgRole('member');
        }
        setIsSuperAdmin(payload.isSuperAdmin);
        setAccessToken(token);
        return payload;
    }, []);
    const refreshToken = useCallback(async () => {
        if (refreshLockRef.current)
            return null;
        refreshLockRef.current = true;
        try {
            const res = await fetch(`${baseApiUrl}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
                setAccessToken(null);
                setUser(null);
                setOrganization(null);
                return null;
            }
            const data = await res.json();
            const payload = updateFromToken(data.access_token);
            // Schedule next refresh 1 minute before expiry
            const expiresIn = payload.exp * 1000 - Date.now();
            const refreshIn = Math.max(expiresIn - 60000, 10000);
            if (refreshTimerRef.current)
                clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = setTimeout(() => {
                refreshToken();
            }, refreshIn);
            return data.access_token;
        }
        catch {
            return null;
        }
        finally {
            refreshLockRef.current = false;
        }
    }, [baseApiUrl, updateFromToken]);
    // Fetch user organizations list
    const fetchOrganizations = useCallback(async (token) => {
        try {
            const res = await fetch(`${authUrl}/api/organizations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setOrganizations(data.organizations || []);
            }
        }
        catch {
            // Silent failure — orgs list is supplementary
        }
    }, [authUrl]);
    // Initial auth check — try to refresh on mount
    useEffect(() => {
        let mounted = true;
        async function init() {
            const token = await refreshToken();
            if (mounted) {
                if (token) {
                    await fetchOrganizations(token);
                }
                setIsLoading(false);
            }
        }
        init();
        return () => {
            mounted = false;
            if (refreshTimerRef.current)
                clearTimeout(refreshTimerRef.current);
        };
    }, [refreshToken, fetchOrganizations]);
    const login = useCallback(() => {
        const redirectUri = `${appUrl}/auth/callback`;
        const state = btoa(JSON.stringify({ returnTo: window.location.pathname }));
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            state,
        });
        window.location.href = `${authUrl}/authorize?${params}`;
    }, [authUrl, clientId, appUrl]);
    const logout = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await fetch(`${baseApiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        }
        catch {
            // Best-effort
        }
        if (refreshTimerRef.current)
            clearTimeout(refreshTimerRef.current);
        setAccessToken(null);
        setUser(null);
        setOrganization(null);
        setOrganizations([]);
        setIsLoggingOut(false);
    }, [baseApiUrl]);
    const switchOrganization = useCallback(async (orgId) => {
        try {
            const res = await fetch(`${baseApiUrl}/auth/switch-org`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ org_id: orgId }),
            });
            if (res.ok) {
                const data = await res.json();
                updateFromToken(data.access_token);
            }
        }
        catch {
            // Silent failure
        }
    }, [baseApiUrl, updateFromToken]);
    const isAdmin = orgRole === 'admin' || orgRole === 'owner';
    const isOwner = orgRole === 'owner';
    const value = {
        isAuthenticated: !!accessToken && !!organization,
        isLoading,
        user,
        organization,
        tenant: organization ? { id: organization.id, name: organization.name, slug: organization.slug } : null,
        isAdmin,
        isOwner,
        orgRole,
        isSuperAdmin,
        isPlatformAdmin: isSuperAdmin,
        login,
        logout,
        switchOrganization,
        organizations,
        isLoggingOut,
        isLoggingIn: false,
        loginError: null,
        impersonating: false,
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
//# sourceMappingURL=AuthProvider.js.map