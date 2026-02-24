import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Package, ShoppingCart } from 'lucide-react';
import { getSupplierById } from '../services/supplierService';

const ViewSupplier = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getSupplierById(id);
                setData(result);
            } catch (error) {
                console.error('Error fetching supplier:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    if (!data) return <div className="text-center py-12"><p className="text-gray-500">Supplier not found</p></div>;

    const { supplier, purchaseSummary } = data;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/suppliers')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{supplier.supplierName}</h1>
                        <p className="text-gray-600 mt-1">{supplier.companyName || 'Supplier Details'}</p>
                    </div>
                </div>
                <Link to={`/admin/suppliers/edit/${id}`} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                    <Edit className="w-4 h-4" /> Edit
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Total Purchases</p>
                    <p className="text-3xl font-bold text-gray-800">{purchaseSummary.totalPurchases}</p>
                    <ShoppingCart className="w-8 h-8 text-blue-400 mt-2" />
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Total Purchase Value</p>
                    <p className="text-3xl font-bold text-gray-800">LKR {purchaseSummary.totalPurchaseValue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</p>
                    <Package className="w-8 h-8 text-green-400 mt-2" />
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Last Purchase</p>
                    <p className="text-xl font-bold text-gray-800">
                        {purchaseSummary.lastPurchaseDate
                            ? new Date(purchaseSummary.lastPurchaseDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' })
                            : 'No purchases yet'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
                    <div className="space-y-3">
                        <InfoRow label="Status">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${supplier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {supplier.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </InfoRow>
                        {supplier.email && <InfoRow label="Email">{supplier.email}</InfoRow>}
                        {supplier.phone && <InfoRow label="Phone">{supplier.phone}</InfoRow>}
                        {supplier.address && <InfoRow label="Address">{supplier.address}</InfoRow>}
                        <InfoRow label="Since">{new Date(supplier.createdAt).toLocaleDateString()}</InfoRow>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Supplied Products</h2>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{supplier.suppliedProducts?.length || 0} products</span>
                    </div>
                    {supplier.suppliedProducts?.length === 0 ? (
                        <p className="text-gray-500 text-sm">No products linked yet. Create a purchase to link products.</p>
                    ) : (
                        <div className="space-y-2">
                            {supplier.suppliedProducts.map((p) => (
                                <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">{p.productName}</p>
                                        <p className="text-xs text-gray-500">{p.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-700">{p.currentStock} units</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Purchase History</h2>
                    <Link to={`/admin/purchases?supplier=${id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">View All Purchases →</Link>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ label, children }) => (
    <div className="flex items-start gap-3">
        <span className="text-sm text-gray-500 w-20 flex-shrink-0 pt-0.5">{label}</span>
        <span className="text-sm text-gray-800">{children}</span>
    </div>
);

export default ViewSupplier;
