import { type SSOProvider } from './useProviders.js';
interface SignInFormProps {
    /** List of provider IDs to show (for manual control). Overrides autoFetch when provided. */
    providers?: SSOProvider[];
    /** Whether to automatically fetch providers from the auth service. Defaults to true. */
    autoFetch?: boolean;
    /** Color theme. Defaults to 'auto' (follows prefers-color-scheme). */
    theme?: 'light' | 'dark' | 'auto';
    /** Optional inline styles applied to the root container. */
    style?: React.CSSProperties;
    /** Optional CSS class applied to the root container. */
    className?: string;
}
export declare function SignInForm({ providers: propProviders, autoFetch, theme, style, className, }: SignInFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SignInForm.d.ts.map