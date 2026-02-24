import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, Search } from 'lucide-react';
import { getAllCategories, deleteCategory } from '../services/categoryService';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const Categories = () => {
    const { isAdmin } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getAllCategories(1, 100, search);
            setCategories(data.categories || []);
        } catch {
            setToast({ message: 'Failed to load categories', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            setToast({ message: 'Category deleted', type: 'success' });
            setDeleteModal(null);
            fetchCategories();
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Error deleting category', type: 'error' });
            setDeleteModal(null);
        }
    };

    const filtered = categories.filter(c =>
        c.categoryName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Category</h3>
                        <p className="text-gray-600 mb-6">Delete <strong>{deleteModal.categoryName}</strong>? This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={() => handleDelete(deleteModal._id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
                    <p className="text-gray-600 mt-1">Manage product categories</p>
                </div>
                {isAdmin() && (
                    <Link to="/admin/categories/create" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg">
                        <Plus className="w-5 h-5" /> <span className="font-medium">New Category</span>
                    </Link>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..."
                        className="w-full sm:w-72 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No categories found.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((cat) => (
                            <div key={cat._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            <Tag className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{cat.categoryName}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {cat.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {isAdmin() && (
                                            <>
                                                <Link to={`/admin/categories/edit/${cat._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></Link>
                                                <button onClick={() => setDeleteModal(cat)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {cat.description && <p className="text-gray-500 text-sm mt-3">{cat.description}</p>}
                                <p className="text-xs text-gray-400 mt-3">{cat.productCount || 0} product(s)</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
