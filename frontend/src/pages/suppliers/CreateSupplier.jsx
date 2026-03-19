import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createSupplier } from '../../services/supplierService';
import Toast from '../../components/Toast';

const CreateSupplier = () => {
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formData, setFormData] = useState({
        supplierName: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateFields = () => {
        const errors = {};
        if (!formData.supplierName.trim()) errors.supplierName = 'Supplier name is required';
        if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            errors.email = 'Please enter a valid email address';
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        }
        if (formData.phone) {
            const cleaned = formData.phone.replace(/[\s\-()]/g, '');
            if (!/^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/.test(cleaned))
                errors.phone = 'Use a valid Sri Lankan number (e.g., 07X XXXXXXX)';
        }
        if (!formData.address.trim()) errors.address = 'Address is required';
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setLoading(true);
        try {
            await createSupplier(formData);
            setToast({ message: 'Supplier created successfully', type: 'success' });
            setTimeout(() => navigate('/admin/suppliers'), 1500);
        } catch (error) {
            if (error.response?.data?.code === 'VALIDATION_ERROR') {
                const serverErrs = {};
                error.response.data.errors?.forEach((e) => { serverErrs[e.field] = e.message; });
                setFieldErrors(prev => ({ ...prev, ...serverErrs }));
            } else {
                setToast({ message: error.response?.data?.message || 'Error creating supplier', type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/suppliers')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Add Supplier</h1>
                        <p className="text-gray-600 mt-1">Create a new supplier record</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name *</label>
                                <input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none ${fieldErrors.supplierName ? 'border-red-500' : 'border-gray-300'}`} />
                                {fieldErrors.supplierName && <p className="mt-1 text-xs text-red-500">{fieldErrors.supplierName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none ${fieldErrors.companyName ? 'border-red-500' : 'border-gray-300'}`} />
                                {fieldErrors.companyName && <p className="mt-1 text-xs text-red-500">{fieldErrors.companyName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`} />
                                {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                                {fieldErrors.phone && <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none resize-none ${fieldErrors.address ? 'border-red-500' : 'border-gray-300'}`} />
                                {fieldErrors.address && <p className="mt-1 text-xs text-red-500">{fieldErrors.address}</p>}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button type="button" onClick={() => navigate('/admin/suppliers')} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-[#f5d800] text-[#155c27] font-weight-600 rounded-lg hover:bg-[#e6c700] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Creating...' : 'Create Supplier'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSupplier;




