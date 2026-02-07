import { type ReactNode } from 'react';
import type { AuthConfig, ResolvedAuthConfig, AuthState } from './types.js';
export declare const AuthContext: import("react").Context<AuthState | null>;
export declare const AuthConfigContext: import("react").Context<ResolvedAuthConfig | null>;
interface AuthProviderProps {
    config: AuthConfig;
    children: ReactNode;
}
export declare function AuthProvider({ config, children }: AuthProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AuthProvider.d.ts.map