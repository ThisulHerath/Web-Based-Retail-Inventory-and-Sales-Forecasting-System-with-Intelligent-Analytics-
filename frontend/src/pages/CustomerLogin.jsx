import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { Mail, Lock } from 'lucide-react';
import Toast from '../components/Toast';

/* Floating-label input — label lifts above border on focus or when filled */
const FloatingInput = ({ id, type, label, value, onChange, icon: Icon, autoComplete, placeholder }) => {
    const [focused, setFocused] = useState(false);
    const lifted = focused || value.length > 0;

    return (
        <div className="relative mt-1">
            <div
                className={`flex items-center border rounded-lg transition-all duration-200 ${
                    focused
                        ? 'border-primary-500 ring-2 ring-primary-500/30'
                        : 'border-gray-300 dark:border-gray-600'
                }`}
            >
                <Icon className="ml-3 w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="relative flex-1">
                    <label
                        htmlFor={id}
                        className={`absolute left-3 pointer-events-none transition-all duration-200 ${
                            lifted
                                ? '-top-[11px] text-[10px] font-semibold bg-white dark:bg-gray-900 px-1 text-primary-500'
                                : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
                        }`}
                    >
                        {label}
                    </label>
                    <input
                        id={id}
                        type={type}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        autoComplete={autoComplete}
                        placeholder={lifted ? placeholder : ''}
                        className="w-full pl-3 pr-4 py-3 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
};

const CustomerLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const { login } = useCustomer();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setToast({ message: 'Please enter your email address', type: 'error' });
            return;
        }

        if (!password) {
            setToast({ message: 'Please enter your password', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            navigate('/my-account');
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Login failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* LEFT — Form Panel */}
            <div className="w-full md:w-1/2 flex flex-col justify-between bg-white dark:bg-gray-900 px-10 sm:px-16 py-10 animate-fade-in-up">

                {/* Brand */}
                <div>
                    <Link to="/" className="inline-flex items-center gap-2">
                        <span className="bg-gradient-to-br from-primary-500 to-primary-700 text-white font-extrabold text-xl w-9 h-9 flex items-center justify-center rounded-xl shadow">7</span>
                        <span className="text-primary-600 font-bold text-xl tracking-tight">Super City</span>
                    </Link>
                </div>

                {/* Form */}
                <div className="max-w-sm w-full mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Welcome!</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Sign in by entering the information below</p>

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <FloatingInput
                            id="email"
                            type="email"
                            label="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={Mail}
                            autoComplete="off"
                            placeholder="email@example.com"
                        />

                        <FloatingInput
                            id="password"
                            type="password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={Lock}
                            autoComplete="new-password"
                            placeholder="••••••••••••"
                        />

                        {/* Remember / Staff row */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" className="w-3.5 h-3.5 accent-primary-600 rounded" />
                                Remember Me
                            </label>
                            <Link to="/admin/login" className="hover:text-primary-600 transition-colors">
                                Staff Login
                            </Link>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in…' : 'Continue'}
                        </button>
                    </form>

                    <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                            Create one here.
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-[11px] text-gray-400 text-center">© {new Date().getFullYear()} 7 Super City</p>
            </div>

            {/* RIGHT — Hero Image */}
            <div className="hidden md:block md:w-1/2 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=900&fit=crop&auto=format"
                    alt="7 Super City store"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-transparent" />
            </div>
        </div>
    );
};

export default CustomerLogin;
