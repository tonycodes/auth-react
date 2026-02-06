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
export declare function useProviders(): UseProvidersResult;
//# sourceMappingURL=useProviders.d.ts.map