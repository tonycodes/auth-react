import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from './useAuth.js';
export function OrganizationSwitcher({ className = '' }) {
    const { organization, organizations, switchOrganization } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    if (organizations.length <= 1) {
        // Single org — just display name
        return (_jsx("div", { className: className, children: _jsx("span", { children: organization?.name || 'No organization' }) }));
    }
    return (_jsxs("div", { ref: dropdownRef, className: `relative ${className}`, children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", children: [_jsx("span", { className: "font-medium", children: organization?.name || 'Select org' }), _jsx("svg", { className: `w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), isOpen && (_jsx("div", { className: "absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50", children: _jsx("div", { className: "py-1", children: organizations.map((org) => (_jsxs("button", { onClick: () => {
                            switchOrganization(org.id);
                            setIsOpen(false);
                        }, className: `w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${org.id === organization?.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300'}`, children: [_jsx("div", { className: "font-medium", children: org.name }), _jsx("div", { className: "text-xs text-gray-400", children: org.slug })] }, org.id))) }) }))] }));
}
//# sourceMappingURL=OrganizationSwitcher.js.map