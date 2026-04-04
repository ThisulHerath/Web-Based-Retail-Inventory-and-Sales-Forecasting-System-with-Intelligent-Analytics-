import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Eye, Trash2, Filter } from 'lucide-react';
import { getAllPurchases, deletePurchase } from '../../services/purchaseService';
import { getAllSuppliers } from '../../services/supplierService';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';

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
    const [dateError, setDateError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [isDeletingPurchase, setIsDeletingPurchase] = useState(false);
    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        getAllSuppliers(1, 100).then(d => setSuppliers(d.suppliers || [])).catch(() => { });
    }, []);

    useEffect(() => {
        const validationError = validateDateRange(startDate, endDate);
        setDateError(validationError);

        if (validationError) {
            setPurchases([]);
            setTotalPages(1);
            setLoading(false);
            return;
        }

        fetchPurchases();
    }, [currentPage, supplierFilter, startDate, endDate]);

    const validateDateRange = (start, end) => {
        if (!start && !end) return '';

        if (start && start > today) {
            return 'Start date cannot be in the future.';
        }

        if (end && end > today) {
            return 'End date cannot be in the future.';
        }

        if (start && end && start > end) {
            return 'Start date must be earlier than or equal to end date.';
        }

        return '';
    };

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
            setIsDeletingPurchase(true);
            await deletePurchase(id);
            setToast({ message: 'Purchase deleted and stock reversed', type: 'success' });
            setDeleteModal(null);
            fetchPurchases();
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Error deleting purchase', type: 'error' });
            setDeleteModal(null);
        } finally {
            setIsDeletingPurchase(false);
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
                        <p className="text-red-600 text-sm mb-6 bg-red-50 p-3 rounded-lg">âš ï¸ This will reverse all stock changes made by this purchase.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal(null)}
                                disabled={isDeletingPurchase}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteModal._id)}
                                disabled={isDeletingPurchase}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeletingPurchase ? 'Deleting...' : 'Delete & Reverse Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeletingPurchase && (
                <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl px-6 py-5 shadow-lg border border-gray-100 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-red-600"></div>
                        <p className="text-gray-800 font-medium">Deleting purchase...</p>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Purchases</h1>
                        <p className="text-gray-600 mt-1">Purchase orders and inventory replenishment</p>
                    </div>
                    <Link to="/admin/purchases/create" className="flex items-center gap-2 px-4 py-2 bg-[#f5d800] text-[#155c27] font-weight-600 rounded-lg hover:bg-[#e6c700] transition-colors shadow-lg">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">New Purchase</span>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Supplier</label>
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select value={supplierFilter} onChange={(e) => { setSupplierFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] outline-none appearance-none">
                    <option value="">All Suppliers</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.supplierName}</option>)}
                </select>
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
            <input
                type="date"
                value={startDate}
                max={endDate || today}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] outline-none"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
            <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                max={today}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] outline-none"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 invisible">Reset</label>
            <button onClick={handleFilterReset} className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                Reset Filters
            </button>
        </div>
    </div>

                    {dateError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                            {dateError}
                        </div>
                    )}

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
                                                <td className="py-3 px-4 font-mono text-m font-bold text-[#000000]">{p.purchaseNumber}</td>
                                                <td className="py-3 px-4 text-gray-800">{p.supplier?.supplierName || 'â€”'}</td>
                                                <td className="py-3 px-4 text-gray-600">{new Date(p.purchaseDate).toLocaleDateString('en-LK')}</td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-2 bg-[#1a6e3098] text-[#ffffff] rounded-full text-xs font-medium">{p.products?.length || 0} items</span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-semibold text-gray-800">LKR {p.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link to={`/admin/purchases/${p._id}`} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /> View</Link>
                                                        {isAdmin() && (
                                                            <button onClick={() => setDeleteModal(p)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /> Delete</button>
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





