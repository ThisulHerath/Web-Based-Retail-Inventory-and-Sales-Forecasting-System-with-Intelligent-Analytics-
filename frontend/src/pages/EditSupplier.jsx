import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getSupplierById, updateSupplier } from '../services/supplierService';
import Toast from '../components/Toast';

const EditSupplier = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [formData, setFormData] = useState({
        supplierName: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
        isActive: true,
    });

    useEffect(() => {
        const fetchSupplier = async () => {
            try {
                const data = await getSupplierById(id);
                const s = data.supplier;
                setFormData({
                    supplierName: s.supplierName || '',
                    companyName: s.companyName || '',
                    email: s.email || '',
                    phone: s.phone || '',
                    address: s.address || '',
                    isActive: s.isActive,
                });
            } catch (error) {
                setToast({ message: 'Error loading supplier', type: 'error' });
            } finally {
                setInitialLoading(false);
            }
        };
        fetchSupplier();
    }, [id]);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
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
        setLoading(true);
        try {
            await updateSupplier(id, formData);
            setToast({ message: 'Supplier updated successfully', type: 'success' });
            setTimeout(() => navigate('/admin/suppliers'), 1500);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Error updating supplier', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/suppliers')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Edit Supplier</h1>
                        <p className="text-gray-600 mt-1">Update supplier information</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name *</label>
                                <input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none" />
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Supplier</label>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-2">
                            <button type="button" onClick={() => navigate('/admin/suppliers')} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSupplier;
