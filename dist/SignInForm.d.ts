type Mode = 'signin' | 'signup';
interface SignInFormProps {
    /** List of provider IDs to show. If not provided, auto-fetches from auth service. */
    providers?: string[];
    /** Whether to auto-fetch available providers from the auth service. Default: true */
    autoFetch?: boolean;
    /** Additional CSS class names */
    className?: string;
    /** Mode to display the form in */
    mode?: Mode;
}
export declare function SignInForm({ providers: providersProp, autoFetch, className, mode: modeProp, }: SignInFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SignInForm.d.ts.map