import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Tag, Filter, AlertTriangle } from 'lucide-react';
import { getAllProducts, deleteProduct } from '../services/productService';
import { getAllCategories } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Products = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    useEffect(() => {
        getAllCategories(1, 100).then(d => setCategories(d.categories || [])).catch(() => { });
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getAllProducts(1, 200);
            setProducts(data.products || []);
        } catch {
            setToast({ type: 'error', message: 'Failed to fetch products' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            setToast({ type: 'success', message: 'Product deleted successfully' });
            fetchProducts();
            setDeleteModal(null);
        } catch (err) {
            setToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete product' });
            setDeleteModal(null);
        }
    };

    // Client-side filter
    const filtered = products.filter((p) => {
        const matchSearch =
            p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.category?.categoryName && p.category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchCat = !categoryFilter || (p.category && p.category._id === categoryFilter);
        const matchLow = !showLowStockOnly || p.isLowStock;
        return matchSearch && matchCat && matchLow;
    });

    return (
        <div className="p-6 space-y-6">
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertTriangle className="w-7 h-7" />
                            <h2 className="text-xl font-bold">Delete Product?</h2>
                        </div>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete <strong>{deleteModal.productName}</strong>? This cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={() => handleDelete(deleteModal._id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                    <p className="text-gray-600 mt-1">Manage product catalogue</p>
                </div>
                <Link to="/admin/products/create" className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-lg">
                    <Plus className="w-5 h-5" /> <span>Add Product</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search name, SKU..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
                <div className="relative min-w-40">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none">
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
                    </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showLowStockOnly} onChange={(e) => setShowLowStockOnly(e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm text-orange-600 font-medium">Low Stock Only</span>
                </label>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Product</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">SKU</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Category</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-right text-sm">Cost</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-right text-sm">Price</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-center text-sm">Stock</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-right text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-500">Loading products...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-500">No products found.</td></tr>
                        ) : filtered.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900">{product.productName}</p>
                                    {product.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-400">{product.sku || '—'}</td>
                                <td className="px-6 py-4">
                                    {product.category ? (
                                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full w-fit">
                                            <Tag className="w-3 h-3" />{product.category.categoryName}
                                        </span>
                                    ) : <span className="text-gray-400 text-xs">—</span>}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-500 text-sm">LKR {product.costPrice?.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">LKR {product.sellingPrice?.toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`font-bold text-lg ${product.isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                                        {product.currentStock ?? 0}
                                    </span>
                                    {product.isLowStock && (
                                        <div className="text-xs text-orange-600 font-medium flex items-center justify-center gap-1 mt-0.5">
                                            <AlertTriangle className="w-3 h-3" /> Low
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {product.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link to={`/admin/products/edit/${product._id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit className="w-4 h-4" /></Link>
                                        {isAdmin() && (
                                            <button onClick={() => setDeleteModal(product)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
