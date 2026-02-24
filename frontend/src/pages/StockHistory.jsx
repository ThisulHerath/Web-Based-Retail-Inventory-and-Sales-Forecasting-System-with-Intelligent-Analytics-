import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStockHistory } from '../services/stockService';
import { getProductById } from '../services/productService';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const StockHistory = () => {
    const { id } = useParams(); // productId
    const [transactions, setTransactions] = useState([]);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productData, historyData] = await Promise.all([
                    getProductById(id),
                    getStockHistory(id)
                ]);
                setProduct(productData);
                setTransactions(historyData.transactions);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch data', error);
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return <div className="p-6 text-center">Loading history...</div>;
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Stock History</h1>
                    {product && <p className="text-gray-600">for {product.productName}</p>}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Date/Time</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-center">Quantity</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">User</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No history found for this product.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {tx.type === 'stock-in' ? (
                                                <ArrowUpCircle className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <ArrowDownCircle className="w-4 h-4 text-orange-600" />
                                            )}
                                            <span className={`capitalize font-medium ${tx.type === 'stock-in' ? 'text-green-700' : 'text-orange-700'
                                                }`}>
                                                {tx.type.replace('-', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-800">
                                        {tx.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {tx.createdBy?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {tx.notes}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockHistory;
