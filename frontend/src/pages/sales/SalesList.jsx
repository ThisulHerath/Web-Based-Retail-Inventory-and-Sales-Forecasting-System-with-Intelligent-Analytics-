import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, Calendar, BarChart2, X, TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';
import { getAllSales, deleteSale, getSalesAnalytics } from '../../services/salesService';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import {
    PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const INVOICE_SEARCH_PATTERN = /^$|^I?$|^IN?$|^INV?$|^INV-?$|^INV-\d{0,6}$/;

const SalesList = () => {
    const { isAdmin } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateError, setDateError] = useState('');
    const [searchError, setSearchError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [isDeletingSale, setIsDeletingSale] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const latestFetchIdRef = useRef(0);
    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        const invoiceError = validateInvoiceSearch(search);
        const validationError = validateDateRange(startDate, endDate);
        setSearchError(invoiceError);
        setDateError(validationError);

        if (invoiceError || validationError) {
            setSales([]);
            setTotalPages(1);
            setLoading(false);
            return;
        }

        fetchSales();
    }, [currentPage, search, startDate, endDate]);

    const validateDateRange = (start, end) => {
        if (!start && !end) return '';

        if (start && start > today) {
            return 'Start date cannot be in the future.';
        }

        if (end && end > today) {
            return 'End date cannot be in the future.';
        }

        if (start && end && start > end) {
            return 'Start date must be earlier than or equal to end date.';
        }

        return '';
    };

    const validateInvoiceSearch = (value) => {
        if (!value) return '';
        if (!INVOICE_SEARCH_PATTERN.test(value)) {
            return 'Use invoice format INV-000001 (INV- followed by up to 6 digits).';
        }
        return '';
    };

    const fetchSales = async () => {
        const fetchId = ++latestFetchIdRef.current;

        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                search: search.trim(),
                startDate,
                endDate,
            };
            const data = await getAllSales(params);
            if (fetchId !== latestFetchIdRef.current) return;
            setSales(data.sales);
            setTotalPages(data.totalPages);
        } catch (error) {
            if (fetchId !== latestFetchIdRef.current) return;
            setToast({ message: 'Error fetching sales', type: 'error' });
        } finally {
            if (fetchId === latestFetchIdRef.current) {
                setLoading(false);
            }
        }
    };

    const loadAnalytics = async () => {
        if (analyticsData) return;
        try {
            setAnalyticsLoading(true);
            const data = await getSalesAnalytics();
            setAnalyticsData(data);
        } catch {
            setToast({ message: 'Error loading analytics', type: 'error' });
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleToggleAnalytics = () => {
        const next = !showAnalytics;
        setShowAnalytics(next);
        if (next) loadAnalytics();
    };

    const last7Days = useMemo(() => {
        if (!analyticsData?.dailyRevenue) return [];
        return analyticsData.dailyRevenue.slice(-7).map(d => ({
            ...d,
            label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
    }, [analyticsData]);

    const summary = analyticsData?.summary || {};
    const profitMargin = summary.totalRevenue > 0
        ? ((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1)
        : '0.0';

    const customPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
                {(percent * 100).toFixed(0)}%
            </text>
        );
    };

    const handleDelete = async (id) => {
        try {
            setIsDeletingSale(true);
            await deleteSale(id);
            setToast({ message: 'Sale deleted successfully', type: 'success' });
            setDeleteModal(null);
            fetchSales();
            setAnalyticsData(null); // invalidate analytics cache
        } catch (error) {
            setToast({ message: 'Error deleting sale', type: 'error' });
        } finally {
            setIsDeletingSale(false);
        }
    };

    const handleSearch = (e) => {
        const normalizedValue = e.target.value.toUpperCase().replace(/\s+/g, '');
        setSearch(normalizedValue);
        setSearchError(validateInvoiceSearch(normalizedValue));
        setCurrentPage(1);
    };

    return (
        <div className="p-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete invoice{' '}
                            <strong>{deleteModal.invoiceNumber}</strong>? This action cannot be
                            undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal(null)}
                                disabled={isDeletingSale}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteModal._id)}
                                disabled={isDeletingSale}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeletingSale ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeletingSale && (
                <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl px-6 py-5 shadow-lg border border-gray-100 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-red-600"></div>
                        <p className="text-gray-800 font-medium">Deleting sale...</p>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Sales Management</h1>
                        <p className="text-gray-600 mt-1">Manage all sales transactions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleToggleAnalytics}
                            className="flex items-center gap-2 px-4 py-2 bg-[#f5d800] text-[#155c27] font-weight-600 rounded-lg hover:bg-[#e6c700] transition-colors shadow-lg"
                        >
                            <BarChart2 className="w-5 h-5" />
                            <span className='font-medium'>Analytics</span>
                        </button>
                        <Link
                            to="/admin/sales/create"
                            className="flex items-center gap-2 px-4 py-2 bg-[#f5d800] text-[#155c27] font-weight-600 rounded-lg hover:bg-[#e6c700] transition-colors shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">New Sale</span>
                        </Link>
                    </div>
                </div>

                {/* â”€â”€ Analytics Panel â”€â”€ */}
                {showAnalytics && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-[#f5d800]" />
                                Sales Analytics
                            </h2>
                            <button
                                onClick={() => setShowAnalytics(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {analyticsLoading ? (
                            <div className="flex items-center justify-center h-48">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : analyticsData ? (
                            <div className="space-y-6">
                                {/* Stat Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                <ShoppingCart className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Sales</p>
                                                <p className="text-2xl font-bold text-gray-800">{summary.totalSalesCount || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <DollarSign className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Revenue</p>
                                                <p className="text-lg font-bold text-gray-800">
                                                    LKR {(summary.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Profit</p>
                                                <p className="text-lg font-bold text-gray-800">
                                                    LKR {(summary.totalProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <Package className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Profit Margin</p>
                                                <p className="text-2xl font-bold text-gray-800">{profitMargin}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Pie Chart â€” Payment Methods */}
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <h3 className="text-base font-semibold text-gray-700 mb-4">Payment Method Breakdown</h3>
                                        {analyticsData.paymentBreakdown.length > 0 ? (
                                            <>
                                                <ResponsiveContainer width="100%" height={240}>
                                                    <PieChart>
                                                        <Pie
                                                            data={analyticsData.paymentBreakdown}
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={90}
                                                            dataKey="count"
                                                            labelLine={false}
                                                            label={customPieLabel}
                                                        >
                                                            {analyticsData.paymentBreakdown.map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <ReTooltip
                                                            formatter={(value, name, props) => [
                                                                `${value} sales â€” LKR ${props.payload.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                                                props.payload.name,
                                                            ]}
                                                        />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="flex justify-center gap-6 mt-1">
                                                    {analyticsData.paymentBreakdown.map((p, i) => (
                                                        <div key={p.name} className="text-center">
                                                            <div className="text-sm font-semibold" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{p.name}</div>
                                                            <div className="text-xs text-gray-500">{p.count} sales</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-400 text-center py-16">No data available</p>
                                        )}
                                    </div>

                                    {/* Bar Chart â€” Last 7 Days Revenue */}
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <h3 className="text-base font-semibold text-gray-700 mb-4">Revenue of Last 7 Days</h3>
                                        {last7Days.some(d => d.revenue > 0) ? (
                                            <ResponsiveContainer width="100%" height={260}>
                                                <BarChart data={last7Days} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                                    <YAxis
                                                        tick={{ fontSize: 11, fill: '#6b7280' }}
                                                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                                    />
                                                    <ReTooltip
                                                        formatter={(value) => [`LKR ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Revenue']}
                                                        labelStyle={{ fontWeight: 'bold' }}
                                                    />
                                                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <p className="text-gray-400 text-center py-16">No sales in last 7 days</p>
                                        )}
                                    </div>
                                </div>

                                {/* Top Products */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-base font-semibold text-gray-700 mb-4">Top 5 Products by Revenue</h3>
                                    {analyticsData.topProducts.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                                                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty Sold</th>
                                                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
                                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Share</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {analyticsData.topProducts.map((p, i) => {
                                                        const maxRev = analyticsData.topProducts[0].revenue;
                                                        const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0;
                                                        return (
                                                            <tr key={p.name} className="border-b border-gray-100 hover:bg-white transition-colors">
                                                                <td className="py-2 px-3 text-sm font-bold" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>#{i + 1}</td>
                                                                <td className="py-2 px-3 text-sm font-medium text-gray-800">{p.name}</td>
                                                                <td className="py-2 px-3 text-sm text-right text-gray-600">{p.quantity}</td>
                                                                <td className="py-2 px-3 text-sm text-right font-semibold text-gray-800">
                                                                    LKR {p.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </td>
                                                                <td className="py-2 px-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-16">
                                                                            <div
                                                                                className="h-2 rounded-full"
                                                                                style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs text-gray-500 w-8 text-right">{pct.toFixed(0)}%</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-center py-8">No product data available</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-16">Failed to load analytics data</p>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-start">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Search Invoice</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="INV-000001"
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none ${searchError ? 'border-red-300' : 'border-gray-300'}`}
                                />
                            </div>
                            {searchError && (
                                <p className="mt-1 text-xs text-red-600">{searchError}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    max={endDate || today}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    min={startDate || undefined}
                                    max={today}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {dateError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                            {dateError}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : sales.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No sales found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Invoice #
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Customer
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Items
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Total
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Payment
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Date
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.map((sale) => (
                                            <tr
                                                key={sale._id}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-3 px-4 font-bold  text-[#026b43]">
                                                    {sale.invoiceNumber}
                                                </td>
                                                <td className="py-3 px-4">{sale.customerName}</td>
                                                <td className="py-3 px-4">{sale.items.length}</td>
                                                <td className="py-3 px-4 font-semibold">
                                                    LKR {sale.grandTotal.toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${sale.paymentMethod === 'Cash'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-[#f5d800]/25 text-[#155c27] border border-[#f5d800]/50'
                                                            }`}
                                                    >
                                                        {sale.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {new Date(sale.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            to={`/admin/sales/${sale._id}`}
                                                            className="p-2 text-[#f5d800] hover:bg-[#1a6e30]/30 rounded-lg transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        {isAdmin() && (
                                                            <button
                                                                onClick={() => setDeleteModal(sale)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                                        }
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesList;






