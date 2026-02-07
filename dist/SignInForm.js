import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuthConfig } from './useAuth.js';
import { useProviders } from './useProviders.js';
const ERROR_MESSAGES = {
    account_not_found: 'No account found with that login. Sign up to create one.',
    oauth_failed: 'Something went wrong during sign in. Please try again.',
    missing_code: 'Authorization failed. Please try again.',
    invalid_state: 'Session expired. Please try again.',
};
// ─── Inline Styles ───────────────────────────────────────────────────────
const styles = {
    tabContainer: (isDark) => ({
        display: 'flex',
        gap: '4px',
        padding: '4px',
        backgroundColor: isDark ? '#1f2937' : '#f4f4f5',
        borderRadius: '12px',
        marginBottom: '24px',
    }),
    tab: (isActive, isDark) => ({
        flex: 1,
        padding: '8px 0',
        fontSize: '14px',
        fontWeight: 500,
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'background-color 0.15s, color 0.15s',
        border: 'none',
        backgroundColor: isActive
            ? (isDark ? '#374151' : '#ffffff')
            : 'transparent',
        color: isActive
            ? (isDark ? '#f9fafb' : '#18181b')
            : (isDark ? '#9ca3af' : '#71717a'),
        boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
    }),
    error: (isDark) => ({
        marginBottom: '16px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
        border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`,
        color: isDark ? '#fca5a5' : '#b91c1c',
        fontSize: '14px',
    }),
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    buttonBase: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '12px 24px',
        fontWeight: 500,
        fontSize: '15px',
        borderRadius: '12px',
        cursor: 'pointer',
        border: 'none',
        transition: 'opacity 0.15s',
        fontFamily: 'inherit',
    },
    githubBtn: (isDark) => ({
        backgroundColor: isDark ? '#ffffff' : '#18181b',
        color: isDark ? '#18181b' : '#ffffff',
    }),
    googleBtn: (isDark) => ({
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#e5e7eb' : '#18181b',
        border: `1px solid ${isDark ? '#374151' : '#d4d4d8'}`,
    }),
    appleBtn: {
        backgroundColor: '#000000',
        color: '#ffffff',
    },
    bitbucketBtn: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
    },
    spinner: (isDark) => ({
        width: '20px',
        height: '20px',
        border: `2px solid ${isDark ? '#374151' : '#d4d4d8'}`,
        borderTopColor: isDark ? '#9ca3af' : '#52525b',
        borderRadius: '50%',
        animation: 'tonycodes-auth-spin 0.6s linear infinite',
        margin: '16px auto',
    }),
    terms: (isDark) => ({
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '12px',
        color: isDark ? '#6b7280' : '#a1a1aa',
    }),
};
// ─── Provider Icons (inline SVG) ─────────────────────────────────────────
function GithubIcon() {
    return (_jsx("svg", { viewBox: "0 0 24 24", width: "20", height: "20", fill: "currentColor", children: _jsx("path", { d: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" }) }));
}
function GoogleIcon() {
    return (_jsxs("svg", { viewBox: "0 0 24 24", width: "20", height: "20", children: [_jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }));
}
function AppleIcon() {
    return (_jsx("svg", { viewBox: "0 0 24 24", width: "20", height: "20", fill: "currentColor", children: _jsx("path", { d: "M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" }) }));
}
function BitbucketIcon() {
    return (_jsx("svg", { viewBox: "0 0 24 24", width: "20", height: "20", fill: "currentColor", children: _jsx("path", { d: "M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646l3.27-20.03a.768.768 0 0 0-.768-.891L.778 1.213zM14.52 15.53H9.522L8.17 8.466h7.561l-1.211 7.064z" }) }));
}
export function SignInForm({ providers: propProviders, autoFetch = true, theme = 'auto', style, className, }) {
    const config = useAuthConfig();
    const { providers: fetchedProviders, isLoading: providersLoading } = useProviders();
    const [activeTab, setActiveTab] = useState('signin');
    const [errorMessage, setErrorMessage] = useState(null);
    const [returnTo, setReturnTo] = useState('/');
    const [isDark, setIsDark] = useState(false);
    // Resolve theme
    useEffect(() => {
        if (theme === 'dark') {
            setIsDark(true);
        }
        else if (theme === 'light') {
            setIsDark(false);
        }
        else {
            // auto — check prefers-color-scheme
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            setIsDark(mq.matches);
            const handler = (e) => setIsDark(e.matches);
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
    }, [theme]);
    // Use prop providers if explicitly provided, otherwise use fetched providers
    const enabledProviders = propProviders
        ? propProviders
        : autoFetch
            ? fetchedProviders.map((p) => p.id)
            : ['github']; // fallback default
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        const tabParam = params.get('tab');
        const returnToParam = params.get('returnTo');
        if (returnToParam)
            setReturnTo(returnToParam);
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
    function handleOAuth(provider) {
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
    function switchTab(tab) {
        setActiveTab(tab);
        setErrorMessage(null);
    }
    const providerName = (id) => {
        const names = {
            github: 'GitHub',
            google: 'Google',
            apple: 'Apple',
            bitbucket: 'Bitbucket',
        };
        return names[id] || id;
    };
    const buttonText = (provider) => {
        const name = providerName(provider);
        return activeTab === 'signin' ? `Sign in with ${name}` : `Sign up with ${name}`;
    };
    const providerStyles = {
        github: { ...styles.buttonBase, ...styles.githubBtn(isDark) },
        google: { ...styles.buttonBase, ...styles.googleBtn(isDark) },
        apple: { ...styles.buttonBase, ...styles.appleBtn },
        bitbucket: { ...styles.buttonBase, ...styles.bitbucketBtn },
    };
    const providerIcons = {
        github: _jsx(GithubIcon, {}),
        google: _jsx(GoogleIcon, {}),
        apple: _jsx(AppleIcon, {}),
        bitbucket: _jsx(BitbucketIcon, {}),
    };
    return (_jsxs("div", { className: className, style: style, children: [_jsx("style", { children: `@keyframes tonycodes-auth-spin { to { transform: rotate(360deg) } }` }), _jsxs("div", { style: styles.tabContainer(isDark), children: [_jsx("button", { type: "button", style: styles.tab(activeTab === 'signin', isDark), onClick: () => switchTab('signin'), children: "Sign In" }), _jsx("button", { type: "button", style: styles.tab(activeTab === 'signup', isDark), onClick: () => switchTab('signup'), children: "Sign Up" })] }), errorMessage && (_jsx("div", { style: styles.error(isDark), children: errorMessage })), autoFetch && !propProviders && providersLoading ? (_jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }, children: _jsx("div", { style: styles.spinner(isDark) }) })) : (_jsx("div", { style: styles.buttonGroup, children: enabledProviders.map((id) => (_jsxs("button", { type: "button", style: providerStyles[id] || styles.buttonBase, onClick: () => handleOAuth(id), onMouseEnter: (e) => { e.currentTarget.style.opacity = '0.9'; }, onMouseLeave: (e) => { e.currentTarget.style.opacity = '1'; }, children: [providerIcons[id], _jsx("span", { children: buttonText(id) })] }, id))) })), _jsx("p", { style: styles.terms(isDark), children: "By continuing, you agree to our terms of service." })] }));
}
//# sourceMappingURL=SignInForm.js.map