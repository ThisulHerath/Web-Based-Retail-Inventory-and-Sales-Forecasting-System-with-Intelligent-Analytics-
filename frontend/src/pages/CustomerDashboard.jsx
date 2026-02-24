import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { User, Gift, Star, ShoppingBag, Clock, MapPin, Edit2, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { getMyCoupons } from '../services/couponService';
import Toast from '../components/Toast';
import axios from 'axios';

const CustomerDashboard = () => {
    const { customer, logout, updateCustomerData } = useCustomer();
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [toast, setToast] = useState(null);
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
    }, [customer]);

    const fetchData = async () => {
        try {
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
            // Validate Sri Lankan phone number
            if (editForm.phone) {
                const cleaned = editForm.phone.replace(/[\s\-()]/g, '');
                const slPhoneRegex = /^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/;
                if (!slPhoneRegex.test(cleaned)) {
                    setToast({ message: 'Please enter a valid Sri Lankan phone number (e.g., 07X XXXXXXX)', type: 'error' });
                    return;
                }
            }

            const { data } = await axios.put('http://localhost:5000/api/customers/profile', {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                phone: editForm.phone,
            }, {
                headers: { Authorization: `Bearer ${customer.token}` },
            });
            updateCustomerData(data);
            setIsEditing(false);
            setToast({ message: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Failed to update profile', type: 'error' });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await axios.delete('http://localhost:5000/api/customers/profile', {
                headers: { Authorization: `Bearer ${customer.token}` },
            });
            setToast({ message: 'Account deleted successfully', type: 'success' });
            setTimeout(() => {
                logout();
                navigate('/');
            }, 1500);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Failed to delete account', type: 'error' });
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

            {/* Profile Header */}
            <div className="glassmorphism rounded-2xl p-8 mb-8 border border-[var(--color-border)] bg-gradient-to-br from-primary-600 to-primary-800 text-white animate-fade-in-up">
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm border-2 border-white/30">
                        {customer.firstName[0]}{customer.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <h1 className="text-3xl font-bold">{customer.firstName} {customer.lastName}</h1>
                        <p className="text-primary-200 mt-1">{customer.email}</p>
                        <p className="text-primary-200">{customer.phone}</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-primary-200 text-sm">7+ Points Member</p>
                        <p className="text-4xl font-black mt-1">{customer.loyaltyPoints}</p>
                        <p className="text-primary-200 text-sm">Loyalty Points</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/20"
                            title="Edit Profile"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-red-400/20"
                            title="Delete Account"
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
                            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Edit Profile</h2>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-all duration-200 hover:scale-110"
                            >
                                <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={editForm.firstName}
                                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={editForm.lastName}
                                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-[var(--color-text-primary)] transition-all duration-200"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleUpdateProfile}
                                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl hover:shadow-primary-600/30"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg font-semibold hover:bg-[var(--color-border)] transition-all duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
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
                            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Delete Account?</h2>
                            <p className="text-[var(--color-text-secondary)]">
                                This action cannot be undone. All your data, loyalty points, and coupons will be permanently deleted.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
                            >
                                <Trash2 className="w-5 h-5" />
                                Yes, Delete Account
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg font-semibold hover:bg-[var(--color-border)] transition-all duration-200"
                            >
                                Cancel
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
                            <p className="text-sm text-[var(--color-text-secondary)]">Loyalty Points</p>
                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{customer.loyaltyPoints}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{pointsToNextCoupon} pts to next coupon</p>
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
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{customer.loyaltyPoints % 500}/500 points</p>
                    </div>
                </div>

                <div className="glassmorphism rounded-xl p-6 border border-[var(--color-border)] animate-fade-in-up stagger-1 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                            <Gift className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">Active Coupons</p>
                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{activeCoupons.length}</p>
                        </div>
                    </div>
                </div>

                <div className="glassmorphism rounded-xl p-6 border border-[var(--color-border)] animate-fade-in-up stagger-2 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">Total Purchases</p>
                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{customer.totalPurchases || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupons Section */}
            <div className="glassmorphism rounded-xl p-6 border border-[var(--color-border)] mb-8 animate-fade-in-up stagger-3">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary-600" />
                    My Coupons
                </h2>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-8 text-[var(--color-text-secondary)]">
                        <Gift className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-secondary)]" />
                        <p>No coupons yet. Keep shopping to earn loyalty points!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Active Coupons */}
                        {activeCoupons.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-green-600 mb-2">Active</h3>
                                {activeCoupons.map((coupon) => (
                                    <div key={coupon._id} className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-2 flex items-center justify-between hover:scale-105 transition-all duration-200">
                                        <div>
                                            <p className="font-bold font-mono text-[var(--color-text-primary)] text-lg">{coupon.code}</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {coupon.discountType === 'Percentage' ? `${coupon.discountValue}% off` : `LKR ${coupon.discountValue} off`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                                            <p className="text-xs text-[var(--color-text-secondary)] mt-1 flex items-center gap-1 justify-end">
                                                <Clock className="w-3 h-3" />
                                                Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Used Coupons */}
                        {usedCoupons.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2 mt-4">Used</h3>
                                {usedCoupons.map((coupon) => (
                                    <div key={coupon._id} className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] mb-2 flex items-center justify-between opacity-60">
                                        <div>
                                            <p className="font-bold font-mono text-[var(--color-text-secondary)] line-through">{coupon.code}</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {coupon.discountType === 'Percentage' ? `${coupon.discountValue}% off` : `LKR ${coupon.discountValue} off`}
                                            </p>
                                        </div>
                                        <span className="bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] px-3 py-1 rounded-full text-xs font-bold border border-[var(--color-border)]">Used</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Expired Coupons */}
                        {expiredCoupons.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-red-500 mb-2 mt-4">Expired</h3>
                                {expiredCoupons.map((coupon) => (
                                    <div key={coupon._id} className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-2 flex items-center justify-between opacity-60">
                                        <div>
                                            <p className="font-bold font-mono text-[var(--color-text-secondary)] line-through">{coupon.code}</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {coupon.discountType === 'Percentage' ? `${coupon.discountValue}% off` : `LKR ${coupon.discountValue} off`}
                                            </p>
                                        </div>
                                        <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold">Expired</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* How Loyalty Works */}
            <div className="glassmorphism rounded-2xl p-8 border border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 animate-fade-in-up stagger-4">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">How 7+ Points Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <ShoppingBag className="w-6 h-6 text-primary-600" />
                        </div>
                        <h3 className="font-bold text-[var(--color-text-primary)]">Shop In-Store</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Make purchases at 7 Super City</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Star className="w-6 h-6 text-amber-500" />
                        </div>
                        <h3 className="font-bold text-[var(--color-text-primary)]">Earn Points</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">1 point for every LKR 100 spent</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <Gift className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-[var(--color-text-primary)]">Get Coupons</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">500 points = 5% discount coupon</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
