import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Search, Tag, UserCheck } from 'lucide-react';
import { createSale } from '../../services/salesService';
import { getAllProducts } from '../../services/productService';
import { getAllCustomers } from '../../services/customerService';
import { getAllWalkInCustomers, createWalkInCustomer } from '../../services/walkInCustomerService';
import { validateCoupon } from '../../services/couponService';
import Toast from '../../components/Toast';

const CreateSale = () => {
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [itemErrors, setItemErrors] = useState([{}]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [walkInCustomers, setWalkInCustomers] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedWalkInCustomer, setSelectedWalkInCustomer] = useState(null);
    const [walkInDraft, setWalkInDraft] = useState({ fullName: '', phone: '', email: '' });
    const [redeemPoints, setRedeemPoints] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [couponDetails, setCouponDetails] = useState(null);
    const [couponValidationLoading, setCouponValidationLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmPayload, setConfirmPayload] = useState(null);
    const customerDropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        customerName: '',
        customerId: '',
        walkInCustomerId: '',
        loyaltyPointsToRedeem: 0,
        couponCode: '',
        paymentMethod: 'Cash',
        items: [{ productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0, maxStock: 0 }],
    });

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
                setShowCustomerDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCustomers();
        fetchWalkInCustomers();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getAllProducts(1, 1000);
            setProducts(data.products || []);
        } catch (error) {
            setToast({ message: 'Failed to load products', type: 'error' });
        }
    };

    const fetchCustomers = async () => {
        try {
            // Pull a large page so cashiers can reliably select registered customers.
            const data = await getAllCustomers(1, 1000, '');
            setCustomers(data.customers || data || []);
        } catch (error) {
            console.error('Failed to load customers:', error);
        }
    };

    const fetchWalkInCustomers = async () => {
        try {
            const data = await getAllWalkInCustomers(1, 1000, '');
            setWalkInCustomers(data.customers || []);
        } catch (error) {
            console.error('Failed to load walk-in customers:', error);
        }
    };

    const filteredCustomers = customers.filter((c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone?.includes(customerSearch)
    );

    const selectCustomer = (customer) => {
        const customerId = customer._id || customer.id;
        setSelectedCustomer(customer);
        setFormData((prev) => ({
            ...prev,
            customerId,
            walkInCustomerId: '',
            customerName: `${customer.firstName} ${customer.lastName}`,
        }));
        setSelectedWalkInCustomer(null);
        setRedeemPoints(0);
        setCustomerSearch('');
        setShowCustomerDropdown(false);
        setCouponDetails(null);
    };

    const clearCustomer = () => {
        setSelectedCustomer(null);
        setSelectedWalkInCustomer(null);
        setCouponCode('');
        setCouponDetails(null);
        setRedeemPoints(0);
        setFormData((prev) => ({ ...prev, customerId: '', walkInCustomerId: '', customerName: '', couponCode: '', loyaltyPointsToRedeem: 0 }));
    };

    const selectWalkInCustomer = (customer) => {
        const id = customer._id || customer.id;
        setSelectedWalkInCustomer(customer);
        setSelectedCustomer(null);
        setFormData((prev) => ({
            ...prev,
            customerId: '',
            walkInCustomerId: id,
            customerName: customer.fullName,
        }));
        setCouponCode('');
        setCouponDetails(null);
        setRedeemPoints(0);
    };

    const handleCreateWalkIn = async () => {
        if (!walkInDraft.fullName.trim() || !walkInDraft.phone.trim()) {
            setToast({ message: 'Walk-in full name and phone are required', type: 'error' });
            return;
        }

        // Optional email validation
        const trimmedEmail = walkInDraft.email?.trim();
        if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setToast({ message: 'Invalid email address format for walk-in customer', type: 'error' });
            return;
        }

        // Sri Lankan phone validation
        const phoneRegex = /^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/;
        const cleanedPhone = walkInDraft.phone.replace(/[\s\-()]/g, '');
        if (/[A-Za-z]/.test(cleanedPhone)) {
            setToast({
                message: 'Phone field accepts numbers only. Enter full name in the first field (e.g., Saman Perera).',
                type: 'error',
            });
            return;
        }
        if (!phoneRegex.test(cleanedPhone)) {
            setToast({ message: 'Invalid phone number. Use Sri Lankan format (e.g., 07X XXXXXXX or +94XXXXXXXXX)', type: 'error' });
            return;
        }

        try {
            const created = await createWalkInCustomer({
                fullName: walkInDraft.fullName.trim(),
                phone: walkInDraft.phone.trim(),
                email: trimmedEmail || undefined,
            });
            setWalkInCustomers((prev) => [created, ...prev]);
            setWalkInDraft({ fullName: '', phone: '', email: '' });
            selectWalkInCustomer(created);
            setToast({ message: 'Walk-in customer created', type: 'success' });
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Failed to create walk-in customer', type: 'error' });
        }
    };

    const handleValidateCoupon = async () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) {
            setCouponDetails(null);
            return;
        }

        try {
            setCouponValidationLoading(true);
            const data = await validateCoupon(code);

            if (selectedCustomer && data.customer?._id) {
                const selectedId = selectedCustomer._id || selectedCustomer.id;
                if (data.customer._id !== selectedId) {
                    setCouponDetails(null);
                    setToast({ message: 'This coupon belongs to a different customer', type: 'error' });
                    return;
                }
            }

            setCouponDetails(data);
            setToast({ message: 'Coupon validated successfully', type: 'success' });
        } catch (error) {
            setCouponDetails(null);
            setToast({ message: error.response?.data?.message || 'Invalid coupon code', type: 'error' });
        } finally {
            setCouponValidationLoading(false);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];

        if (field === 'productId') {
            const product = products.find((p) => (p._id || p.id) === value);
            if (product) {
                const displayedStock = product.displayedStock ?? product.currentStock ?? 0;
                newItems[index].productId = product._id || product.id;
                newItems[index].productName = product.productName;
                newItems[index].unitPrice = Number(product.sellingPrice) || 0;
                newItems[index].maxStock = displayedStock;
                newItems[index].quantity = 1;
                newItems[index].total = Number(product.sellingPrice) || 0;
            } else {
                newItems[index] = { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0, maxStock: 0 };
            }
        } else {
            newItems[index][field] = value;
        }

        if (field === 'quantity' || field === 'productId') {
            const quantity = Number(newItems[index].quantity) || 0;
            const unitPrice = Number(newItems[index].unitPrice) || 0;
            newItems[index].total = quantity * unitPrice;
        }

        setFormData((prev) => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0, maxStock: 0 }],
        }));
        setItemErrors((prev) => [...prev, {}]);
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData((prev) => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index),
            }));
            setItemErrors((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

        let discount = 0;
        if (couponDetails) {
            if (couponDetails.discountType === 'Percentage') {
                discount = subtotal * ((Number(couponDetails.discountValue) || 0) / 100);
            } else {
                discount = Number(couponDetails.discountValue) || 0;
            }
            discount = Math.min(discount, subtotal);
        }

        const discountedSubtotal = subtotal - discount;
        
        // Calculate loyalty points discount
        const redeemRequested = Number(redeemPoints || 0);
        const loyaltyDiscount = Math.min(redeemRequested, discountedSubtotal);
        const finalDiscountedSubtotal = discountedSubtotal - loyaltyDiscount;
        
        const tax = finalDiscountedSubtotal * 0.1;
        const grandTotal = finalDiscountedSubtotal + tax;
        return { subtotal, discount, discountedSubtotal, loyaltyDiscount, finalDiscountedSubtotal, tax, grandTotal };
    };

    const validateBeforeSubmit = () => {
        // Validate customer name
        const fErrors = {};
        if (!formData.customerId && !formData.customerName.trim()) {
            fErrors.customerName = 'Please enter a customer name or select a customer';
        }

        // Validate items
        const iErrors = formData.items.map((item) => {
            const err = {};
            if (!item.productId) err.productId = 'Select a product';
            if (!item.productId) return err;
            if (Number(item.quantity) <= 0) err.quantity = 'Quantity must be at least 1';
            else if (Number(item.quantity) > Number(item.maxStock)) err.quantity = `Max available: ${item.maxStock}`;
            return err;
        });

        const hasItemErrors = iErrors.some((e) => Object.keys(e).length > 0);
        if (Object.keys(fErrors).length > 0 || hasItemErrors) {
            setFieldErrors(fErrors);
            setItemErrors(iErrors);
            return null;
        }

        const summaryItems = formData.items
            .filter((item) => item.productId)
            .map((item) => {
                const fallbackProduct = products.find((p) => String(p._id || p.id) === String(item.productId));
                return {
                    productName: item.productName || fallbackProduct?.productName || 'Product',
                    quantity: Number(item.quantity) || 0,
                    unitPrice: Number(item.unitPrice) || 0,
                    total: Number(item.total) || 0,
                };
            });

        const saleData = {
            ...formData,
            couponCode: couponCode.trim() || undefined,
            loyaltyPointsToRedeem: Number(redeemPoints || 0),
        };

        return {
            saleData,
            summary: {
                customerName: formData.customerName || selectedCustomer?.firstName || selectedWalkInCustomer?.fullName || 'Walk-in customer',
                paymentMethod: formData.paymentMethod,
                couponCode: couponCode.trim(),
                items: summaryItems,
                subtotal,
                discount,
                loyaltyDiscount,
                tax,
                grandTotal,
            },
        };
    };

    const handleConfirmCreate = async () => {
        if (!confirmPayload?.saleData) {
            return;
        }
        setLoading(true);
        try {
            await createSale(confirmPayload.saleData);
            setToast({ message: 'Sale created successfully', type: 'success' });
            setShowConfirmModal(false);
            setConfirmPayload(null);
            setTimeout(() => navigate('/admin/sales'), 1500);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Error creating sale', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = validateBeforeSubmit();
        if (!payload) {
            return;
        }
        setConfirmPayload(payload);
        setShowConfirmModal(true);
    };

    const { subtotal, discount, discountedSubtotal, loyaltyDiscount, finalDiscountedSubtotal, tax, grandTotal } = calculateTotals();
    const hasCustomerSelection = Boolean(formData.customerId || formData.walkInCustomerId || formData.customerName.trim());
    const hasSelectedItems = formData.items.some((item) => item.productId);
    const currentStep = !hasCustomerSelection ? 1 : !hasSelectedItems ? 2 : 3;
    const stepItems = [
        { id: 1, label: 'Customer Info' },
        { id: 2, label: 'Add Items' },
        { id: 3, label: 'Review & Confirm' },
    ];

    const getStepStyles = (stepId) => {
        if (stepId < currentStep) {
            return {
                bubble: 'bg-[#f5d800] border-[#f5d800] text-[#155c27]',
                text: 'text-[#155c27]',
                bar: 'bg-[#f5d800]',
            };
        }
        if (stepId === currentStep) {
            return {
                bubble: 'bg-[#f5d800] border-[#f5d800] text-[#155c27]',
                text: 'text-[#155c27]',
                bar: 'bg-[#f5d800]/70',
            };
        }
        return {
            bubble: 'bg-white border-gray-300 text-gray-500',
            text: 'text-gray-400',
            bar: 'bg-gray-200',
        };
    };

    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {showConfirmModal && confirmPayload && (
                <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-[#155c27]/5">
                            <h3 className="text-lg font-bold text-gray-800">Confirm Sale Details</h3>
                            <p className="text-sm text-gray-600">Review this sale before continuing.</p>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                                    <p className="font-semibold text-gray-800">{confirmPayload.summary.customerName}</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Payment</p>
                                    <p className="font-semibold text-gray-800">{confirmPayload.summary.paymentMethod}</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Coupon</p>
                                    <p className="font-semibold text-gray-800">{confirmPayload.summary.couponCode || 'None'}</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-100">
                                <table className="w-full min-w-[650px]">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em] font-bold text-gray-500">Product</th>
                                            <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.08em] font-bold text-gray-500">Qty</th>
                                            <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.08em] font-bold text-gray-500">Unit Price</th>
                                            <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.08em] font-bold text-gray-500">Line Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {confirmPayload.summary.items.map((item, index) => (
                                            <tr key={`${item.productName}-${index}`}>
                                                <td className="px-4 py-3 text-sm text-gray-800">{item.productName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 text-right">LKR {item.unitPrice.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">LKR {item.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span>LKR {confirmPayload.summary.subtotal.toFixed(2)}</span>
                                </div>
                                {confirmPayload.summary.discount > 0 && (
                                    <div className="flex justify-between text-green-700">
                                        <span>Coupon Discount</span>
                                        <span>- LKR {confirmPayload.summary.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                {confirmPayload.summary.loyaltyDiscount > 0 && (
                                    <div className="flex justify-between text-green-700">
                                        <span>Loyalty Discount</span>
                                        <span>- LKR {confirmPayload.summary.loyaltyDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-700">
                                    <span>Tax (10%)</span>
                                    <span>LKR {confirmPayload.summary.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 pt-2">
                                    <span>Grand Total</span>
                                    <span>LKR {confirmPayload.summary.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!loading) {
                                        setShowConfirmModal(false);
                                    }
                                }}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmCreate}
                                disabled={loading}
                                className="px-4 py-2 bg-[#f5d800] text-[#155c27] font-semibold rounded-lg hover:bg-[#e6c700] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
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

                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                    <div className="flex items-center gap-3">
                        {stepItems.map((step, index) => {
                            const styles = getStepStyles(step.id);
                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-full border text-xs font-semibold flex items-center justify-center ${styles.bubble}`}>
                                            {step.id}
                                        </div>
                                        <span className={`text-sm font-semibold ${styles.text}`}>{step.label}</span>
                                    </div>
                                    {index < stepItems.length - 1 && <div className={`h-1 rounded-full mx-3 flex-1 ${styles.bar}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-[#155c27]/5 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#155c27]" />
                            <h2 className="text-sm uppercase tracking-[0.08em] font-bold text-gray-700">Customer Information</h2>
                        </div>
                        <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            x
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
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none"
                                            />
                                            {showCustomerDropdown && (
                                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                    {filteredCustomers.length > 0 ? (
                                                        filteredCustomers.slice(0, 10).map((customer) => (
                                                            <button
                                                                key={customer._id || customer.id}
                                                                type="button"
                                                                onClick={() => selectCustomer(customer)}
                                                                className="w-full text-left px-4 py-2 hover:bg-[#e8f3e6] flex items-center justify-between"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-sm">
                                                                        {customer.firstName} {customer.lastName}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {customer.phone || customer.email}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs text-[#f5d800] font-medium">
                                                                    {customer.loyaltyPoints || 0} pts
                                                                </span>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <p className="px-4 py-3 text-sm text-gray-500">No customers found</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
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
                                            onChange={(e) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    customerName: e.target.value,
                                                    customerId: '',
                                                }));
                                                if (fieldErrors.customerName) setFieldErrors(prev => ({ ...prev, customerName: '' }));
                                            }}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none ${fieldErrors.customerName ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {fieldErrors.customerName && <p className="mt-1 text-xs text-red-500">{fieldErrors.customerName}</p>}
                                    </div>
                                )}

                                {!selectedCustomer && !selectedWalkInCustomer && (
                                    <div className="mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
                                        <p className="text-xs font-semibold text-gray-700">Create / Select Walk-in Customer</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            <select
                                                onChange={(e) => {
                                                    const picked = walkInCustomers.find((w) => String(w.id || w._id) === e.target.value);
                                                    if (picked) selectWalkInCustomer(picked);
                                                }}
                                                defaultValue=""
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            >
                                                <option value="">Select existing walk-in customer</option>
                                                {walkInCustomers.slice(0, 100).map((w) => (
                                                    <option key={w.id || w._id} value={String(w.id || w._id)}>
                                                        {w.fullName} - {w.phone} ({w.loyaltyPoints || 0} pts)
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Full name (e.g., Saman Perera)"
                                                value={walkInDraft.fullName}
                                                onChange={(e) => setWalkInDraft((prev) => ({ ...prev, fullName: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Phone (e.g., 0771234567 or +94771234567)"
                                                value={walkInDraft.phone}
                                                onChange={(e) => setWalkInDraft((prev) => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email (optional, e.g., saman@mail.com)"
                                                value={walkInDraft.email}
                                                onChange={(e) => setWalkInDraft((prev) => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCreateWalkIn}
                                                className="px-3 py-2 text-sm font-semibold bg-[#155c27] text-white rounded-lg hover:bg-green-800"
                                            >
                                                Save Walk-in Customer
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedWalkInCustomer && (
                                    <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                                        <span className="text-sm text-blue-800">
                                            Walk-in: {selectedWalkInCustomer.fullName} ({selectedWalkInCustomer.phone})
                                        </span>
                                        <span className="text-xs font-semibold text-blue-700">
                                            {selectedWalkInCustomer.loyaltyPoints || 0} pts
                                        </span>
                                    </div>
                                )}
                            </div>

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
                                            setCouponDetails(null);
                                            setFormData((prev) => ({ ...prev, couponCode: val }));
                                        }}
                                        onBlur={handleValidateCoupon}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none font-mono tracking-wider uppercase"
                                    />
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleValidateCoupon}
                                        disabled={couponValidationLoading || !couponCode.trim()}
                                        className="px-3 py-1.5 text-xs font-semibold bg-[#d4e8d0] text-[#155c27] rounded-lg hover:bg-primary-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {couponValidationLoading ? 'Validating...' : 'Validate Coupon'}
                                    </button>
                                    {couponDetails && (
                                        <span className="text-xs text-green-700 font-medium">
                                            Applied: {couponDetails.discountType === 'Percentage'
                                                ? `${couponDetails.discountValue}%`
                                                : `LKR ${Number(couponDetails.discountValue || 0).toFixed(2)}`}
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 mt-1">
                                    Enter customer's coupon code to apply discount
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method *
                                </label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                </select>

                                <label className="block text-sm font-medium text-gray-700 mt-3 mb-2">
                                    Redeem Loyalty Points
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={redeemPoints}
                                    onChange={(e) => {
                                        const val = Number(e.target.value || 0);
                                        setRedeemPoints(val);
                                        setFormData((prev) => ({ ...prev, loyaltyPointsToRedeem: val }));
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Available points: {selectedCustomer?.loyaltyPoints || selectedWalkInCustomer?.loyaltyPoints || 0}
                                </p>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-[#155c27]/5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#155c27]" />
                                <h2 className="text-sm uppercase tracking-[0.08em] font-bold text-gray-700">Items</h2>
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto rounded-lg border border-gray-100">
                                <table className="w-full min-w-[900px]">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em] font-bold text-gray-500">Product</th>
                                            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em] font-bold text-gray-500">Quantity</th>
                                            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em] font-bold text-gray-500">Unit Price</th>
                                            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em] font-bold text-gray-500">Total</th>
                                            <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.08em] font-bold text-gray-500">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {formData.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="px-4 py-3 align-top">
                                                    <select
                                                        value={item.productId}
                                                        onChange={(e) => {
                                                            handleItemChange(index, 'productId', e.target.value);
                                                            if (itemErrors[index]?.productId) {
                                                                const newIE = [...itemErrors];
                                                                newIE[index] = { ...newIE[index], productId: '' };
                                                                setItemErrors(newIE);
                                                            }
                                                        }}
                                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none text-sm ${itemErrors[index]?.productId ? 'border-red-500' : 'border-gray-300'}`}
                                                    >
                                                        <option value="">Select Product</option>
                                                        {products.map((p) => (
                                                            <option
                                                                key={p._id || p.id}
                                                                value={p._id || p.id}
                                                                disabled={(p.displayedStock ?? p.currentStock ?? 0) <= 0}
                                                            >
                                                                {p.productName} (Displayed: {p.displayedStock ?? p.currentStock ?? 0})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {itemErrors[index]?.productId && <p className="mt-1 text-xs text-red-500">{itemErrors[index].productId}</p>}
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.productId && Number(item.maxStock) > 0 ? item.maxStock : undefined}
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            handleItemChange(index, 'quantity', e.target.value);
                                                            if (itemErrors[index]?.quantity) {
                                                                const newIE = [...itemErrors];
                                                                newIE[index] = { ...newIE[index], quantity: '' };
                                                                setItemErrors(newIE);
                                                            }
                                                        }}
                                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none text-sm ${itemErrors[index]?.quantity || Number(item.quantity) > Number(item.maxStock) ? 'border-red-500' : 'border-gray-300'}`}
                                                    />
                                                    {itemErrors[index]?.quantity
                                                        ? <p className="text-xs mt-1 text-red-500">{itemErrors[index].quantity}</p>
                                                        : item.productId && (
                                                            <p className={`text-xs mt-1 ${Number(item.quantity) > Number(item.maxStock) ? 'text-red-500' : 'text-gray-500'}`}>
                                                                Max: {item.maxStock}
                                                            </p>
                                                        )
                                                    }
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        readOnly
                                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <input
                                                        type="text"
                                                        value={`LKR ${(Number(item.total) || 0).toFixed(2)}`}
                                                        readOnly
                                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 align-top text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        disabled={formData.items.length === 1}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-[#155c27]/5 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#155c27]" />
                            <h2 className="text-sm uppercase tracking-[0.08em] font-bold text-gray-700">Order Summary</h2>
                        </div>
                        <div className="p-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-700">
                                <span>Subtotal:</span>
                                <span>LKR {subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <>
                                    <div className="flex justify-between text-green-700">
                                        <span>Coupon Discount:</span>
                                        <span>- LKR {discount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Discounted Subtotal:</span>
                                        <span>LKR {discountedSubtotal.toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                            {loyaltyDiscount > 0 && (
                                <div className="flex justify-between text-green-700 font-medium">
                                    <span>Loyalty Discount:</span>
                                    <span>- LKR {loyaltyDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-700">
                                <span>Tax (10%):</span>
                                <span>LKR {tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t-2 border-gray-300">
                                <span>Grand Total:</span>
                                <span>LKR {grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/sales')}
                            className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-[#f5d800] text-[#155c27] rounded-lg hover:bg-[#e6c700] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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






