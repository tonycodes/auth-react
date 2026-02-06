import { useEffect, useState } from 'react';
import { useAuthConfig } from './useAuth.js';

export interface ProviderInfo {
  id: string;
  name: string;
  enabled: boolean;
}

export interface UseProvidersResult {
  providers: ProviderInfo[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch available SSO providers for the current organization.
 * Automatically fetches providers based on the client_id from AuthProvider config.
 */
export function useProviders(): UseProvidersResult {
  const config = useAuthConfig();
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProviders() {
      try {
        setIsLoading(true);
        setError(null);

        const url = new URL(`${config.authUrl}/providers`);
        url.searchParams.set('client_id', config.clientId);

        const res = await fetch(url.toString());
        if (!res.ok) {
          throw new Error(`Failed to fetch providers: ${res.status}`);
        }

        const data = await res.json();
        if (mounted) {
          setProviders(data.providers || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch providers');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProviders();

    return () => {
      mounted = false;
    };
  }, [config.authUrl, config.clientId]);

  return { providers, isLoading, error };
}
