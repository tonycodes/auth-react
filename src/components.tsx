import type { ReactNode } from 'react';
import { useAuth } from './useAuth.js';

interface AuthGateProps {
  children: ReactNode;
}

/**
 * Renders children only when user is authenticated
 */
export function SignedIn({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading || !isAuthenticated) return null;
  return <>{children}</>;
}

/**
 * Renders children only when user is NOT authenticated
 */
export function SignedOut({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading || isAuthenticated) return null;
  return <>{children}</>;
}

/**
 * Redirects to auth service sign-in when user is not authenticated
 */
export function RedirectToSignIn() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    login();
    return null;
  }

  return null;
}
