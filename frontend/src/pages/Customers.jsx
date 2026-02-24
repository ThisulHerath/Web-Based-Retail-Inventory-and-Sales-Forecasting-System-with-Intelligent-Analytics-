import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { getAllCustomers, deleteCustomer } from '../services/customerService';
import { getCustomerCoupons } from '../services/couponService';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Customers = () => {
    const { isAdmin } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [toast, setToast] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [showCoupons, setShowCoupons] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, [page, search]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await getAllCustomers(page, 10, search);
            setCustomers(data.customers);
            setTotalPages(data.totalPages);
            setTotalCustomers(data.totalCustomers);
        } catch (error) {
            setToast({ message: 'Failed to load customers', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;
        try {
            await deleteCustomer(id);
            setToast({ message: 'Customer deleted successfully', type: 'success' });
            fetchCustomers();
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Error deleting customer', type: 'error' });
        }
    };

    const handleViewCoupons = async (customer) => {
        try {
            const data = await getCustomerCoupons(customer._id);
            setCoupons(data);
            setSelectedCustomer(customer);
            setShowCoupons(true);
        } catch (error) {
            setToast({ message: 'Failed to load coupons', type: 'error' });
        }
    };

    return (
        <div className="p-6 space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
                    <p className="text-gray-600 mt-1">Total: {totalCustomers} customers</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No customers found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Loyalty Points</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total Purchases</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                                                    {customer.firstName[0]}{customer.lastName[0]}
                                                </div>
                                                <span className="font-medium text-gray-800">{customer.firstName} {customer.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{customer.email}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{customer.phone}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold">
                                                ⭐ {customer.loyaltyPoints}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-gray-700">{customer.totalPurchases}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${customer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {customer.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewCoupons(customer)}
                                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="View Coupons"
                                                >
                                                    <Gift className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    to={`/admin/customers/edit/${customer._id}`}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                {isAdmin() && (
                                                    <button
                                                        onClick={() => handleDelete(customer._id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Coupons Modal */}
            {showCoupons && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCoupons(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">
                                Coupons for {selectedCustomer.firstName} {selectedCustomer.lastName}
                            </h3>
                        </div>
                        <div className="p-6">
                            {coupons.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No coupons found</p>
                            ) : (
                                <div className="space-y-3">
                                    {coupons.map((coupon) => (
                                        <div key={coupon._id} className={`p-4 rounded-lg border ${coupon.isUsed ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-gray-800 font-mono">{coupon.code}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {coupon.discountType === 'Percentage' ? `${coupon.discountValue}% off` : `LKR ${coupon.discountValue} off`}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${coupon.isUsed ? 'bg-gray-200 text-gray-600' : new Date(coupon.expiryDate) < new Date() ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                    {coupon.isUsed ? 'Used' : new Date(coupon.expiryDate) < new Date() ? 'Expired' : 'Active'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setShowCoupons(false)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
