import { useCallback, useEffect, useState } from 'react';
import { useAuthConfig } from './useAuth.js';
const CACHE_TTL = 60000; // 60 seconds
const cache = new Map();
function getCacheKey(authUrl, clientId) {
    return `${authUrl}::${clientId}`;
}
function getCachedProviders(key) {
    const entry = cache.get(key);
    if (!entry)
        return null;
    return entry;
}
function isStale(entry) {
    return Date.now() - entry.fetchedAt > CACHE_TTL;
}
async function fetchProviders(authUrl, clientId) {
    const url = new URL(`${authUrl}/providers`);
    url.searchParams.set('client_id', clientId);
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error('Failed to fetch providers');
    }
    const data = await res.json();
    return { providers: data.providers || [], emailEnabled: !!data.emailEnabled };
}
// ─── Hook ────────────────────────────────────────────────────────────────
/**
 * Hook to fetch available SSO providers from the auth service.
 * Uses module-level cache with 60s TTL and stale-while-revalidate.
 * Clears cache on window.focus for admin changes to take effect.
 */
export function useProviders() {
    const config = useAuthConfig();
    const cacheKey = getCacheKey(config.authUrl, config.clientId);
    // Initialize from cache if available
    const cached = getCachedProviders(cacheKey);
    const [providers, setProviders] = useState(cached?.providers || []);
    const [emailEnabled, setEmailEnabled] = useState(cached?.emailEnabled || false);
    const [isLoading, setIsLoading] = useState(!cached);
    const [error, setError] = useState(null);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const refresh = useCallback(() => {
        cache.delete(cacheKey);
        setRefreshCounter((c) => c + 1);
    }, [cacheKey]);
    useEffect(() => {
        let mounted = true;
        async function doFetch(showLoading) {
            if (showLoading)
                setIsLoading(true);
            try {
                const result = await fetchProviders(config.authUrl, config.clientId);
                cache.set(cacheKey, { providers: result.providers, emailEnabled: result.emailEnabled, fetchedAt: Date.now() });
                if (mounted) {
                    setProviders(result.providers);
                    setEmailEnabled(result.emailEnabled);
                    setError(null);
                }
            }
            catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch providers');
                    // Keep stale data if we have it
                    if (!cached)
                        setProviders([]);
                }
            }
            finally {
                if (mounted)
                    setIsLoading(false);
            }
        }
        const entry = getCachedProviders(cacheKey);
        if (!entry) {
            // No cache — fetch with loading state
            doFetch(true);
        }
        else if (isStale(entry)) {
            // Stale cache — show cached data, refresh in background
            setProviders(entry.providers);
            setEmailEnabled(entry.emailEnabled);
            setIsLoading(false);
            doFetch(false);
        }
        else {
            // Fresh cache — use it directly
            setProviders(entry.providers);
            setEmailEnabled(entry.emailEnabled);
            setIsLoading(false);
        }
        // Refetch on window focus (admin changes take effect when tab refocused)
        function handleFocus() {
            const current = getCachedProviders(cacheKey);
            if (!current || isStale(current)) {
                doFetch(false);
            }
        }
        window.addEventListener('focus', handleFocus);
        return () => {
            mounted = false;
            window.removeEventListener('focus', handleFocus);
        };
    }, [config.authUrl, config.clientId, cacheKey, refreshCounter]);
    return { providers, emailEnabled, isLoading, error, refresh };
}
//# sourceMappingURL=useProviders.js.map