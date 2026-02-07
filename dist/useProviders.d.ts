export type SSOProvider = 'github' | 'google' | 'apple' | 'bitbucket';
export interface ProviderInfo {
    id: SSOProvider;
    name: string;
    enabled: boolean;
}
export interface UseProvidersResult {
    providers: ProviderInfo[];
    isLoading: boolean;
    error: string | null;
    /** Force refetch, bypassing cache */
    refresh: () => void;
}
/**
 * Hook to fetch available SSO providers from the auth service.
 * Uses module-level cache with 60s TTL and stale-while-revalidate.
 * Clears cache on window.focus for admin changes to take effect.
 */
export declare function useProviders(): UseProvidersResult;
//# sourceMappingURL=useProviders.d.ts.map