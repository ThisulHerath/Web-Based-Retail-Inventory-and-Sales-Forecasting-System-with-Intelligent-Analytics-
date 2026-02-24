import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { getSaleById, updateSale } from '../services/salesService';
import { getAllProducts } from '../services/productService';
import Toast from '../components/Toast';

const EditSale = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        customerName: '',
        paymentMethod: 'Cash',
        items: [{ productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0, maxStock: 0 }],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [saleData, productsData] = await Promise.all([
                    getSaleById(id),
                    getAllProducts(1, 1000)
                ]);

                // Map items to include maxStock from current products (approximate)
                const mappedItems = saleData.items.map(item => {
                    const product = productsData.products.find(p => p._id === item.productId || p._id === item._id);
                    return {
                        ...item,
                        productId: item.productId || product?._id || '',
                        maxStock: product ? product.currentStock + item.quantity : 99999,
                    };
                });

                setProducts(productsData.products);
                setFormData({
                    customerName: saleData.customerName,
                    paymentMethod: saleData.paymentMethod,
                    items: mappedItems,
                });
            } catch (error) {
                setToast({ message: 'Error fetching data', type: 'error' });
            } finally {
                setInitialLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];

        if (field === 'productId') {
            const product = products.find(p => p._id === value);
            if (product) {
                newItems[index].productId = product._id;
                newItems[index].productName = product.productName;
                newItems[index].unitPrice = product.sellingPrice;
                newItems[index].maxStock = product.currentStock;
                newItems[index].quantity = 1;
                newItems[index].total = product.sellingPrice;
            } else {
                newItems[index].productId = '';
                newItems[index].productName = '';
                newItems[index].unitPrice = 0;
                newItems[index].maxStock = 0;
                newItems[index].total = 0;
            }
        } else {
            newItems[index][field] = value;
        }

        if (field === 'quantity' || field === 'productId') {
            const quantity = parseFloat(newItems[index].quantity) || 0;
            const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
            newItems[index].total = quantity * unitPrice;
        }

        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0, maxStock: 0 }],
        });
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData({ ...formData, items: newItems });
        }
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
        const tax = subtotal * 0.1;
        const grandTotal = subtotal + tax;
        return { subtotal, tax, grandTotal };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const invalidItems = formData.items.filter(item =>
            !item.productId ||
            item.quantity <= 0 ||
            item.quantity > item.maxStock
        );

        if (invalidItems.length > 0) {
            const outOfStock = invalidItems.some(item => item.quantity > item.maxStock);
            setToast({
                message: outOfStock
                    ? 'Some items exceed available stock'
                    : 'Please select products and valid quantities',
                type: 'error'
            });
            return;
        }

        setLoading(true);
        try {
            await updateSale(id, formData);
            setToast({ message: 'Sale updated successfully', type: 'success' });
            setTimeout(() => {
                navigate(`/admin/sales/${id}`);
            }, 1500);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Error updating sale', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const { subtotal, tax, grandTotal } = calculateTotals();

    return (
        <div className="p-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/admin/sales/${id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Edit Sale</h1>
                        <p className="text-gray-600 mt-1">Update sales transaction</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.customerName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, customerName: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method *
                                </label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) =>
                                        setFormData({ ...formData, paymentMethod: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Items</h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product *
                                        </label>
                                        <select
                                            value={item.productId}
                                            onChange={(e) =>
                                                handleItemChange(index, 'productId', e.target.value)
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                            required
                                        >
                                            <option value="">Select Product</option>
                                            {products.map(p => (
                                                <option key={p._id} value={p._id}>
                                                    {p.productName} ( Stock: {p.currentStock})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.maxStock}
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleItemChange(index, 'quantity', e.target.value)
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                            required
                                        />
                                        {item.productId && (
                                            <p className={`text-xs mt-1 ${item.quantity > item.maxStock ? 'text-red-500' : 'text-gray-500'}`}>
                                                Max: {item.maxStock}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Unit Price
                                        </label>
                                        <input
                                            type="number"
                                            value={item.unitPrice}
                                            readOnly
                                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Total
                                            </label>
                                            <input
                                                type="text"
                                                value={`LKR ${item.total.toFixed(2)}`}
                                                readOnly
                                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-700">
                                <span>Subtotal:</span>
                                <span className="font-semibold">LKR {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Tax (10%):</span>
                                <span className="font-semibold">LKR {tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t">
                                <span>Grand Total:</span>
                                <span>LKR {grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/sales/${id}`)}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Sale'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSale;
