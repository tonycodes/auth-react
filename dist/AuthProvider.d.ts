import { type ReactNode } from 'react';
import type { AuthConfig, AuthState } from './types.js';
export declare const AuthContext: import("react").Context<AuthState | null>;
interface AuthProviderProps {
    config: AuthConfig;
    children: ReactNode;
}
export declare function AuthProvider({ config, children }: AuthProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AuthProvider.d.ts.map