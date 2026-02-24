import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Edit } from 'lucide-react';
import { getSaleById } from '../services/salesService';

const ViewSale = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSale();
    }, [id]);

    const fetchSale = async () => {
        try {
            const data = await getSaleById(id);
            setSale(data);
        } catch (error) {
            console.error('Error fetching sale:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!sale) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Sale not found</p>
                <button
                    onClick={() => navigate('/admin/sales')}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    Back to Sales
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/sales')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Invoice Details</h1>
                        <p className="text-gray-600 mt-1">{sale.invoiceNumber}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        to={`/admin/sales/edit/${sale._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Link>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 print-area">
                {/* Invoice Header */}
                <div className="border-b-2 border-gray-300 pb-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-primary-600 mb-2">
                                7 Super City
                            </h1>
                            <p className="text-gray-600">Retail Management System</p>
                            <p className="text-gray-600">123 Main Street, City, State 12345</p>
                            <p className="text-gray-600">Phone: +91 1234567890</p>
                            <p className="text-gray-600">Email: info@7supercity.com</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">INVOICE</h2>
                            <p className="text-gray-600">
                                <strong>Invoice #:</strong> {sale.invoiceNumber}
                            </p>
                            <p className="text-gray-600">
                                <strong>Date:</strong>{' '}
                                {new Date(sale.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Bill To:</h3>
                    <p className="text-gray-700 font-medium">{sale.customerName}</p>
                    <p className="text-gray-600">
                        Payment Method:{' '}
                        <span className="font-medium">{sale.paymentMethod}</span>
                    </p>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                                <th className="text-left py-3 px-4 font-bold text-gray-800">
                                    #
                                </th>
                                <th className="text-left py-3 px-4 font-bold text-gray-800">
                                    Product Name
                                </th>
                                <th className="text-right py-3 px-4 font-bold text-gray-800">
                                    Quantity
                                </th>
                                <th className="text-right py-3 px-4 font-bold text-gray-800">
                                    Unit Price
                                </th>
                                <th className="text-right py-3 px-4 font-bold text-gray-800">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                                    <td className="py-3 px-4 text-gray-700">{item.productName}</td>
                                    <td className="py-3 px-4 text-right text-gray-700">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-700">
                                        LKR {item.unitPrice.toFixed(2)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold text-gray-800">
                                        LKR {item.total.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-700">Subtotal:</span>
                            <span className="font-semibold text-gray-800">
                                LKR {sale.subtotal.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-700">Tax (10%):</span>
                            <span className="font-semibold text-gray-800">
                                LKR {sale.tax.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between py-3 border-t-2 border-gray-300 mt-2">
                            <span className="text-xl font-bold text-gray-800">Grand Total:</span>
                            <span className="text-xl font-bold text-primary-600">
                                LKR {sale.grandTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-600">
                    <p className="font-medium">Thank you for your business!</p>
                    <p className="text-sm mt-2">
                        For any queries, please contact us at info@7supercity.com
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ViewSale;
