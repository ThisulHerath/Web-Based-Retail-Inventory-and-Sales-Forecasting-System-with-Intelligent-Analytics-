import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService } from '../services/authService';
import useIdleLogout from '../hooks/useIdleLogout';

const IDLE_LOGOUT_TIMEOUT_MS = 4 * 60 * 1000;

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await loginService(email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            const retryAfterHeader = error.response?.headers?.['retry-after'];
            const retryAfterSeconds = Number(
                error.response?.data?.retryAfterSeconds
                || retryAfterHeader
                || 0,
            );

            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
                code: error.response?.data?.code
                    || (error.response?.status === 429 ? 'AUTH_RATE_LIMITED' : undefined),
                retryAfterSeconds: Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
                    ? retryAfterSeconds
                    : undefined,
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        setUser(null);
        window.dispatchEvent(new Event('storage'));
    };

    useIdleLogout({
        enabled: Boolean(user),
        timeoutMs: IDLE_LOGOUT_TIMEOUT_MS,
        onIdle: logout,
    });

    // Role checking helpers
    const isAdmin = () => user?.role === 'admin';
    const isManager = () => user?.role === 'manager';
    const isCashier = () => user?.role === 'cashier';
    const hasRole = (...roles) => user && roles.includes(user.role);

    const value = {
        user,
        login,
        logout,
        loading,
        isAdmin,
        isManager,
        isCashier,
        hasRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
