import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
            navigate('/admin/dashboard');
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
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4 bg-[#0f3518]">
            <div
                className="absolute inset-0 scale-110 blur-[9px] brightness-[0.72] saturate-[1.05]"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f3518]/86 via-[#155c27]/72 to-[#071d0d]/84" aria-hidden="true" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,216,0,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" aria-hidden="true" />
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

            <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-[#f5d800]/25 bg-[#0f4a22]/82 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <BrandLogo className="h-16 w-auto" />
                    </div>
                    <p className="text-white/80">Retail Management System</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7ecf8f]" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-[#8bc995]/40 rounded-lg bg-[#f8fff9] text-[#155c27] placeholder:text-[#5a7a5a] focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none transition"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7ecf8f]" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-[#8bc995]/40 rounded-lg bg-[#f8fff9] text-[#155c27] placeholder:text-[#5a7a5a] focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none transition"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#f5d800] text-[#155c27] py-3 rounded-lg font-semibold hover:bg-[#e6c700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_0_4px_rgba(245,216,0,0.2)]"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;


