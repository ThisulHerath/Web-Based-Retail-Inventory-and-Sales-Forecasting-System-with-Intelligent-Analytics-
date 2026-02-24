import { useState } from 'react';
import { Search, CheckCircle, XCircle, Gift } from 'lucide-react';
import { validateCoupon } from '../services/couponService';
import Toast from '../components/Toast';

const ValidateCoupon = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [toast, setToast] = useState(null);

    const handleValidate = async (e) => {
        e.preventDefault();

        if (!code.trim()) {
            setToast({ message: 'Please enter a coupon code', type: 'error' });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const data = await validateCoupon(code.trim().toUpperCase());
            setResult({ valid: true, data });
        } catch (error) {
            setResult({
                valid: false,
                message: error.response?.data?.message || 'Invalid coupon code',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Validate Coupon</h1>
                <p className="text-gray-600 mt-1">Enter a customer's coupon code to verify</p>
            </div>

            <div className="max-w-lg">
                <form onSubmit={handleValidate} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                            <div className="relative">
                                <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="Enter coupon code (e.g., CPN-ABC123)"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono text-lg tracking-wider"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Validate Coupon
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Result */}
                {result && (
                    <div className={`mt-6 rounded-xl p-6 border ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start gap-4">
                            {result.valid ? (
                                <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                            ) : (
                                <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                            )}
                            <div className="flex-1">
                                <h3 className={`text-lg font-bold ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
                                    {result.valid ? 'Valid Coupon' : 'Invalid Coupon'}
                                </h3>

                                {result.valid ? (
                                    <div className="mt-3 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Code:</span>
                                            <span className="font-bold font-mono">{result.data.code}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Discount:</span>
                                            <span className="font-bold text-green-700">
                                                {result.data.discountType === 'Percentage'
                                                    ? `${result.data.discountValue}% off`
                                                    : `LKR ${result.data.discountValue} off`}
                                            </span>
                                        </div>
                                        {result.data.customer && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Customer:</span>
                                                <span className="font-bold">
                                                    {result.data.customer.firstName} {result.data.customer.lastName}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-red-600 text-sm mt-1">{result.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default ValidateCoupon;
