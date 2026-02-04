import { useEffect, useState } from 'react';
import { useAuthConfig } from './useAuth.js';

type Mode = 'signin' | 'signup';

const ERROR_MESSAGES: Record<string, string> = {
  account_not_found: 'No account found with that login. Sign up to create one.',
  oauth_failed: 'Something went wrong during sign in. Please try again.',
  missing_code: 'Authorization failed. Please try again.',
  invalid_state: 'Session expired. Please try again.',
};

const GITHUB_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface SignInFormProps {
  providers?: string[];
  className?: string;
}

export function SignInForm({ providers = ['github'], className }: SignInFormProps) {
  const config = useAuthConfig();
  const [activeTab, setActiveTab] = useState<Mode>('signin');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    const tabParam = params.get('tab') as Mode | null;
    const returnToParam = params.get('returnTo');

    if (returnToParam) setReturnTo(returnToParam);

    if (errorParam) {
      setErrorMessage(ERROR_MESSAGES[errorParam] || `Authentication error: ${errorParam}`);
      if (errorParam === 'account_not_found') {
        setActiveTab('signup');
      }
    }

    if (tabParam === 'signin' || tabParam === 'signup') {
      setActiveTab(tabParam);
    }
  }, []);

  function handleOAuth(provider: string) {
    const redirectUri = `${config.appUrl}/auth/callback`;
    const state = btoa(JSON.stringify({ returnTo }));
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      state,
      provider,
      mode: activeTab,
    });
    window.location.href = `${config.authUrl}/authorize?${params}`;
  }

  function switchTab(tab: Mode) {
    setActiveTab(tab);
    setErrorMessage(null);
  }

  function tabClass(tab: Mode): string {
    const isActive = activeTab === tab;
    return [
      'flex-1 py-2 text-sm font-medium rounded-lg text-center cursor-pointer transition-colors',
      isActive ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700',
    ].join(' ');
  }

  return (
    <div className={className || ''}>
      {/* Tab toggle */}
      <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl mb-6">
        <button type="button" className={tabClass('signin')} onClick={() => switchTab('signin')}>
          Sign In
        </button>
        <button type="button" className={tabClass('signup')} onClick={() => switchTab('signup')}>
          Sign Up
        </button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Provider buttons */}
      {providers.includes('github') && (
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          onClick={() => handleOAuth('github')}
        >
          {GITHUB_ICON}
          <span>{activeTab === 'signin' ? 'Sign in with GitHub' : 'Sign up with GitHub'}</span>
        </button>
      )}

      {/* Terms */}
      <p className="mt-6 text-center text-xs text-zinc-400">
        By continuing, you agree to our terms of service.
      </p>
    </div>
  );
}
