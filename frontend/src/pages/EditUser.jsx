import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateUser, getAllUsers } from '../services/userService'; // Assuming single user fetch isn't separate, but if needed I can filter or fetch. Actually, I only have getAll.
// Wait, my service doesn't have getUserById in the snippet I wrote earlier? 
// Let me check userService.js. I wrote getAllUsers, getUserStats, createUser, updateUser, deleteUser. 
// I *don't* have getUserById. I should probably add it or just fetch all and find one since user list is small.
// Or I can just pass the user object via state if coming from list, but direct link access would fail. 
// Actually, for "updateUser", the backend route is `PUT /api/users/:id`.
// But to *populate* the form, I need to get the user data.
// I'll add a simple get-by-id logic effectively by finding in the list or assume I can fetch it. 
// Since I didn't create a specific GET /api/users/:id endpoint in the backend controller (I only see getAllUsers, createUser, updateUser, deleteUser, getUserStats),
// I will just fetch all users and find the one matching ID for this MVP, or I should update backend to support GET /:id.
// Looking at backend/routes/userRoutes.js: `router.route('/:id').put(updateUser).delete(deleteUser);` -> NO GET.
// Okay, so "Edit" has to relying on state passing OR fetching the list. I'll fetch list and find.

import Toast from '../components/Toast';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EditUser = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'cashier',
        isActive: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            // Since we lack a direct GET /:id, we fetch all and find. 
            // In a real large app, we'd want a specific endpoint.
            const data = await getAllUsers(1, 1000);
            const user = data.users.find(u => u._id === id);

            if (user) {
                setFormData({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                });
            } else {
                setToast({ type: 'error', message: 'User not found' });
                setTimeout(() => navigate('/admin/users'), 2000);
            }
            setLoading(false);
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to fetch user details' });
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await updateUser(id, formData);
            setToast({ type: 'success', message: 'User updated successfully' });
            setTimeout(() => {
                navigate('/admin/users');
            }, 1000);
        } catch (error) {
            setToast({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update user',
            });
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading user details...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    to="/admin/users"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
            </div>

            <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 cursor-not-allowed"
                            value={formData.email}
                            onChange={handleChange}
                            disabled
                            title="Email cannot be changed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            name="role"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
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
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors ${saving ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
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

export default EditUser;
