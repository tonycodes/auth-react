import type { ReactNode } from 'react';
interface AuthGateProps {
    children: ReactNode;
}
/**
 * Renders children only when user is authenticated
 */
export declare function SignedIn({ children }: AuthGateProps): import("react/jsx-runtime").JSX.Element | null;
/**
 * Renders children only when user is NOT authenticated
 */
export declare function SignedOut({ children }: AuthGateProps): import("react/jsx-runtime").JSX.Element | null;
/**
 * Redirects to auth service sign-in when user is not authenticated
 */
export declare function RedirectToSignIn(): null;
export {};
//# sourceMappingURL=components.d.ts.map