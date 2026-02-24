import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Search, Tag, UserCheck } from 'lucide-react';
import { createSale } from '../services/salesService';
import { getAllProducts } from '../services/productService';
import { getAllCustomers } from '../services/customerService';
import Toast from '../components/Toast';

const CreateSale = () => {
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const customerDropdownRef = useRef(null);

    // Close customer dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
                setShowCustomerDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [formData, setFormData] = useState({
        customerName: '',
        customerId: '',
        couponCode: '',
        paymentMethod: 'Cash',
        items: [{ productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0, maxStock: 0 }],
    });

    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getAllProducts(1, 1000);
            setProducts(data.products);
        } catch (error) {
            setToast({ message: 'Failed to load products', type: 'error' });
        }
    };

    const fetchCustomers = async () => {
        try {
            const data = await getAllCustomers();
            setCustomers(data.customers || data || []);
        } catch (error) {
            console.error('Failed to load customers:', error);
        }
    };

    const filteredCustomers = customers.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone?.includes(customerSearch)
    );

    const selectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setFormData({
            ...formData,
            customerId: customer._id,
            customerName: `${customer.firstName} ${customer.lastName}`
        });
        setCustomerSearch('');
        setShowCustomerDropdown(false);
    };

    const clearCustomer = () => {
        setSelectedCustomer(null);
        setFormData({ ...formData, customerId: '', customerName: '' });
        setCouponCode('');
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];

        if (field === 'productId') {
            const product = products.find(p => p._id === value);
            if (product) {
                newItems[index].productId = product._id;
                newItems[index].productName = product.productName;
                newItems[index].unitPrice = product.sellingPrice;
                newItems[index].maxStock = product.currentStock;
                newItems[index].quantity = 1; // Reset quantity
                newItems[index].total = product.sellingPrice;
            } else {
                // Reset if no product selected
                newItems[index].productId = '';
                newItems[index].productName = '';
                newItems[index].unitPrice = 0;
                newItems[index].maxStock = 0;
                newItems[index].total = 0;
            }
        } else {
            newItems[index][field] = value;
        }

        // Auto-calculate total for the item
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

        // Validate items
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
            const saleData = {
                ...formData,
                couponCode: couponCode || undefined,
            };
            await createSale(saleData);
            setToast({ message: 'Sale created successfully', type: 'success' });
            setTimeout(() => {
                navigate('/admin/sales');
            }, 1500);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Error creating sale', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

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
                        onClick={() => navigate('/admin/sales')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Create New Sale</h1>
                        <p className="text-gray-600 mt-1">Add a new sales transaction</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Customer Selection */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer (Optional)
                                </label>
                                {selectedCustomer ? (
                                    <div className="flex items-center gap-2 px-4 py-2 border border-green-300 bg-green-50 rounded-lg">
                                        <UserCheck className="w-4 h-4 text-green-600" />
                                        <span className="flex-1 text-green-800 font-medium">
                                            {selectedCustomer.firstName} {selectedCustomer.lastName}
                                        </span>
                                        <span className="text-xs text-green-600">
                                            {selectedCustomer.loyaltyPoints || 0} pts
                                        </span>
                                        <button
                                            type="button"
                                            onClick={clearCustomer}
                                            className="text-red-500 hover:text-red-700 text-sm font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative" ref={customerDropdownRef}>
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search customer..."
                                                value={customerSearch}
                                                onChange={(e) => {
                                                    setCustomerSearch(e.target.value);
                                                    setShowCustomerDropdown(true);
                                                }}
                                                onFocus={() => setShowCustomerDropdown(true)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                            />
                                        {showCustomerDropdown && (
                                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {filteredCustomers.length > 0 ? (
                                                    filteredCustomers.slice(0, 10).map(customer => (
                                                        <button
                                                            key={customer._id}
                                                            type="button"
                                                            onClick={() => selectCustomer(customer)}
                                                            className="w-full text-left px-4 py-2 hover:bg-primary-50 flex items-center justify-between"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-sm">{customer.firstName} {customer.lastName}</p>
                                                                <p className="text-xs text-gray-500">{customer.phone || customer.email}</p>
                                                            </div>
                                                            <span className="text-xs text-primary-600 font-medium">{customer.loyaltyPoints || 0} pts</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="px-4 py-3 text-sm text-gray-500">No customers found</p>
                                                )}
                                            </div>
                                        )}                                        </div>                                    </>
                                )}
                                {!selectedCustomer && (
                                    <div className="mt-1">
                                        <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">
                                            Or enter name manually *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Walk-in customer name"
                                            value={!formData.customerId ? formData.customerName : ''}
                                            onChange={(e) =>
                                                setFormData({ ...formData, customerName: e.target.value, customerId: '' })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                            required={!formData.customerId}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Coupon Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Coupon Code (Optional)
                                </label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="e.g. CPN-XXXXXX"
                                        value={couponCode}
                                        onChange={(e) => {
                                            const val = e.target.value.toUpperCase();
                                            setCouponCode(val);
                                            setFormData({ ...formData, couponCode: val });
                                        }}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono tracking-wider uppercase"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter customer's coupon code to apply discount
                                </p>
                            </div>

                            {/* Payment Method */}
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
                                                <option key={p._id} value={p._id} disabled={p.currentStock <= 0}>
                                                    {p.productName} ( Stock: {p.currentStock} )
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
                                    <div className="flex items-start gap-2">
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
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-8"
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
                                <span>LKR {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Tax (10%):</span>
                                <span>LKR {tax.toFixed(2)}</span>
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
                            onClick={() => navigate('/admin/sales')}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Sale'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSale;
