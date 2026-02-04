import { useContext } from 'react';
import { AuthContext } from './AuthProvider.js';
import type { AuthState } from './types.js';

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
