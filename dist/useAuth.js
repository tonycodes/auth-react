import { useContext } from 'react';
import { AuthContext, AuthConfigContext } from './AuthProvider.js';
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
export function useAuthConfig() {
    const config = useContext(AuthConfigContext);
    if (!config) {
        throw new Error('useAuthConfig must be used within an AuthProvider');
    }
    return config;
}
//# sourceMappingURL=useAuth.js.map