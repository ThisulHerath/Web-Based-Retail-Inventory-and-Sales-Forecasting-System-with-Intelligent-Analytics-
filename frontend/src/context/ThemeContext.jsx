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
    const [theme] = useState('dark');

    useEffect(() => {
        // Force dark mode globally.
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add('dark');
    }, [theme, isAdminRoute]);

    const toggleTheme = () => {};

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isAdminRoute }}>
            {children}
        </ThemeContext.Provider>
    );
};
