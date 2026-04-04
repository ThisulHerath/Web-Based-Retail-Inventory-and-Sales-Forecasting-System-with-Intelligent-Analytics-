import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Pencil, Trash2, FileText } from 'lucide-react';
import Toast from '../../components/Toast';
import {
    createInventoryReport,
    deleteInventoryReport,
    getInventoryReportById,
    getInventoryReports,
    updateInventoryReport,
} from '../../services/inventoryReportService';

const initialForm = {
    title: '',
    fromDate: '',
    toDate: '',
    notes: '',
};

const toDatetimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getNowLocal = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const validateDateRange = (fromDate, toDate) => {
    if (!fromDate || !toDate) {
        return { valid: false, message: 'Date range is required' };
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const now = new Date();

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        return { valid: false, message: 'Please provide valid dates' };
    }

    if (from > to) {
        return { valid: false, message: 'From date must be earlier than To date' };
    }

    if (from > now || to > now) {
        return { valid: false, message: 'Dates cannot be in the future' };
    }

    return { valid: true };
};

const InventoryReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const nowLocal = useMemo(() => getNowLocal(), []);

    const [viewReport, setViewReport] = useState(null);
    const [editReport, setEditReport] = useState(null);

    const canCreate = useMemo(() => {
        if (!form.title.trim()) return false;
        return validateDateRange(form.fromDate, form.toDate).valid;
    }, [form]);

    const fetchReports = async (page = currentPage) => {
        try {
            setLoading(true);
            const data = await getInventoryReports(page, 10);
            setReports(data.reports || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Failed to load reports', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [currentPage]);

    const handleCreate = async (e) => {
        e.preventDefault();
        const dateValidation = validateDateRange(form.fromDate, form.toDate);
        if (!canCreate || !dateValidation.valid) {
            setToast({ message: dateValidation.message || 'Please fill all required fields and use a valid date range', type: 'error' });
            return;
        }

        try {
            setSaving(true);
            await createInventoryReport(form);
            setToast({ message: 'Inventory report created', type: 'success' });
            setForm(initialForm);
            setCurrentPage(1);
            await fetchReports(1);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Failed to create report', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const openView = async (id) => {
        try {
            const data = await getInventoryReportById(id);
            setViewReport(data);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Failed to load report details', type: 'error' });
        }
    };

    const openEdit = (report) => {
        setEditReport({
            ...report,
            fromDate: toDatetimeLocal(report.fromDate),
            toDate: toDatetimeLocal(report.toDate),
        });
    };

    const handleUpdate = async () => {
        if (!editReport?.title?.trim() || !editReport?.fromDate || !editReport?.toDate) {
            setToast({ message: 'Title and date range are required', type: 'error' });
            return;
        }

        const dateValidation = validateDateRange(editReport.fromDate, editReport.toDate);
        if (!dateValidation.valid) {
            setToast({ message: dateValidation.message, type: 'error' });
            return;
        }

        try {
            setSaving(true);
            await updateInventoryReport(editReport._id, {
                title: editReport.title,
                fromDate: editReport.fromDate,
                toDate: editReport.toDate,
                notes: editReport.notes || '',
            });
            setToast({ message: 'Inventory report updated', type: 'success' });
            setEditReport(null);
            await fetchReports();
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Failed to update report', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm('Delete this report? This cannot be undone.');
        if (!ok) return;

        try {
            await deleteInventoryReport(id);
            setToast({ message: 'Inventory report deleted', type: 'success' });
            await fetchReports();
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Failed to delete report', type: 'error' });
        }
    };

    return (
        <div className="p-6 space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/admin/inventory" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Inventory Reports</h1>
                        <p className="text-gray-600 mt-1">Create and manage inventory action reports by date range</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Report</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] outline-none"
                            placeholder="e.g. Weekly Stock Actions"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date & Time</label>
                        <input
                            type="datetime-local"
                            value={form.fromDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, fromDate: e.target.value }))}
                            max={nowLocal}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date & Time</label>
                        <input
                            type="datetime-local"
                            value={form.toDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, toDate: e.target.value }))}
                            min={form.fromDate || undefined}
                            max={nowLocal}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] outline-none"
                            placeholder="Add context for this report"
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={!canCreate || saving}
                            className="px-5 py-2.5 bg-[#155c27] text-white rounded-lg hover:bg-[#10481f] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Creating...' : 'Create Report'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Saved Reports</h2>

                {loading ? (
                    <div className="py-10 text-center text-gray-500">Loading reports...</div>
                ) : reports.length === 0 ? (
                    <div className="py-10 text-center text-gray-500">No reports found.</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Title</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Range</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Stock In Qty</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Stock Out Qty</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-800">{report.title}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {new Date(report.fromDate).toLocaleString()} - {new Date(report.toDate).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-center font-semibold">{report.summary?.totalActions || 0}</td>
                                            <td className="py-3 px-4 text-center text-green-700 font-semibold">{report.summary?.totalStockInQty || 0}</td>
                                            <td className="py-3 px-4 text-center text-orange-700 font-semibold">{report.summary?.totalStockOutQty || 0}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{new Date(report.createdAt).toLocaleString()}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openView(report._id)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors" title="View">
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </button>
                                                    <button onClick={() => openEdit(report)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition-colors" title="Edit">
                                                        <Pencil className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(report._id)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-5">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {viewReport && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#155c27]" />
                                <h3 className="text-lg font-semibold text-gray-800">{viewReport.title}</h3>
                            </div>
                            <button onClick={() => setViewReport(null)} className="px-3 py-1.5 border rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                        <div className="p-5 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Total Actions</p>
                                    <p className="text-xl font-bold text-gray-800">{viewReport.summary?.totalActions || 0}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                    <p className="text-xs text-green-700">Stock In Qty</p>
                                    <p className="text-xl font-bold text-green-800">{viewReport.summary?.totalStockInQty || 0}</p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-3">
                                    <p className="text-xs text-orange-700">Stock Out Qty</p>
                                    <p className="text-xl font-bold text-orange-800">{viewReport.summary?.totalStockOutQty || 0}</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Range:</span> {new Date(viewReport.fromDate).toLocaleString()} - {new Date(viewReport.toDate).toLocaleString()}
                            </p>

                            {viewReport.notes ? (
                                <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{viewReport.notes}</div>
                            ) : null}

                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-2.5 px-3">Date</th>
                                            <th className="text-left py-2.5 px-3">Product</th>
                                            <th className="text-left py-2.5 px-3">SKU</th>
                                            <th className="text-left py-2.5 px-3">Type</th>
                                            <th className="text-right py-2.5 px-3">Qty</th>
                                            <th className="text-left py-2.5 px-3">User</th>
                                            <th className="text-left py-2.5 px-3">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(viewReport.transactions || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-6 text-center text-gray-500">No inventory actions in this range.</td>
                                            </tr>
                                        ) : (
                                            (viewReport.transactions || []).map((tx) => (
                                                <tr key={tx.transactionId} className="border-b border-gray-100">
                                                    <td className="py-2 px-3 text-gray-600">{new Date(tx.date || tx.createdAt).toLocaleString()}</td>
                                                    <td className="py-2 px-3 text-gray-800">{tx.productName}</td>
                                                    <td className="py-2 px-3 text-gray-500">{tx.sku || '-'}</td>
                                                    <td className="py-2 px-3 capitalize">{tx.type?.replace('-', ' ')}</td>
                                                    <td className="py-2 px-3 text-right font-semibold">{tx.quantity}</td>
                                                    <td className="py-2 px-3">{tx.createdBy}</td>
                                                    <td className="py-2 px-3 text-gray-500">{tx.notes || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editReport && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Edit Inventory Report</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                            <input
                                type="text"
                                value={editReport.title}
                                onChange={(e) => setEditReport((prev) => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={editReport.fromDate}
                                    onChange={(e) => setEditReport((prev) => ({ ...prev, fromDate: e.target.value }))}
                                    max={nowLocal}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={editReport.toDate}
                                    onChange={(e) => setEditReport((prev) => ({ ...prev, toDate: e.target.value }))}
                                    min={editReport.fromDate || undefined}
                                    max={nowLocal}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                rows={3}
                                value={editReport.notes || ''}
                                onChange={(e) => setEditReport((prev) => ({ ...prev, notes: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5d800] outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setEditReport(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button
                                onClick={handleUpdate}
                                disabled={saving}
                                className="px-4 py-2 bg-[#155c27] text-white rounded-lg hover:bg-[#10481f] disabled:opacity-50"
                            >
                                {saving ? 'Updating...' : 'Update Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryReports;
