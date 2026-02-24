import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { getAllSuppliers, deleteSupplier } from '../services/supplierService';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const Suppliers = () => {
    const { isAdmin } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isActiveFilter, setIsActiveFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    useEffect(() => {
        fetchSuppliers();
    }, [currentPage, search, isActiveFilter]);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await getAllSuppliers(currentPage, 10, search, isActiveFilter);
            setSuppliers(data.suppliers);
            setTotalPages(data.totalPages);
        } catch (error) {
            setToast({ message: 'Error fetching suppliers', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteSupplier(id);
            setToast({ message: 'Supplier deleted successfully', type: 'success' });
            setDeleteModal(null);
            fetchSuppliers();
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Error deleting supplier', type: 'error' });
            setDeleteModal(null);
        }
    };

    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{deleteModal.supplierName}</strong>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(deleteModal._id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
                        <p className="text-gray-600 mt-1">Manage your supplier directory</p>
                    </div>
                    <Link to="/admin/suppliers/create" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Add Supplier</span>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                placeholder="Search by name or company..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={isActiveFilter}
                                onChange={(e) => { setIsActiveFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : suppliers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No suppliers found. Add your first supplier!</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Supplier</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Products</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suppliers.map((s) => (
                                            <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 font-medium text-gray-800">{s.supplierName}</td>
                                                <td className="py-3 px-4 text-gray-600">{s.companyName || '—'}</td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm">
                                                        {s.email && <div className="text-gray-600">{s.email}</div>}
                                                        {s.phone && <div className="text-gray-500">{s.phone}</div>}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                        {s.suppliedProducts?.length || 0} products
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {s.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link to={`/admin/suppliers/${s._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></Link>
                                                        <Link to={`/admin/suppliers/edit/${s._id}`} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></Link>
                                                        {isAdmin() && (
                                                            <button onClick={() => setDeleteModal(s)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
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

export default Suppliers;
