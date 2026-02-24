import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { createPurchase } from '../services/purchaseService';
import { getAllSuppliers } from '../services/supplierService';
import { getAllProducts } from '../services/productService';
import Toast from '../components/Toast';

const CreatePurchase = () => {
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [supplierId, setSupplierId] = useState('');
    const [notes, setNotes] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([{ productId: '', quantity: 1, costPrice: 0, total: 0 }]);

    useEffect(() => {
        getAllSuppliers(1, 100).then(d => setSuppliers(d.suppliers || [])).catch(() => { });
        getAllProducts(1, 100).then(d => setProducts(d.products || [])).catch(() => { });
    }, []);

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = field === 'quantity' || field === 'costPrice' ? parseFloat(value) || 0 : value;

        // Auto-fill cost price from product
        if (field === 'productId' && value) {
            const product = products.find(p => p._id === value);
            if (product) updated[index].costPrice = product.costPrice;
        }

        updated[index].total = (updated[index].quantity || 0) * (updated[index].costPrice || 0);
        setItems(updated);
    };

    const addItem = () => setItems([...items, { productId: '', quantity: 1, costPrice: 0, total: 0 }]);

    const removeItem = (index) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!supplierId) {
            setToast({ message: 'Please select a supplier', type: 'error' });
            return;
        }
        const invalidItems = items.filter(i => !i.productId || i.quantity <= 0 || i.costPrice <= 0);
        if (invalidItems.length > 0) {
            setToast({ message: 'Please complete all product rows', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await createPurchase({ supplierId, products: items, notes, purchaseDate });
            setToast({ message: 'Purchase created and stock updated!', type: 'success' });
            setTimeout(() => navigate('/admin/purchases'), 1500);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Error creating purchase', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/purchases')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">New Purchase Order</h1>
                        <p className="text-gray-600 mt-1">Record a supplier purchase and update inventory</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none appearance-none">
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.supplierName} {s.companyName ? `(${s.companyName})` : ''}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                                <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Products</h2>
                            <button type="button" onClick={addItem} className="flex items-center gap-2 px-3 py-2 text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors text-sm">
                                <Plus className="w-4 h-4" /> Add Product
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Product</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 w-28">Qty</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 w-36">Cost Price (LKR)</th>
                                        <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700 w-36">Total</th>
                                        <th className="py-2 px-3 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-100">
                                            <td className="py-2 px-3">
                                                <select value={item.productId} onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm appearance-none">
                                                    <option value="">Select Product</option>
                                                    {products.map(p => <option key={p._id} value={p._id}>{p.productName}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-2 px-3">
                                                <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                                            </td>
                                            <td className="py-2 px-3">
                                                <input type="number" min="0" step="0.01" value={item.costPrice} onChange={(e) => updateItem(index, 'costPrice', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                                            </td>
                                            <td className="py-2 px-3 text-right font-semibold text-gray-800 text-sm">
                                                LKR {item.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-2 px-3">
                                                <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} className="pt-4 px-3 text-right font-bold text-gray-800">Grand Total:</td>
                                        <td className="pt-4 px-3 text-right font-bold text-xl text-primary-600">LKR {grandTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => navigate('/admin/purchases')} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                            {loading ? 'Saving & Updating Stock...' : 'Save Purchase & Update Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePurchase;
