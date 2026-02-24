import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Eye, Trash2, Filter } from 'lucide-react';
import { getAllPurchases, deletePurchase } from '../services/purchaseService';
import { getAllSuppliers } from '../services/supplierService';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const Purchases = () => {
    const { isAdmin } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialSupplier = queryParams.get('supplier') || '';

    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [supplierFilter, setSupplierFilter] = useState(initialSupplier);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    useEffect(() => {
        getAllSuppliers(1, 100).then(d => setSuppliers(d.suppliers || [])).catch(() => { });
    }, []);

    useEffect(() => {
        fetchPurchases();
    }, [currentPage, supplierFilter, startDate, endDate]);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const data = await getAllPurchases(currentPage, 10, supplierFilter, startDate, endDate);
            setPurchases(data.purchases);
            setTotalPages(data.totalPages);
        } catch (error) {
            setToast({ message: 'Error fetching purchases', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deletePurchase(id);
            setToast({ message: 'Purchase deleted and stock reversed', type: 'success' });
            setDeleteModal(null);
            fetchPurchases();
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Error deleting purchase', type: 'error' });
            setDeleteModal(null);
        }
    };

    const handleFilterReset = () => {
        setSupplierFilter('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Delete Purchase</h3>
                        <p className="text-gray-600 mb-2">Are you sure you want to delete purchase <strong>{deleteModal.purchaseNumber}</strong>?</p>
                        <p className="text-red-600 text-sm mb-6 bg-red-50 p-3 rounded-lg">⚠️ This will reverse all stock changes made by this purchase.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(deleteModal._id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete & Reverse Stock</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Purchases</h1>
                        <p className="text-gray-600 mt-1">Purchase orders and inventory replenishment</p>
                    </div>
                    <Link to="/admin/purchases/create" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">New Purchase</span>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select value={supplierFilter} onChange={(e) => { setSupplierFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none appearance-none">
                                <option value="">All Suppliers</option>
                                {suppliers.map(s => <option key={s._id} value={s._id}>{s.supplierName}</option>)}
                            </select>
                        </div>
                        <div>
                            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="From Date" />
                        </div>
                        <div>
                            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="To Date" />
                        </div>
                        <button onClick={handleFilterReset} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">Reset Filters</button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
                    ) : purchases.length === 0 ? (
                        <div className="text-center py-12"><p className="text-gray-500">No purchases found. Create your first purchase!</p></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">PO Number</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Supplier</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchases.map((p) => (
                                            <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 font-mono text-sm font-medium text-primary-600">{p.purchaseNumber}</td>
                                                <td className="py-3 px-4 text-gray-800">{p.supplier?.supplierName || '—'}</td>
                                                <td className="py-3 px-4 text-gray-600">{new Date(p.purchaseDate).toLocaleDateString('en-LK')}</td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{p.products?.length || 0} items</span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-semibold text-gray-800">LKR {p.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link to={`/admin/purchases/${p._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></Link>
                                                        {isAdmin() && (
                                                            <button onClick={() => setDeleteModal(p)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
                                    <span className="px-4 py-2 text-gray-700">Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Purchases;
