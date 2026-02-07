import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AuthConfig, ResolvedAuthConfig, AuthUser, AuthOrganization, AuthState } from './types.js';
import { validateConfig } from './validateConfig.js';

const DEFAULT_AUTH_URL = 'https://auth.tony.codes';

interface JWTPayload {
  sub: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  org: { id: string; name: string; slug: string; role: string } | null;
  isSuperAdmin: boolean;
  exp: number;
}

function decodeJWT(token: string): JWTPayload {
  try {
    const base64 = token.split('.')[1];
    if (!base64) throw new Error('Invalid token structure');
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    throw new Error('Failed to decode access token — the token may be malformed');
  }
}

export const AuthContext = createContext<AuthState | null>(null);
export const AuthConfigContext = createContext<ResolvedAuthConfig | null>(null);

interface AuthProviderProps {
  config: AuthConfig;
  children: ReactNode;
}

/**
 * Resolve config by discovering missing URLs from the auth service.
 * 1. If appUrl provided explicitly → use it, skip discovery
 * 2. Otherwise → fetch from /api/client-apps/:clientId/config
 * 3. Fallback → use window.location.origin
 */
async function resolveConfig(config: AuthConfig): Promise<ResolvedAuthConfig> {
  const authUrl = config.authUrl || DEFAULT_AUTH_URL;
  let appUrl = config.appUrl;
  let apiUrl = config.apiUrl;

  // If appUrl is already provided, skip discovery
  if (!appUrl) {
    try {
      const res = await fetch(`${authUrl}/api/client-apps/${config.clientId}/config`);
      if (res.ok) {
        const data = await res.json();
        appUrl = data.appUrl || undefined;
        if (!apiUrl) apiUrl = data.apiUrl || undefined;
      }
    } catch {
      // Discovery failed — use fallback
    }
  }

  // Fallback to window.location.origin
  if (!appUrl && typeof window !== 'undefined') {
    appUrl = window.location.origin;
  }

  if (!appUrl) {
    appUrl = authUrl; // Last resort
  }

  return {
    clientId: config.clientId,
    authUrl,
    appUrl,
    apiUrl: apiUrl || appUrl,
  };
}

export function AuthProvider({ config, children }: AuthProviderProps) {
  // Validate config on initialization (throws if invalid)
  validateConfig(config);

  const [resolved, setResolved] = useState<ResolvedAuthConfig | null>(() => {
    // If all URLs are provided, resolve synchronously
    const authUrl = config.authUrl || DEFAULT_AUTH_URL;
    if (config.appUrl) {
      return {
        clientId: config.clientId,
        authUrl,
        appUrl: config.appUrl,
        apiUrl: config.apiUrl || config.appUrl,
      };
    }
    return null;
  });

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<AuthOrganization | null>(null);
  const [organizations, setOrganizations] = useState<AuthOrganization[]>([]);
  const [orgRole, setOrgRole] = useState<string>('member');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const refreshLockRef = useRef(false);

  // Discover config if needed
  useEffect(() => {
    if (resolved) return; // Already resolved synchronously
    let mounted = true;
    resolveConfig(config).then((r) => {
      if (mounted) setResolved(r);
    });
    return () => { mounted = false; };
  }, [config, resolved]);

  const updateFromToken = useCallback((token: string) => {
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
    } else {
      setOrganization(null);
      setOrgRole('member');
    }

    setIsSuperAdmin(payload.isSuperAdmin);
    setAccessToken(token);

    return payload;
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (!resolved) return null;
    if (refreshLockRef.current) return null;
    refreshLockRef.current = true;

    try {
      const res = await fetch(`${resolved.apiUrl}/auth/refresh`, {
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
      const refreshIn = Math.max(expiresIn - 60_000, 10_000);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => {
        refreshToken();
      }, refreshIn);

      return data.access_token;
    } catch {
      return null;
    } finally {
      refreshLockRef.current = false;
    }
  }, [resolved, updateFromToken]);

  // Fetch user organizations list
  const fetchOrganizations = useCallback(async (token: string) => {
    if (!resolved) return;
    try {
      const res = await fetch(`${resolved.authUrl}/api/organizations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
      }
    } catch {
      // Silent failure — orgs list is supplementary
    }
  }, [resolved]);

  // Initial auth check — try to refresh on mount (after config resolves)
  useEffect(() => {
    if (!resolved) return;
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
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [resolved, refreshToken, fetchOrganizations]);

  const login = useCallback((provider?: string) => {
    if (!resolved) return;
    const redirectUri = `${resolved.appUrl}/auth/callback`;
    const state = btoa(JSON.stringify({ returnTo: window.location.pathname }));
    const params = new URLSearchParams({
      client_id: resolved.clientId,
      redirect_uri: redirectUri,
      state,
    });
    if (provider) params.set('provider', provider);
    window.location.href = `${resolved.authUrl}/authorize?${params}`;
  }, [resolved]);

  const logout = useCallback(async () => {
    if (!resolved) return;
    setIsLoggingOut(true);
    try {
      await fetch(`${resolved.apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Best-effort
    }
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setAccessToken(null);
    setUser(null);
    setOrganization(null);
    setOrganizations([]);
    setIsLoggingOut(false);
  }, [resolved]);

  const switchOrganization = useCallback(
    async (orgId: string) => {
      if (!resolved) return;
      try {
        const res = await fetch(`${resolved.apiUrl}/auth/switch-org`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ org_id: orgId }),
        });

        if (res.ok) {
          const data = await res.json();
          updateFromToken(data.access_token);
        }
      } catch {
        // Silent failure
      }
    },
    [resolved, updateFromToken],
  );

  const isAdmin = orgRole === 'admin' || orgRole === 'owner';
  const isOwner = orgRole === 'owner';

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (accessToken) {
      try {
        const payload = decodeJWT(accessToken);
        if (payload.exp * 1000 - Date.now() > 60_000) {
          return accessToken;
        }
      } catch {
        // Fall through to refresh
      }
    }
    return refreshToken();
  }, [accessToken, refreshToken]);

  const value: AuthState = {
    isAuthenticated: !!accessToken && !!organization,
    isLoading: isLoading || !resolved,
    user,
    organization,
    tenant: organization ? { id: organization.id, name: organization.name, slug: organization.slug } : null,
    isAdmin,
    isOwner,
    orgRole,
    isSuperAdmin,
    isPlatformAdmin: isSuperAdmin,
    accessToken,
    getAccessToken,
    login,
    logout,
    switchOrganization,
    organizations,
    isLoggingOut,
    isLoggingIn: false,
    loginError: null,
    impersonating: false,
  };

  // Use resolved config for context, or a placeholder during discovery
  const configValue: ResolvedAuthConfig = resolved || {
    clientId: config.clientId,
    authUrl: config.authUrl || DEFAULT_AUTH_URL,
    appUrl: config.appUrl || '',
    apiUrl: config.apiUrl || config.appUrl || '',
  };

  return (
    <AuthConfigContext.Provider value={configValue}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </AuthConfigContext.Provider>
  );
}
