import RetailOrbit from '../../components/RetailOrbit';
import ValidatedForm from '../../components/ValidatedForm';
﻿import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock } from 'lucide-react';
import Toast from '../../components/Toast';
import BrandLogo from '../../components/BrandLogo';

const Login = () => {
    const LOCKOUT_MESSAGE_PREFIX = 'Too many login attempts. Please try again later.';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [lockoutSeconds, setLockoutSeconds] = useState(null);
    const { login, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Force light mode for admin login
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        root.classList.add('light');
    }, []);

    // Clear any existing session when visiting login page
    useEffect(() => {
        logout();
    }, [logout]);

    useEffect(() => {
        if (!toast?.code || !['AUTH_LOCKED', 'AUTH_RATE_LIMITED'].includes(toast.code) || lockoutSeconds == null) {
            return undefined;
        }

        if (lockoutSeconds <= 0) {
            setToast(null);
            setLockoutSeconds(null);
            return undefined;
        }

        const timer = setTimeout(() => {
            setLockoutSeconds((current) => Math.max(current - 1, 0));
        }, 1000);

        return () => clearTimeout(timer);
    }, [toast?.code, lockoutSeconds]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setToast({ message: 'Please enter your email address', type: 'error' });
            setLockoutSeconds(null);
            return;
        }

        if (!password) {
            setToast({ message: 'Please enter your password', type: 'error' });
            setLockoutSeconds(null);
            return;
        }

        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            const sessionUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (sessionUser?.mustChangePassword) {
                navigate('/admin/change-password');
            } else {
                const from = location.state?.from;
                navigate(from?.pathname?.startsWith('/admin/') && from.pathname !== '/admin/login' ? `${from.pathname}${from.search || ''}${from.hash || ''}` : '/admin/dashboard', { replace: true });
            }
        } else {
            if (['AUTH_LOCKED', 'AUTH_RATE_LIMITED'].includes(result.code) && result.retryAfterSeconds) {
                setToast({
                    message: result.message || LOCKOUT_MESSAGE_PREFIX,
                    type: 'error',
                    code: result.code,
                });
                setLockoutSeconds(Math.max(result.retryAfterSeconds, 60));
            } else {
                setToast({ message: result.message, type: 'error' });
                setLockoutSeconds(null);
            }
        }

        setLoading(false);
    };

    return (
        <div className="staff-auth relative min-h-screen overflow-hidden flex items-center justify-center p-4 bg-[#101828]">
            <div className="hero-mesh" aria-hidden="true" /><div className="staff-auth-scene"><RetailOrbit /></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#101828]/86 via-[#18243b]/72 to-[#111b30]/84" aria-hidden="true" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(196,181,253,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" aria-hidden="true" />
            {toast && (
                <Toast
                    message={['AUTH_LOCKED', 'AUTH_RATE_LIMITED'].includes(toast.code) && lockoutSeconds != null
                        ? `${LOCKOUT_MESSAGE_PREFIX} Try again in ${lockoutSeconds}s.`
                        : toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                    duration={['AUTH_LOCKED', 'AUTH_RATE_LIMITED'].includes(toast.code) ? null : 5000}
                />
            )}

            <div className="staff-auth-card relative z-10 w-full max-w-md p-8 rounded-2xl border border-[#c4b5fd]/25 bg-[#19253b]/90 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <BrandLogo className="h-16 w-auto" />
                    </div>
                    <h1 className="text-xl font-bold text-white mt-3">Your retail workspace</h1><p className="text-xs text-slate-400 mt-2">Sign in to keep your business moving.</p>
                </div>

                <ValidatedForm onSubmit={handleSubmit} noValidate className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#ae9df3]" />
                            <input
                                type="email" required autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-[#a495d1]/40 rounded-lg bg-[#fafaff] text-[#18243b] placeholder:text-[#68758e] focus:ring-2 focus:ring-[#c4b5fd] focus:border-transparent outline-none transition"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#ae9df3]" />
                            <input
                                type="password" required autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-[#a495d1]/40 rounded-lg bg-[#fafaff] text-[#18243b] placeholder:text-[#68758e] focus:ring-2 focus:ring-[#c4b5fd] focus:border-transparent outline-none transition"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#c4b5fd] text-[#18243b] py-3 rounded-lg font-semibold hover:bg-[#ad97f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_0_4px_rgba(196,181,253,0.2)]"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </ValidatedForm>

            </div>
        </div>
    );
};

export default Login;


