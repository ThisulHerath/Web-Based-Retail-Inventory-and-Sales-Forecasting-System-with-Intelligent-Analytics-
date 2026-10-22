import { createContext, useContext, useEffect } from 'react';
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
    const theme = isAdminRoute ? 'light' : 'dark';

    useEffect(() => {
        // Admin uses porcelain surfaces; the storefront uses the same palette in midnight.
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme, isAdminRoute]);

    const toggleTheme = () => {};

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isAdminRoute }}>
            {children}
        </ThemeContext.Provider>
    );
};
