import { useContext } from 'react';
import { AuthContext, AuthConfigContext } from './AuthProvider.js';
import type { ResolvedAuthConfig, AuthState } from './types.js';

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthConfig(): ResolvedAuthConfig {
  const config = useContext(AuthConfigContext);
  if (!config) {
    throw new Error('useAuthConfig must be used within an AuthProvider');
  }
  return config;
}
