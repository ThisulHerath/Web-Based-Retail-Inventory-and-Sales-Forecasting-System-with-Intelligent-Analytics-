import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createCategory } from '../services/categoryService';
import Toast from '../components/Toast';

const CreateCategory = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ categoryName: '', description: '', isActive: true });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.categoryName.trim()) {
            setToast({ message: 'Category name is required', type: 'error' }); return;
        }
        setLoading(true);
        try {
            await createCategory(form);
            setToast({ message: 'Category created!', type: 'success' });
            setTimeout(() => navigate('/admin/categories'), 1200);
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Error creating category', type: 'error' });
        } finally { setLoading(false); }
    };

    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin/categories')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-6 h-6" /></button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Create Category</h1>
                    <p className="text-gray-600">Add a new product category</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="max-w-lg bg-white rounded-xl shadow-md p-8 border border-gray-100 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                    <input value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                        placeholder="e.g. Electronics" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3} placeholder="Optional description..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                </div>
                <div className="flex items-center gap-3">
                    <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => navigate('/admin/categories')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Create Category'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCategory;
