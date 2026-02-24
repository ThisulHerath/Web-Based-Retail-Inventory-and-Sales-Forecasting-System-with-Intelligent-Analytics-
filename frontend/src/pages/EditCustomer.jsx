import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getCustomerById, updateCustomer } from '../services/customerService';
import { generateCoupon } from '../services/couponService';
import Toast from '../components/Toast';

const EditCustomer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        isActive: true,
        loyaltyPoints: 0,
    });

    useEffect(() => {
        fetchCustomer();
    }, [id]);

    const fetchCustomer = async () => {
        try {
            const data = await getCustomerById(id);
            setFormData({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                isActive: data.isActive,
                loyaltyPoints: data.loyaltyPoints,
            });
        } catch (error) {
            setToast({ message: 'Failed to load customer', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.phone) {
            const cleaned = formData.phone.replace(/[\s\-()]/g, '');
            const slPhoneRegex = /^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/;
            if (!slPhoneRegex.test(cleaned)) {
                setToast({ message: 'Please enter a valid Sri Lankan phone number (e.g., 07X XXXXXXX)', type: 'error' });
                return;
            }
        }

        setSaving(true);
        try {
            await updateCustomer(id, formData);
            setToast({ message: 'Customer updated successfully', type: 'success' });
            setTimeout(() => navigate('/admin/customers'), 1500);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Error updating customer', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateCoupon = async () => {
        try {
            await generateCoupon({ customerId: id, discountType: 'Percentage', discountValue: 5, expiryDays: 30 });
            setToast({ message: 'Coupon generated successfully', type: 'success' });
        } catch (error) {
            setToast({ message: 'Failed to generate coupon', type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/customers')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Edit Customer</h1>
                    <p className="text-gray-600 mt-1">Update customer information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Customer Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loyalty Points</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.loyaltyPoints}
                            onChange={(e) => setFormData({ ...formData, loyaltyPoints: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">Status:</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            <span className="ml-3 text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
                        </label>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Loyalty Actions</h2>
                    <button
                        type="button"
                        onClick={handleGenerateCoupon}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        Generate 5% Coupon
                    </button>
                </div>

                <div className="flex gap-4">
                    <button type="button" onClick={() => navigate('/admin/customers')} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditCustomer;
