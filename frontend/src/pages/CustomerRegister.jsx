import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
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

/* Password input with visibility toggle */
const PasswordInput = ({ id, label, value, onChange, autoComplete, placeholder }) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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
                <Lock className="ml-3 w-4 h-4 text-gray-400 flex-shrink-0" />
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
                        type={showPassword ? 'text' : 'password'}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        autoComplete={autoComplete}
                        placeholder={lifted ? placeholder : ''}
                        className="w-full pl-3 pr-10 py-3 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="mr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
};

const CustomerRegister = () => {
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
    const { register } = useCustomer();
    const navigate = useNavigate();

    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setToast({ message: 'Please enter your first and last name', type: 'error' });
            return;
        }

        if (!formData.email.trim()) {
            setToast({ message: 'Please enter your email address', type: 'error' });
            return;
        }

        if (formData.phone) {
            const cleaned = formData.phone.replace(/[\s\-()]/g, '');
            const slPhoneRegex = /^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/;
            if (!slPhoneRegex.test(cleaned)) {
                setToast({ message: 'Please enter a valid Sri Lankan phone number (e.g., 07X XXXXXXX)', type: 'error' });
                return;
            }
        }

        if (!formData.password) {
            setToast({ message: 'Please enter a password', type: 'error' });
            return;
        }

        if (formData.password.length < 6) {
            setToast({ message: 'Password must be at least 6 characters', type: 'error' });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setToast({ message: 'Passwords do not match', type: 'error' });
            return;
        }

        if (!agreedToTerms) {
            setToast({ message: 'Please agree to the Terms & Conditions', type: 'error' });
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
            setToast({ message: 'Registration successful! Welcome coupon has been generated.', type: 'success' });
            setTimeout(() => navigate('/my-account'), 1500);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Registration failed', type: 'error' });
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Join Us!</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Create your account and enjoy exclusive benefits & a welcome discount!</p>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        {/* Name Fields Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 ml-1">First Name</label>
                                <FloatingInput
                                    id="firstName"
                                    type="text"
                                    label="First Name"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    icon={User}
                                    autoComplete="given-name"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 ml-1">Last Name</label>
                                <FloatingInput
                                    id="lastName"
                                    type="text"
                                    label="Last Name"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    icon={User}
                                    autoComplete="family-name"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 ml-1">Email Address</label>
                            <FloatingInput
                                id="email"
                                type="email"
                                label="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                icon={Mail}
                                autoComplete="email"
                                placeholder="john@example.com"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 ml-1">Phone Number</label>
                            <FloatingInput
                                id="phone"
                                type="tel"
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                icon={Phone}
                                autoComplete="tel"
                                placeholder="+94 77 123 4567"
                            />
                        </div>

                        {/* Password Fields Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 ml-1">Password</label>
                                <PasswordInput
                                    id="password"
                                    label="Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    autoComplete="new-password"
                                    placeholder="Min. 6 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 ml-1">Confirm</label>
                                <PasswordInput
                                    id="confirmPassword"
                                    label="Confirm"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    autoComplete="new-password"
                                    placeholder="Repeat password"
                                />
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-3.5 h-3.5 accent-primary-600 rounded mr-2" />
                            <span>I agree to the <a href="#" className="text-primary-600 hover:underline">Terms & Conditions</a></span>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? 'Creating Account…' : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-[11px] text-gray-400 text-center">© {new Date().getFullYear()} 7 Super City</p>
            </div>

            {/* RIGHT — Hero Image (Different from login) */}
            <div className="hidden md:block md:w-1/2 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&h=900&fit=crop&auto=format"
                    alt="Modern retail store shopping experience"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-transparent" />
            </div>
        </div>
    );
};

export default CustomerRegister;
