import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCustomer } from '../../context/CustomerContext';
import { Mail, Lock } from 'lucide-react';
import Toast from '../../components/Toast';
import BrandLogo from '../../components/BrandLogo';

/* Floating-label input â€” label lifts above border on focus or when filled */
const FloatingInput = ({ id, type, label, value, onChange, icon: Icon, autoComplete, placeholder }) => {
    const [focused, setFocused] = useState(false);
    const lifted = focused || value.length > 0;

    return (
        <div className="relative mt-1">
            <div
                className={`flex items-center border rounded-lg transition-all duration-200 ${
                    focused
                        ? 'border-[var(--color-search-focus)] ring-2 ring-[var(--color-search-focus-ring)]'
                        : 'border-[var(--color-search-border)] dark:border-[var(--color-card-border)]'
                }`}
            >
                <Icon className="ml-3 w-4 h-4 text-[var(--color-text-tertiary)] dark:text-[var(--color-icon)] flex-shrink-0" />
                <div className="relative flex-1">
                    <label
                        htmlFor={id}
                        className={`absolute left-3 pointer-events-none transition-all duration-200 ${
                            lifted
                                ? '-top-[11px] text-[10px] font-semibold bg-[var(--color-bg-secondary)] dark:bg-[var(--color-card-bg)] px-1 text-[var(--color-search-focus)] dark:text-[var(--color-icon)]'
                                : 'top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]'
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
                        className="w-full pl-3 pr-4 py-3 bg-[var(--color-search-bg)] dark:bg-[var(--color-card-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none"
                        style={{ WebkitTextFillColor: 'var(--color-text-primary)' }}
                    />
                </div>
            </div>
        </div>
    );
};

const CustomerLogin = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const { login } = useCustomer();
    const navigate = useNavigate();

    // Load remembered email on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('customerRememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setToast({ message: t('auth_extra.enter_email'), type: 'error' });
            return;
        }

        if (!password) {
            setToast({ message: t('auth_extra.enter_password'), type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            
            // Handle Remember Me functionality
            if (rememberMe) {
                localStorage.setItem('customerRememberedEmail', email);
            } else {
                localStorage.removeItem('customerRememberedEmail');
            }
            
            navigate('/my-account');
        } catch (error) {
            setToast({ message: error.response?.data?.message || t('auth_extra.login_failed'), type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* LEFT â€” Form Panel */}
            <div className="w-full md:w-1/2 flex flex-col justify-between bg-[var(--color-bg-secondary)] dark:bg-[var(--color-card-bg)] px-10 sm:px-16 py-10 animate-fade-in-up">

                {/* Brand */}
                <div>
                    <Link to="/" className="inline-flex items-center">
                        <BrandLogo className="h-12 w-auto" />
                    </Link>
                </div>

                {/* Form */}
                <div className="max-w-sm w-full mx-auto">
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-white mb-1">{t('auth.welcome')}</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-8">{t('auth.sign_in_sub')}</p>

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <FloatingInput
                            id="email"
                            type="email"
                            label={t('auth.email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={Mail}
                            autoComplete="off"
                            placeholder="email@example.com"
                        />

                        <FloatingInput
                            id="password"
                            type="password"
                            label={t('auth.password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={Lock}
                            autoComplete="new-password"
                            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                        />

                        {/* Remember / Staff row */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe}
                                    onChange={(e) => {
                                        setRememberMe(e.target.checked);
                                        if (!e.target.checked) {
                                            localStorage.removeItem('customerRememberedEmail');
                                        }
                                    }}
                                    className="w-3.5 h-3.5 accent-[var(--color-button-primary)] rounded cursor-pointer" 
                                />
                                {t('auth.remember_me')}
                            </label>
                            <Link to="/admin/login" className="text-[var(--color-text-secondary)] dark:text-[var(--color-link)] hover:text-[var(--color-link)] dark:hover:text-[var(--color-accent)] transition-colors">
                                {t('auth.staff_login')}
                            </Link>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-button-primary)] text-[var(--color-button-text)] dark:bg-[var(--color-accent)] dark:text-[var(--color-button-text)] hover:bg-[var(--color-button-primary-hover)] dark:hover:bg-[#e6c700] py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? `${t('auth.sign_in')}...` : t('auth.continue')}
                        </button>
                    </form>

                    <p className="mt-6 text-xs text-center text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                        {t('auth.no_account')}{' '}
                        <Link to="/register" className="text-[var(--color-link)] dark:text-[var(--color-link)] font-semibold hover:text-[var(--color-link-hover)] dark:hover:text-[var(--color-accent)] hover:underline">
                            {t('auth.create_here')}
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-[11px] text-[var(--color-text-tertiary)] dark:text-gray-400 text-center">Â© {new Date().getFullYear()} 7 Super City</p>
            </div>

            {/* RIGHT â€” Hero Image */}
            <div className="hidden md:block md:w-1/2 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=900&fit=crop&auto=format"
                    alt="7 Super City store"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0" style={{background: `linear-gradient(to bottom right, var(--color-overlay), transparent)`}} />
            </div>
        </div>
    );
};

export default CustomerLogin;


