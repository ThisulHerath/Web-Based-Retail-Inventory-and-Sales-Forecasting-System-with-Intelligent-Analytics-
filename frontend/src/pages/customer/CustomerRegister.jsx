import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCustomer } from '../../context/CustomerContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, X } from 'lucide-react';
import Toast from '../../components/Toast';
import BrandLogo from '../../components/BrandLogo';

/* Floating-label input â€” label lifts above border on focus or when filled */
const FloatingInput = ({ id, type, label, value, onChange, icon: Icon, autoComplete, placeholder, error }) => {
    const [focused, setFocused] = useState(false);
    const lifted = focused || value.length > 0;

    return (
        <div className="relative mt-1">
            <div
                className={`flex items-center border rounded-lg transition-all duration-200 ${
                    error
                        ? 'border-red-500 ring-1 ring-red-500/40'
                        : focused
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
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

/* Password input with visibility toggle */
const PasswordInput = ({ id, label, value, onChange, autoComplete, placeholder, error }) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const lifted = focused || value.length > 0;

    return (
        <div className="relative mt-1">
            <div
                className={`flex items-center border rounded-lg transition-all duration-200 ${
                    error
                        ? 'border-red-500 ring-1 ring-red-500/40'
                        : focused
                        ? 'border-[var(--color-search-focus)] ring-2 ring-[var(--color-search-focus-ring)]'
                        : 'border-[var(--color-search-border)] dark:border-[var(--color-card-border)]'
                }`}
            >
                <Lock className="ml-3 w-4 h-4 text-[var(--color-text-tertiary)] dark:text-[var(--color-icon)] flex-shrink-0" />
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
                        type={showPassword ? 'text' : 'password'}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        autoComplete={autoComplete}
                        placeholder={lifted ? placeholder : ''}
                        className="w-full pl-3 pr-10 py-3 bg-[var(--color-search-bg)] dark:bg-[var(--color-card-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none"
                        style={{ WebkitTextFillColor: 'var(--color-text-primary)' }}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="mr-3 text-[var(--color-text-tertiary)] dark:text-[var(--color-icon)] hover:text-[var(--color-text-secondary)] dark:hover:text-white transition-colors"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

const CustomerRegister = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const { register } = useCustomer();
    const navigate = useNavigate();

    const clearFieldError = (field) => setFieldErrors((prev) => ({ ...prev, [field]: '' }));

    const validateFields = () => {
        const errors = {};
        if (!formData.firstName.trim()) errors.firstName = t('register.validation.first_name_required');
        if (!formData.lastName.trim()) errors.lastName = t('register.validation.last_name_required');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = t('register.validation.email_invalid');
        if (formData.phone) {
            const cleaned = formData.phone.replace(/[\s\-()]/g, '');
            if (!/^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/.test(cleaned))
                errors.phone = t('register.validation.phone_invalid');
        }
        if (!formData.password || formData.password.length < 6) errors.password = t('register.validation.password_min');
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = t('register.validation.password_mismatch');
        if (!agreedToTerms) errors.terms = t('register.validation.terms_required');
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            if (errors.terms) setToast({ message: errors.terms, type: 'error' });
            return;
        }
        setLoading(true);
        try {
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });
            setToast({ message: t('register.validation.register_success'), type: 'success' });
            setTimeout(() => navigate('/my-account'), 1500);
        } catch (error) {
            if (error.response?.data?.code === 'EMAIL_EXISTS') {
                setFieldErrors((prev) => ({ ...prev, email: t('register.validation.email_exists') }));
                return;
            }
            if (error.response?.data?.code === 'VALIDATION_ERROR') {
                const serverErrs = {};
                error.response.data.errors?.forEach((e) => { serverErrs[e.field] = e.message; });
                setFieldErrors((prev) => ({ ...prev, ...serverErrs }));
            } else {
                setToast({ message: t('register.validation.register_failed'), type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* TERMS & CONDITIONS MODAL */}
            {showTermsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-white">{t('terms.title')}</h2>
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="p-2 hover:bg-[var(--color-bg-primary)] dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto flex-1 p-6 text-sm text-gray-700 dark:text-gray-300 space-y-4">
                            <section>
                                <h3 className="font-bold text-[var(--color-text-primary)] dark:text-white mb-2">{t('terms.s1_title')}</h3>
                                <p>{t('terms.s1_body')}</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-[var(--color-text-primary)] dark:text-white mb-2">{t('terms.s2_title')}</h3>
                                <p>{t('terms.s2_body')}</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-[var(--color-text-primary)] dark:text-white mb-2">{t('terms.s3_title')}</h3>
                                <p>{t('terms.s3_body')}</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('terms.s4_title')}</h3>
                                <p>{t('terms.s4_body')}</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('terms.s5_title')}</h3>
                                <p>{t('terms.s5_body')}</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('terms.s6_title')}</h3>
                                <p>{t('terms.s6_body')}</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('terms.s7_title')}</h3>
                                <p>{t('terms.s7_body')}</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('terms.s8_title')}</h3>
                                <p>{t('terms.s8_body')}</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('terms.s9_title')}</h3>
                                <p>{t('terms.s9_body')}</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('terms.s10_title')}</h3>
                                <p>{t('terms.s10_body')}</p>
                            </section>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-colors"
                            >
                                {t('terms.review_later')}
                            </button>
                            <button
                                onClick={() => {
                                    setAgreedToTerms(true);
                                    setShowTermsModal(false);
                                }}
                                className="flex-1 px-4 py-3 bg-[#f5d800] text-[#155c27] rounded-lg hover:bg-[#e6c700] font-semibold transition-colors"
                            >
                                {t('terms.agree_accept')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-white mb-1">{t('auth.join_title')}</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-8">{t('auth.join_sub')}</p>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        {/* Name Fields Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1 ml-1">{t('auth.first_name')}</label>
                                <FloatingInput
                                    id="firstName"
                                    type="text"
                                    label={t('auth.first_name')}
                                    value={formData.firstName}
                                        onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); clearFieldError('firstName'); }}
                                    icon={User}
                                    autoComplete="given-name"
                                    placeholder="John"
                                        error={fieldErrors.firstName}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1 ml-1">{t('auth.last_name')}</label>
                                <FloatingInput
                                    id="lastName"
                                    type="text"
                                    label={t('auth.last_name')}
                                    value={formData.lastName}
                                        onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); clearFieldError('lastName'); }}
                                    icon={User}
                                    autoComplete="family-name"
                                    placeholder="Doe"
                                        error={fieldErrors.lastName}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1 ml-1">{t('auth.email')}</label>
                            <FloatingInput
                                id="email"
                                type="email"
                                label={t('auth.email')}
                                value={formData.email}
                                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); clearFieldError('email'); }}
                                icon={Mail}
                                autoComplete="email"
                                placeholder="john@example.com"
                                    error={fieldErrors.email}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1 ml-1">{t('auth.phone')}</label>
                            <FloatingInput
                                id="phone"
                                type="tel"
                                label={t('auth.phone')}
                                value={formData.phone}
                                    onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); clearFieldError('phone'); }}
                                icon={Phone}
                                autoComplete="tel"
                                placeholder="+94 77 123 4567"
                                    error={fieldErrors.phone}
                            />
                        </div>

                        {/* Password Fields Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1 ml-1">{t('auth.password')}</label>
                                <PasswordInput
                                    id="password"
                                    label={t('auth.password')}
                                    value={formData.password}
                                        onChange={(e) => { setFormData({ ...formData, password: e.target.value }); clearFieldError('password'); }}
                                    autoComplete="new-password"
                                    placeholder="Min. 6 characters"
                                        error={fieldErrors.password}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1 ml-1">{t('auth.confirm')}</label>
                                <PasswordInput
                                    id="confirmPassword"
                                    label={t('auth.confirm')}
                                    value={formData.confirmPassword}
                                        onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); clearFieldError('confirmPassword'); }}
                                    autoComplete="new-password"
                                    placeholder="Repeat password"
                                        error={fieldErrors.confirmPassword}
                                />
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className={`flex items-start text-sm rounded-lg p-4 border-2 transition-all ${
                            agreedToTerms 
                                ? 'bg-[#1a6e30]/20 border-[#1a6e30] dark:bg-[#1a6e30]/30 dark:border-[#1a6e30]' 
                                : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700'
                        }`}>
                            <input 
                                type="checkbox" 
                                checked={agreedToTerms} 
                                onChange={(e) => setAgreedToTerms(e.target.checked)} 
                                   className="w-5 h-5 accent-[var(--color-button-primary)] dark:accent-[var(--color-link)] rounded mr-3 mt-0.5 flex-shrink-0 cursor-pointer" 
                            />
                            <div className="flex-1">
                                <label className={`cursor-pointer ${
                                    agreedToTerms 
                                        ? 'text-[#155c27] dark:text-[#f5d800]' 
                                        : 'text-amber-800 dark:text-amber-200'
                                }`}>
                                    {t('auth.terms')}{' '}
                                    <button
                                        type="button"
                                        onClick={() => setShowTermsModal(true)}
                                        className="text-[var(--color-link)] dark:text-[var(--color-link)] hover:text-[var(--color-button-primary)] dark:hover:text-[var(--color-accent)] hover:underline font-semibold"
                                    >
                                        {t('auth.terms_link')}
                                    </button>
                                </label>
                                {fieldErrors.terms && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">{fieldErrors.terms}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-button-primary)] text-[var(--color-button-text)] dark:bg-[var(--color-accent)] dark:text-[var(--color-text-body)] hover:bg-[var(--color-button-primary-hover)] dark:hover:bg-[#e6c700] py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? `${t('auth.create_account')}...` : t('auth.create_account')}
                        </button>
                    </form>

                    <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                        {t('auth.have_account')}{' '}
                        <Link to="/login" className="text-[var(--color-link)] dark:text-[var(--color-link)] font-semibold hover:text-[var(--color-button-primary)] dark:hover:text-[var(--color-accent)] hover:underline">
                            {t('auth.sign_in')}
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-[11px] text-[var(--color-text-tertiary)] dark:text-gray-400 text-center">Â© {new Date().getFullYear()} 7 Super City</p>
            </div>

            {/* RIGHT â€” Hero Image (Different from login) */}
            <div className="hidden md:block md:w-1/2 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&h=900&fit=crop&auto=format"
                    alt="Modern retail store shopping experience"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0" style={{background: `linear-gradient(to bottom right, var(--color-overlay), transparent)`}} />
            </div>
        </div>
    );
};

export default CustomerRegister;


