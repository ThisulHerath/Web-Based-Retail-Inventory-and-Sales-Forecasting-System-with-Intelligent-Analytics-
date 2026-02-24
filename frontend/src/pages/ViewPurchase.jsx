import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { getPurchaseById } from '../services/purchaseService';

const ViewPurchase = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [purchase, setPurchase] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPurchaseById(id)
            .then(setPurchase)
            .catch(() => navigate('/admin/purchases'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    if (!purchase) return null;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/purchases')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Purchase Invoice</h1>
                        <p className="text-gray-600 mt-1 font-mono">{purchase.purchaseNumber}</p>
                    </div>
                </div>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Printer className="w-4 h-4" /> Print
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                {/* Invoice Header */}
                <div className="bg-gradient-to-r from-primary-700 to-primary-500 text-white p-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">7 Super City</h2>
                            <p className="text-primary-100 mt-1">Retail Management</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold">{purchase.purchaseNumber}</p>
                            <p className="text-primary-100 text-sm mt-1">PURCHASE ORDER</p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold capitalize ${purchase.status === 'completed' ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                                {purchase.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* Supplier & Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Supplier</h3>
                            <p className="font-bold text-gray-800 text-lg">{purchase.supplier?.supplierName}</p>
                            {purchase.supplier?.companyName && <p className="text-gray-600">{purchase.supplier.companyName}</p>}
                            {purchase.supplier?.email && <p className="text-gray-500 text-sm mt-1">{purchase.supplier.email}</p>}
                            {purchase.supplier?.phone && <p className="text-gray-500 text-sm">{purchase.supplier.phone}</p>}
                            {purchase.supplier?.address && <p className="text-gray-500 text-sm mt-1">{purchase.supplier.address}</p>}
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Order Info</h3>
                            <div className="space-y-1">
                                <p className="text-sm"><span className="text-gray-500">Purchase Date: </span><span className="font-medium text-gray-800">{new Date(purchase.purchaseDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                                <p className="text-sm"><span className="text-gray-500">Recorded by: </span><span className="font-medium text-gray-800">{purchase.createdBy?.name}</span></p>
                                {purchase.notes && <p className="text-sm mt-2"><span className="text-gray-500">Notes: </span><span className="text-gray-700">{purchase.notes}</span></p>}
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200 mb-8">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">#</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cost Price</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchase.products.map((item, index) => (
                                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-500 text-sm">{index + 1}</td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-800">{item.productName}</p>
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700">{item.quantity}</td>
                                        <td className="py-3 px-4 text-right text-gray-700">LKR {item.costPrice.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                        <td className="py-3 px-4 text-right font-semibold text-gray-800">LKR {item.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={4} className="py-4 px-4 text-right font-bold text-gray-800 text-lg">Grand Total</td>
                                    <td className="py-4 px-4 text-right font-bold text-xl text-primary-600">LKR {purchase.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <p className="text-center text-gray-400 text-sm">This purchase order was automatically recorded in the inventory management system.</p>
                </div>
            </div>
        </div>
    );
};

export default ViewPurchase;
