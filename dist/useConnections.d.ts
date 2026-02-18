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
export declare function useConnections(options?: UseConnectionsOptions): UseConnectionsResult;
//# sourceMappingURL=useConnections.d.ts.map