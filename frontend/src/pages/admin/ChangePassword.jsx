import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter';
import { usePasswordBreachCheck } from '../../hooks/usePasswordBreachCheck';
import { PASSWORD_MIN_LENGTH } from '../../utils/passwordPolicy';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const { user, changePassword } = useAuth();
    const navigate = useNavigate();

    const isForcedChange = Boolean(user?.mustChangePassword);
    const breachStatus = usePasswordBreachCheck(newPassword);

    const clearFieldError = (field) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const getBreachHint = () => {
        if (!newPassword || newPassword.length < PASSWORD_MIN_LENGTH) return null;
        if (breachStatus.state === 'checking') {
            return { text: 'Checking whether this password has appeared in known breaches...', className: 'text-amber-600' };
        }
        if (breachStatus.state === 'done' && breachStatus.breached) {
            return {
                text: `This password was found in known breaches (${breachStatus.count} times). Choose a different password.`,
                className: 'text-red-600',
            };
        }
        if (breachStatus.state === 'done' && !breachStatus.breached && !breachStatus.skipped) {
            return { text: 'Good news: this password was not found in known breaches.', className: 'text-green-700' };
        }
        if (breachStatus.state === 'error') {
            return { text: breachStatus.message, className: 'text-amber-700' };
        }
        return null;
    };

    const breachHint = getBreachHint();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFieldErrors({});

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setToast({ type: 'error', message: 'Please fill in all password fields.' });
            return;
        }

        if (newPassword.length < PASSWORD_MIN_LENGTH) {
            setFieldErrors({ newPassword: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` });
            setToast({ type: 'error', message: `New password must be at least ${PASSWORD_MIN_LENGTH} characters.` });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setFieldErrors({ confirmNewPassword: 'Confirm password must match new password.' });
            setToast({ type: 'error', message: 'Confirm password must match new password.' });
            return;
        }

        setLoading(true);
        const result = await changePassword(currentPassword, newPassword, confirmNewPassword);
        setLoading(false);

        if (!result.success) {
            setFieldErrors(result.fieldErrors || {});
            setToast({ type: 'error', message: result.message });
            return;
        }

        setToast({ type: 'success', message: result.message });
        navigate('/admin/dashboard');
    };

    return (
        <div className="max-w-xl mx-auto">
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-start gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-[#f5d800]/20 text-[#155c27]">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {isForcedChange
                                ? 'This is your first login with a temporary password. Please create a new secure password to continue.'
                                : 'Update your account password to keep your account secure.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="rounded-lg border border-[#f5d800]/40 bg-[#f5d800]/10 p-3 text-sm text-gray-700">
                        <p className="font-semibold text-[#155c27] mb-1">Password rules :</p>
                        <ul className="list-disc ml-5 space-y-1">
                            <li>Minimum length: {PASSWORD_MIN_LENGTH} characters</li>
                            <li>Must match the confirmation password</li>
                            <li>Must not be a known breached password</li>
                            <li>Must be different from your current password</li>
                        </ul>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value);
                                    clearFieldError('currentPassword');
                                }}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none ${fieldErrors.currentPassword ? 'border-red-500 ring-1 ring-red-500/30' : 'border-gray-300'}`}
                                placeholder="Enter current password"
                            />
                        </div>
                        {fieldErrors.currentPassword && (
                            <p className="mt-1 text-xs text-red-600">{fieldErrors.currentPassword}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    clearFieldError('newPassword');
                                }}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none ${fieldErrors.newPassword ? 'border-red-500 ring-1 ring-red-500/30' : 'border-gray-300'}`}
                                placeholder={`Minimum ${PASSWORD_MIN_LENGTH} characters`}
                            />
                        </div>
                        {fieldErrors.newPassword && (
                            <p className="mt-1 text-xs text-red-600">{fieldErrors.newPassword}</p>
                        )}
                        <PasswordStrengthMeter password={newPassword} />
                        {breachHint && !fieldErrors.newPassword && (
                            <p className={`mt-1 text-xs ${breachHint.className}`}>{breachHint.text}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => {
                                    setConfirmNewPassword(e.target.value);
                                    clearFieldError('confirmNewPassword');
                                }}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none ${fieldErrors.confirmNewPassword ? 'border-red-500 ring-1 ring-red-500/30' : 'border-gray-300'}`}
                                placeholder="Re-enter new password"
                            />
                        </div>
                        {fieldErrors.confirmNewPassword && (
                            <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmNewPassword}</p>
                        )}
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 rounded-lg bg-[#155c27] text-white font-medium hover:bg-[#124a20] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
