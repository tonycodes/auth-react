import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth, useAuthConfig } from './useAuth.js';

export interface ConnectionStatus {
  provider: string;
  connected: boolean;
  displayName?: string;
  status?: string;
}

export interface UseConnectionsOptions {
  /** Backend endpoint for connection status. Defaults to '/api/connections/status' */
  statusEndpoint?: string;
  /** Path to redirect back to after connecting. Defaults to '/settings?tab=connections' */
  redirectPath?: string;
}

export interface UseConnectionsResult {
  connections: ConnectionStatus[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  /** Redirect to auth service to initiate OAuth connection for a provider */
  connectProvider: (provider: string, redirectPath?: string) => Promise<void>;
}

export function useConnections(options?: UseConnectionsOptions): UseConnectionsResult {
  const { getAccessToken, organization } = useAuth();
  const config = useAuthConfig();
  const statusEndpoint = options?.statusEndpoint || '/api/connections/status';
  const defaultRedirectPath = options?.redirectPath || '/settings?tab=connections';

  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    if (!config.apiUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${config.apiUrl}${statusEndpoint}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to fetch connection status: ${res.status}`);
      const data = (await res.json()) as { connections: ConnectionStatus[] };
      if (mountedRef.current) setConnections(data.connections);
    } catch (err) {
      if (mountedRef.current) setError(err as Error);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [config.apiUrl, statusEndpoint, getAccessToken]);

  useEffect(() => {
    mountedRef.current = true;
    fetchStatus();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchStatus, organization?.id]);

  const connectProvider = useCallback(
    async (provider: string, redirectPath?: string) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const orgId = organization?.id;
      if (!orgId) throw new Error('No organization selected');

      const redirectUri = `${config.appUrl}${redirectPath || defaultRedirectPath}`;
      const url =
        `${config.authUrl}/api/connections/${encodeURIComponent(provider)}/authorize` +
        `?org_id=${encodeURIComponent(orgId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&client_id=${encodeURIComponent(config.clientId)}` +
        `&token=${encodeURIComponent(token)}`;

      window.location.href = url;
    },
    [getAccessToken, organization?.id, config, defaultRedirectPath],
  );

  return { connections, isLoading, error, refetch: fetchStatus, connectProvider };
}
