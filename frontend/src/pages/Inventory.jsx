import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, AlertTriangle, ArrowUpCircle, ArrowDownCircle, History } from 'lucide-react';
import { getAllInventory } from '../services/inventoryService';
import { getAllCategories } from '../services/categoryService';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
    const { isAdmin, isManager } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        getAllCategories(1, 100).then(d => setCategories(d.categories || [])).catch(() => { });
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [currentPage, search, categoryFilter, lowStockOnly]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await getAllInventory(currentPage, 15, search, categoryFilter, lowStockOnly);
            setInventory(data.inventory || []);
            setTotalPages(data.totalPages || 1);
        } catch {
            setToast({ message: 'Failed to load inventory', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>
                    <p className="text-gray-600 mt-1">Stock levels and transaction management</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="relative sm:col-span-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Search by name or SKU..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm appearance-none">
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="lowStock" checked={lowStockOnly} onChange={(e) => { setLowStockOnly(e.target.checked); setCurrentPage(1); }} className="w-4 h-4" />
                        <label htmlFor="lowStock" className="text-sm font-medium text-orange-600 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" /> Low Stock Only
                        </label>
                    </div>
                    <button onClick={() => { setSearch(''); setCategoryFilter(''); setLowStockOnly(false); setCurrentPage(1); }}
                        className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Reset</button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
                ) : inventory.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No inventory records found.</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Product</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">SKU</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Category</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Current Stock</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Min. Level</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map((inv) => {
                                        const isLow = inv.currentStock <= inv.product?.minimumStockLevel;
                                        return (
                                            <tr key={inv._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-gray-800">{inv.product?.productName}</p>
                                                    {!inv.product?.isActive && <span className="text-xs text-gray-400">(Inactive)</span>}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-xs text-gray-500">{inv.product?.sku || '—'}</td>
                                                <td className="py-3 px-4">
                                                    {inv.product?.category ? (
                                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{inv.product.category.categoryName}</span>
                                                    ) : '—'}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>{inv.currentStock}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center text-gray-500 text-sm">{inv.product?.minimumStockLevel}</td>
                                                <td className="py-3 px-4 text-center">
                                                    {isLow ? (
                                                        <span className="flex items-center justify-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                            <AlertTriangle className="w-3 h-3" /> Low
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">OK</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1">
                                                        <Link to={`/admin/products/${inv.product?._id}/stock-in`} title="Stock In" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><ArrowUpCircle className="w-4 h-4" /></Link>
                                                        <Link to={`/admin/products/${inv.product?._id}/stock-out`} title="Stock Out" className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg"><ArrowDownCircle className="w-4 h-4" /></Link>
                                                        <Link to={`/admin/products/${inv.product?._id}/history`} title="History" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"><History className="w-4 h-4" /></Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                                <span className="px-4 py-2 text-gray-600 text-sm">Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Inventory;
