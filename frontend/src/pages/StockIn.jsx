import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { stockIn as stockInService } from '../services/stockService';
import { getProductById as fetchProduct } from '../services/productService'; // Alias to avoid confusion
import Toast from '../components/Toast';
import { ArrowUpCircle, ArrowLeft } from 'lucide-react';

const StockIn = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // productId
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (id) {
            loadProduct();
        }
    }, [id]);

    const loadProduct = async () => {
        try {
            const data = await fetchProduct(id);
            setProduct(data);
            setLoading(false);
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to load product' });
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!quantity || quantity <= 0) {
            setToast({ type: 'error', message: 'Please enter a valid quantity' });
            return;
        }

        setSubmitting(true);
        try {
            await stockInService({
                productId: id,
                quantity: Number(quantity),
                notes: notes || 'Manual Stock In',
            });
            setToast({ type: 'success', message: 'Stock added successfully' });
            setTimeout(() => {
                navigate('/admin/products');
            }, 1000);
        } catch (error) {
            setToast({
                type: 'error',
                message: error.response?.data?.message || 'Failed to add stock',
            });
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading product details...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    to="/admin/products"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Stock In</h1>
            </div>

            <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="mb-6 pb-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">{product.productName}</h2>
                    <p className="text-sm text-gray-500">Current Stock: <span className="font-bold text-gray-800">{product.currentStock}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity to Add
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-lg"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="0"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            rows="3"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Reason for stock in..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            <ArrowUpCircle className="w-5 h-5" />
                            <span>{submitting ? 'Adding...' : 'Add Stock'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default StockIn;
