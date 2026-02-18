import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth, useAuthConfig } from './useAuth.js';
export function useConnections(options) {
    const { getAccessToken, organization } = useAuth();
    const config = useAuthConfig();
    const statusEndpoint = options?.statusEndpoint || '/api/connections/status';
    const defaultRedirectPath = options?.redirectPath || '/settings?tab=connections';
    const [connections, setConnections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);
    const fetchStatus = useCallback(async () => {
        if (!config.apiUrl)
            return;
        setIsLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            const res = await fetch(`${config.apiUrl}${statusEndpoint}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                credentials: 'include',
            });
            if (!res.ok)
                throw new Error(`Failed to fetch connection status: ${res.status}`);
            const data = (await res.json());
            if (mountedRef.current)
                setConnections(data.connections);
        }
        catch (err) {
            if (mountedRef.current)
                setError(err);
        }
        finally {
            if (mountedRef.current)
                setIsLoading(false);
        }
    }, [config.apiUrl, statusEndpoint, getAccessToken]);
    useEffect(() => {
        mountedRef.current = true;
        fetchStatus();
        return () => {
            mountedRef.current = false;
        };
    }, [fetchStatus, organization?.id]);
    const connectProvider = useCallback(async (provider, redirectPath) => {
        const token = await getAccessToken();
        if (!token)
            throw new Error('Not authenticated');
        const orgId = organization?.id;
        if (!orgId)
            throw new Error('No organization selected');
        const redirectUri = `${config.appUrl}${redirectPath || defaultRedirectPath}`;
        const url = `${config.authUrl}/api/connections/${encodeURIComponent(provider)}/authorize` +
            `?org_id=${encodeURIComponent(orgId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&client_id=${encodeURIComponent(config.clientId)}` +
            `&token=${encodeURIComponent(token)}`;
        window.location.href = url;
    }, [getAccessToken, organization?.id, config, defaultRedirectPath]);
    return { connections, isLoading, error, refetch: fetchStatus, connectProvider };
}
//# sourceMappingURL=useConnections.js.map