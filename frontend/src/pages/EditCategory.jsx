import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getCategoryById, updateCategory } from '../services/categoryService';
import Toast from '../components/Toast';

const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ categoryName: '', description: '', isActive: true });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        getCategoryById(id)
            .then((data) => setForm({ categoryName: data.categoryName, description: data.description || '', isActive: data.isActive }))
            .catch(() => navigate('/admin/categories'))
            .finally(() => setFetching(false));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateCategory(id, form);
            setToast({ message: 'Category updated!', type: 'success' });
            setTimeout(() => navigate('/admin/categories'), 1200);
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Error updating category', type: 'error' });
        } finally { setLoading(false); }
    };

    if (fetching) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin/categories')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-6 h-6" /></button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Edit Category</h1>
                    <p className="text-gray-600">Update category details</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="max-w-lg bg-white rounded-xl shadow-md p-8 border border-gray-100 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                    <input value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                </div>
                <div className="flex items-center gap-3">
                    <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => navigate('/admin/categories')} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Update Category'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditCategory;
