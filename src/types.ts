export interface AuthConfig {
  /** Auth service URL (e.g., https://auth.tony.codes) */
  authUrl: string;
  /** Client ID registered with auth service */
  clientId: string;
  /** This app's base URL (for redirect_uri construction) */
  appUrl: string;
  /**
   * API base URL for proxied auth endpoints (callback, refresh, logout).
   * Required if your API runs on a different subdomain than your frontend
   * (e.g., api.myapp.test vs myapp.test).
   * Defaults to appUrl if not specified.
   */
  apiUrl?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  imageUrl: string | null;
}

export interface AuthOrganization {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  organization: AuthOrganization | null;
  tenant: { id: string; name: string; slug: string } | null; // legacy alias
  isAdmin: boolean;
  isOwner: boolean;
  orgRole: string;
  isSuperAdmin: boolean;
  isPlatformAdmin: boolean;
  accessToken: string | null;
  getAccessToken: () => Promise<string | null>;
  login: (provider?: string) => void;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  organizations: AuthOrganization[];
  isLoggingOut: boolean;
  isLoggingIn: boolean;
  loginError: string | null;
  impersonating: boolean;
}
