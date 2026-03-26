import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCustomer } from '../../context/CustomerContext';
import { User, Gift, Star, ShoppingBag, Clock, MapPin, Edit2, Trash2, X, Save, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { getMyCoupons } from '../../services/couponService';
import Toast from '../../components/Toast';
import axios from 'axios';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter';
import { usePasswordBreachCheck } from '../../hooks/usePasswordBreachCheck';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '../../utils/passwordPolicy';

const CustomerDashboard = () => {
    const { t } = useTranslation();
    const { customer, logout, updateCustomerData } = useCustomer();
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [toast, setToast] = useState(null);
    const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        previousPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const breachStatus = usePasswordBreachCheck(passwordForm.newPassword);
    const [showPassword, setShowPassword] = useState({
        previous: false,
        next: false,
        confirm: false,
    });
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (!customer) {
            navigate('/login');
            return;
        }
        setEditForm({
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
        });
        fetchData();
    }, [customer?._id, customer?.token]);

    const fetchData = async () => {
        try {
            // Refresh customer profile so loyalty points and purchase count stay in sync.
            const { data: profileData } = await axios.get('http://localhost:5000/api/customers/profile', {
                headers: { Authorization: `Bearer ${customer.token}` },
            });

            updateCustomerData(profileData);

            // Fetch coupons
            const couponData = await getMyCoupons(customer.token);
            setCoupons(couponData);

            // Fetch purchase history (sales linked to this customer)
            try {
                const { data } = await axios.get(`http://localhost:5000/api/sales?search=&customerId=${customer._id}`, {
                    headers: { Authorization: `Bearer ${customer.token}` },
                });
                setPurchases(data.sales || []);
            } catch (err) {
                // Purchase history may not be available via customer token
                setPurchases([]);
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            if (!isPasswordVerified || !passwordForm.previousPassword) {
                setToast({ message: t('profile.current_password_required'), type: 'error' });
                return;
            }

            if (passwordForm.newPassword || passwordForm.confirmNewPassword) {
                if (passwordForm.newPassword.length < PASSWORD_MIN_LENGTH) {
                    setToast({ message: t('profile.password_min_length'), type: 'error' });
                    return;
                }

                if (passwordForm.newPassword.length > PASSWORD_MAX_LENGTH) {
                    setToast({ message: t('profile.password_max_length'), type: 'error' });
                    return;
                }

                if (breachStatus.state === 'checking') {
                    setToast({ message: t('password_strength.checking'), type: 'error' });
                    return;
                }

                if (breachStatus.state === 'error') {
                    setToast({ message: t('password_strength.check_failed'), type: 'error' });
                    return;
                }

                if (breachStatus.state === 'done' && breachStatus.breached && !breachStatus.skipped) {
                    setToast({ message: t('password_strength.breached'), type: 'error' });
                    return;
                }

                if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
                    setToast({ message: t('profile.password_mismatch'), type: 'error' });
                    return;
                }
            }

            // Validate Sri Lankan phone number
            if (editForm.phone) {
                const cleaned = editForm.phone.replace(/[\s\-()]/g, '');
                const slPhoneRegex = /^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/;
                if (!slPhoneRegex.test(cleaned)) {
                    setToast({ message: t('profile.phone_validation'), type: 'error' });
                    return;
                }
            }

            const { data } = await axios.put('http://localhost:5000/api/customers/profile', {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                phone: editForm.phone,
                previousPassword: passwordForm.previousPassword,
                newPassword: passwordForm.newPassword || undefined,
                confirmNewPassword: passwordForm.confirmNewPassword || undefined,
            }, {
                headers: { Authorization: `Bearer ${customer.token}` },
            });
            updateCustomerData(data);
            setIsEditing(false);
            setIsPasswordVerified(false);
            setPasswordForm({ previousPassword: '', newPassword: '', confirmNewPassword: '' });
            setToast({ message: t('profile.update_success'), type: 'success' });
        } catch (error) {
            setToast({ message: error.response?.data?.message || t('profile.update_failed'), type: 'error' });
        }
    };

    const openEditModal = () => {
        setEditForm({
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
        });
        setPasswordForm({ previousPassword: '', newPassword: '', confirmNewPassword: '' });
        setShowPassword({ previous: false, next: false, confirm: false });
        setIsPasswordVerified(false);
        setIsEditing(true);
    };

    const closeEditModal = () => {
        setIsEditing(false);
        setIsPasswordVerified(false);
        setIsVerifyingPassword(false);
        setPasswordForm({ previousPassword: '', newPassword: '', confirmNewPassword: '' });
        setShowPassword({ previous: false, next: false, confirm: false });
    };

    const handleVerifyPassword = async () => {
        try {
            if (!passwordForm.previousPassword) {
                setToast({ message: t('profile.current_password_required'), type: 'error' });
                return;
            }

            setIsVerifyingPassword(true);
            await axios.post('http://localhost:5000/api/customers/profile/verify-password', {
                previousPassword: passwordForm.previousPassword,
            }, {
                headers: { Authorization: `Bearer ${customer.token}` },
            });

            setIsPasswordVerified(true);
            setToast({ message: t('profile.password_verified'), type: 'success' });
        } catch (error) {
            setToast({ message: error.response?.data?.message || t('profile.password_verify_failed'), type: 'error' });
        } finally {
            setIsVerifyingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeletingAccount(true);
            await axios.delete('http://localhost:5000/api/customers/profile', {
                headers: { Authorization: `Bearer ${customer.token}` },
            });
            setToast({ message: t('profile.delete_success'), type: 'success' });
            setTimeout(() => {
                logout();
                navigate('/');
            }, 1500);
        } catch (error) {
            setToast({ message: error.response?.data?.message || t('profile.delete_failed'), type: 'error' });
        } finally {
            setIsDeletingAccount(false);
        }
    };

    if (!customer) return null;

    const activeCoupons = coupons.filter(c => !c.isUsed && new Date(c.expiryDate) >= new Date());
    const usedCoupons = coupons.filter(c => c.isUsed);
    const expiredCoupons = coupons.filter(c => !c.isUsed && new Date(c.expiryDate) < new Date());

    const pointsToNextCoupon = 500 - (customer.loyaltyPoints % 500);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {isDeletingAccount && (
                <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl px-6 py-5 shadow-lg border border-gray-100 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-red-600"></div>
                        <p className="text-gray-800 font-medium">{t('profile.deleting_account')}</p>
                    </div>
                </div>
            )}

            {/* Profile Header */}
            <div className="glassmorphism rounded-2xl p-8 mb-8 border border-[var(--color-border)] bg-gradient-to-br from-[#f5d800] to-primary-800 text-white animate-fade-in-up">
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm border-2 border-white/30">
                        {customer.firstName[0]}{customer.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <h1 className="text-3xl font-bold">{customer.firstName} {customer.lastName}</h1>
                        <p className="text-[#f5d800] mt-1">{customer.email}</p>
                        <p className="text-[#f5d800]">{customer.phone}</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[#f5d800] text-sm">{t('profile.member')}</p>
                        <p className="text-4xl font-black mt-1">{customer.loyaltyPoints}</p>
                        <p className="text-[#f5d800] text-sm">{t('profile.loyalty_points')}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={openEditModal}
                            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/20"
                            title={t('profile.edit_tooltip')}
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-red-400/20"
                            title={t('profile.delete_tooltip')}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="glassmorphism rounded-2xl w-full max-w-md p-6 border border-[var(--color-border)] animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('profile.edit_title')}</h2>
                            <button
                                onClick={closeEditModal}
                                className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-all duration-200 hover:scale-110"
                            >
                                <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
                            </button>
                        </div>
                        {!isPasswordVerified ? (
                            <div className="space-y-4">
                                <p className="text-sm text-[var(--color-text-secondary)]">{t('profile.verify_password_subtitle')}</p>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('profile.current_password')}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.previous ? 'text' : 'password'}
                                            value={passwordForm.previousPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, previousPassword: e.target.value })}
                                            className="password-input-no-native w-full px-4 pr-11 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all duration-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => ({ ...prev, previous: !prev.previous }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5d800] hover:text-[#e6c700]"
                                            aria-label={showPassword.previous ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword.previous ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleVerifyPassword}
                                        disabled={isVerifyingPassword}
                                        className="flex-1 bg-[#f5d800] text-[#155c27] font-weight-600 py-3 rounded-lg font-semibold hover:bg-[#e6c700] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isVerifyingPassword ? t('profile.verifying_password') : t('profile.verify_continue')}
                                    </button>
                                    <button
                                        onClick={closeEditModal}
                                        disabled={isVerifyingPassword}
                                        className="px-6 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg font-semibold hover:bg-[var(--color-border)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('profile.cancel')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('profile.first_name')}</label>
                                    <input
                                        type="text"
                                        value={editForm.firstName}
                                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('profile.last_name')}</label>
                                    <input
                                        type="text"
                                        value={editForm.lastName}
                                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('profile.email')}</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('profile.phone')}</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all duration-200"
                                />
                            </div>
                            <div className="pt-2 border-t border-[var(--color-border)]">
                                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">{t('profile.change_password_section')}</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('profile.new_password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword.next ? 'text' : 'password'}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                className="password-input-no-native w-full px-4 pr-11 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all duration-200"
                                                minLength={PASSWORD_MIN_LENGTH}
                                                maxLength={PASSWORD_MAX_LENGTH}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => ({ ...prev, next: !prev.next }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5d800] hover:text-[#e6c700]"
                                                aria-label={showPassword.next ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword.next ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <PasswordStrengthMeter password={passwordForm.newPassword} />
                                        {passwordForm.newPassword.length >= PASSWORD_MIN_LENGTH && breachStatus.state === 'checking' && (
                                            <p className="mt-1 text-xs text-amber-600">{t('password_strength.checking')}</p>
                                        )}
                                        {passwordForm.newPassword.length >= PASSWORD_MIN_LENGTH && breachStatus.state === 'error' && (
                                            <p className="mt-1 text-xs text-amber-600">{t('password_strength.check_failed')}</p>
                                        )}
                                        {passwordForm.newPassword.length >= PASSWORD_MIN_LENGTH && breachStatus.state === 'done' && !breachStatus.skipped && breachStatus.breached && (
                                            <p className="mt-1 text-xs text-red-500">{t('password_strength.breached')}</p>
                                        )}
                                        {passwordForm.newPassword.length >= PASSWORD_MIN_LENGTH && breachStatus.state === 'done' && !breachStatus.skipped && !breachStatus.breached && (
                                            <p className="mt-1 text-xs text-green-600">{t('password_strength.safe')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('profile.confirm_new_password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword.confirm ? 'text' : 'password'}
                                                value={passwordForm.confirmNewPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                                                className="password-input-no-native w-full px-4 pr-11 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all duration-200"
                                                minLength={PASSWORD_MIN_LENGTH}
                                                maxLength={PASSWORD_MAX_LENGTH}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5d800] hover:text-[#e6c700]"
                                                aria-label={showPassword.confirm ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleUpdateProfile}
                                    className="flex-1 bg-[#f5d800] text-[#155c27] font-weight-600 py-3 rounded-lg font-semibold hover:bg-[#e6c700] transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl hover:shadow-[rgba(245,216,0,0.3)]"
                                >
                                    <Save className="w-5 h-5" />
                                    {t('profile.save_changes')}
                                </button>
                                <button
                                    onClick={closeEditModal}
                                    className="px-6 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg font-semibold hover:bg-[var(--color-border)] transition-all duration-200"
                                >
                                    {t('profile.cancel')}
                                </button>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="glassmorphism rounded-2xl w-full max-w-md p-6 border border-red-500/30 animate-scale-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">{t('profile.delete_title')}</h2>
                            <p className="text-[var(--color-text-secondary)]">
                                {t('profile.delete_message')}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeletingAccount}
                                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-5 h-5" />
                                {isDeletingAccount ? t('profile.deleting') : t('profile.delete_confirm')}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeletingAccount}
                                className="px-6 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg font-semibold hover:bg-[var(--color-border)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('profile.delete_cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glassmorphism rounded-xl p-6 border border-[var(--color-border)] animate-fade-in-up hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
                            <Star className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">{t('profile.stats_points')}</p>
                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{customer.loyaltyPoints}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{pointsToNextCoupon} {t('profile.stats_pts_next')}</p>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-2">
                            <div
                                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${((customer.loyaltyPoints % 500) / 500) * 100}%` }}
                            ></div>
                        </div>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">{customer.loyaltyPoints % 500}/500 {t('profile.stats_progress')}</p>
                    </div>
                </div>

                <div className="glassmorphism rounded-xl p-6 border border-[var(--color-border)] animate-fade-in-up stagger-1 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                            <Gift className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">{t('profile.stats_coupons')}</p>
                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{activeCoupons.length}</p>
                        </div>
                    </div>
                </div>

                <div className="glassmorphism rounded-xl p-6 border border-[var(--color-border)] animate-fade-in-up stagger-2 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#1a6e30]/20 p-3 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-[#f5d800]" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">{t('profile.stats_purchases')}</p>
                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{customer.totalPurchases || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupons Section */}
            <div className="glassmorphism rounded-xl p-6 border border-[var(--color-border)] mb-8 animate-fade-in-up stagger-3">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#f5d800]" />
                    {t('profile.my_coupons')}
                </h2>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-8 text-[var(--color-text-secondary)]">
                        <Gift className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-secondary)]" />
                        <p>{t('profile.no_coupons')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Active Coupons */}
                        {activeCoupons.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-green-600 mb-2">{t('profile.active')}</h3>
                                {activeCoupons.map((coupon) => (
                                    <div key={coupon._id} className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-2 flex items-center justify-between hover:scale-105 transition-all duration-200">
                                        <div>
                                            <p className="font-bold font-mono text-[var(--color-text-primary)] text-lg">{coupon.code}</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {coupon.discountType === 'Percentage' ? `${coupon.discountValue}% ${t('profile.discount_off')}` : `LKR ${coupon.discountValue} ${t('profile.discount_off')}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">{t('profile.coupon_active_badge')}</span>
                                            <p className="text-xs text-[var(--color-text-secondary)] mt-1 flex items-center gap-1 justify-end">
                                                <Clock className="w-3 h-3" />
                                                {t('profile.expires')}: {new Date(coupon.expiryDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Used Coupons */}
                        {usedCoupons.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2 mt-4">{t('profile.used')}</h3>
                                {usedCoupons.map((coupon) => (
                                    <div key={coupon._id} className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] mb-2 flex items-center justify-between opacity-60">
                                        <div>
                                            <p className="font-bold font-mono text-[var(--color-text-secondary)] line-through">{coupon.code}</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {coupon.discountType === 'Percentage' ? `${coupon.discountValue}% ${t('profile.discount_off')}` : `LKR ${coupon.discountValue} ${t('profile.discount_off')}`}
                                            </p>
                                        </div>
                                        <span className="bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] px-3 py-1 rounded-full text-xs font-bold border border-[var(--color-border)]">{t('profile.coupon_used_badge')}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Expired Coupons */}
                        {expiredCoupons.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-red-500 mb-2 mt-4">{t('profile.expired')}</h3>
                                {expiredCoupons.map((coupon) => (
                                    <div key={coupon._id} className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-2 flex items-center justify-between opacity-60">
                                        <div>
                                            <p className="font-bold font-mono text-[var(--color-text-secondary)] line-through">{coupon.code}</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {coupon.discountType === 'Percentage' ? `${coupon.discountValue}% ${t('profile.discount_off')}` : `LKR ${coupon.discountValue} ${t('profile.discount_off')}`}
                                            </p>
                                        </div>
                                        <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold">{t('profile.coupon_expired_badge')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* How Loyalty Works */}
            <div className="glassmorphism rounded-2xl p-8 border border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 animate-fade-in-up stagger-4">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">{t('profile.how_works_title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <ShoppingBag className="w-6 h-6 text-[#f5d800]" />
                        </div>
                        <h3 className="font-bold text-[var(--color-text-primary)]">{t('profile.step1_title')}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{t('profile.step1_sub')}</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Star className="w-6 h-6 text-amber-500" />
                        </div>
                        <h3 className="font-bold text-[var(--color-text-primary)]">{t('profile.step2_title')}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{t('profile.step2_sub')}</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Gift className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-[var(--color-text-primary)]">{t('profile.step3_title')}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{t('profile.step3_sub')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;








