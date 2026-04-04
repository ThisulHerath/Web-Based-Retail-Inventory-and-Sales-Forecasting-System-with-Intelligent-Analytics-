import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../services/userService';
import Toast from '../../components/Toast';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'cashier',
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const validateFields = () => {
        const errors = {};
        if (!formData.name.trim() || formData.name.trim().length < 2)
            errors.name = 'Full name must be at least 2 characters';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
            errors.email = 'Please enter a valid email address';
        return errors;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
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
            await createUser(formData);
            setToast({ type: 'success', message: 'User created successfully' });
            setTimeout(() => {
                navigate('/admin/users');
            }, 1000);
        } catch (error) {
            if (error.response?.data?.code === 'VALIDATION_ERROR') {
                const serverErrs = {};
                error.response.data.errors?.forEach((e) => { serverErrs[e.field] = e.message; });
                setFieldErrors((prev) => ({ ...prev, ...serverErrs }));
            } else {
                setToast({
                    type: 'error',
                    message: error.response?.data?.message || 'Failed to create user',
                });
            }
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    to="/admin/users"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Create New User</h1>
            </div>

            <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5d800] ${fieldErrors.name ? 'border-red-500' : 'border-gray-200'}`}
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5d800] ${fieldErrors.email ? 'border-red-500' : 'border-gray-200'}`}
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            name="role"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5d800]"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="cashier">Cashier</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            className="w-4 h-4 text-[#f5d800] border-gray-300 rounded focus:ring-[#f5d800]"
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                            Active Account
                        </label>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/users')}
                            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2 bg-[#f5d800] text-[#155c27] font-weight-600 rounded-lg hover:bg-[#e6c700] transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            <Save className="w-5 h-5" />
                            <span>{loading ? 'Creating...' : 'Create User'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default CreateUser;





