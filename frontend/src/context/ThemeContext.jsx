import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const location = useLocation();
    const isAdminRoute = location?.pathname?.startsWith('/admin');
    
    // Customer theme (only affects public pages)
    const [customerTheme, setCustomerTheme] = useState(() => {
        // Check local storage or system preference for customer theme
        const savedTheme = localStorage.getItem('customerTheme');
        if (savedTheme) return savedTheme;
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    // Admin is always light mode
    const theme = isAdminRoute ? 'light' : customerTheme;

    useEffect(() => {
        // Update DOM
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        
        // Save customer theme to localStorage (admin theme is not saved, always light)
        if (!isAdminRoute) {
            localStorage.setItem('customerTheme', customerTheme);
        }
    }, [theme, customerTheme, isAdminRoute]);

    const toggleTheme = () => {
        // Only toggle customer theme (admin remains light)
        if (!isAdminRoute) {
            setCustomerTheme(prev => prev === 'light' ? 'dark' : 'light');
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isAdminRoute }}>
            {children}
        </ThemeContext.Provider>
    );
};
