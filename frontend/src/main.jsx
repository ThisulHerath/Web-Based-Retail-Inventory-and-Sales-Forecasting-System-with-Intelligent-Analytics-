import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { CustomerProvider } from './context/CustomerContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ErrorBoundaryComponent from './components/ErrorBoundary.jsx';

// Global: intercept native browser validation popups and show custom styled toasts
(function () {
    let activeToast = null;

    function showValidationToast(message) {
        if (activeToast) activeToast.remove();

        const toast = document.createElement('div');
        toast.className = 'custom-validation-toast';
        toast.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        activeToast = toast;

        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'toast-slide-out 0.3s ease-in forwards';
                setTimeout(() => toast.remove(), 300);
            }
            if (activeToast === toast) activeToast = null;
        }, 3000);
    }

    // Map native validation messages to user-friendly ones
    function getFriendlyMessage(input) {
        const label = input.getAttribute('aria-label')
            || input.getAttribute('placeholder')
            || input.closest('div')?.querySelector('label')?.textContent
            || 'This field';

        if (input.validity.valueMissing) {
            if (input.type === 'checkbox') return 'Please check the required checkbox to proceed';
            return `${label.trim()} is required`;
        }
        if (input.validity.typeMismatch) return `Please enter a valid ${input.type}`;
        if (input.validity.tooShort) return `${label.trim()} is too short`;
        if (input.validity.patternMismatch) return `Please enter a valid value for ${label.trim()}`;
        return input.validationMessage || 'Please fill in the required field';
    }

    document.addEventListener('invalid', (e) => {
        e.preventDefault();
        showValidationToast(getFriendlyMessage(e.target));
        // Highlight the invalid field briefly
        e.target.style.outline = '2px solid #f87171';
        e.target.style.outlineOffset = '-1px';
        setTimeout(() => {
            e.target.style.outline = '';
            e.target.style.outlineOffset = '';
        }, 3000);
    }, true);
})();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundaryComponent>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <CustomerProvider>
                            <App />
                        </CustomerProvider>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </ErrorBoundaryComponent>
    </React.StrictMode>
);
