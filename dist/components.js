import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from './useAuth.js';
/**
 * Renders children only when user is authenticated
 */
export function SignedIn({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading || !isAuthenticated)
        return null;
    return _jsx(_Fragment, { children: children });
}
/**
 * Renders children only when user is NOT authenticated
 */
export function SignedOut({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading || isAuthenticated)
        return null;
    return _jsx(_Fragment, { children: children });
}
/**
 * Redirects to auth service sign-in when user is not authenticated
 */
export function RedirectToSignIn() {
    const { isAuthenticated, isLoading, login } = useAuth();
    if (isLoading)
        return null;
    if (!isAuthenticated) {
        login();
        return null;
    }
    return null;
}
//# sourceMappingURL=components.js.map