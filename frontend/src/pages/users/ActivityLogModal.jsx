import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Eye, EyeOff } from 'lucide-react';
import { getAuditLogs } from '../../services/userService';

const ActivityLogModal = ({ user, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [dateRange, setDateRange] = useState({
        from: '',
        to: ''
    });
    const [expandedLogId, setExpandedLogId] = useState(null);

    const LIMIT = 20;

    useEffect(() => {
        fetchActivityLogs();
    }, [page, actionFilter, entityFilter, dateRange]);

    const fetchActivityLogs = async () => {
        try {
            setLoading(true);
            const filters = {
                userId: user.id || user._id,
                page,
                limit: LIMIT
            };

            if (actionFilter) filters.action = actionFilter;
            if (entityFilter) filters.entityType = entityFilter;
            if (dateRange.from) filters.from = dateRange.from;
            if (dateRange.to) filters.to = dateRange.to;

            const data = await getAuditLogs(page, LIMIT, filters);
            setLogs(data.logs || []);
            setTotalPages(data.totalPages || 1);
            setTotalLogs(data.total || 0);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch activity logs:', error);
            setLogs([]);
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE':
                return 'bg-green-100 text-green-800';
            case 'UPDATE':
                return 'bg-blue-100 text-blue-800';
            case 'DELETE':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(1);
    };

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'action') setActionFilter(value);
        if (filterType === 'entity') setEntityFilter(value);
        setPage(1);
    };

    const toggleExpand = (logId) => {
        setExpandedLogId(prev => prev === logId ? null : logId);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Recent actions by <strong>{user.name}</strong> ({user.email})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Action
                        </label>
                        <select
                            value={actionFilter}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5d800]"
                        >
                            <option value="">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Entity Type
                        </label>
                        <input
                            type="text"
                            value={entityFilter}
                            onChange={(e) => handleFilterChange('entity', e.target.value)}
                            placeholder="Filter by entity type..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5d800]"
                        />
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            From
                        </label>
                        <input
                            type="datetime-local"
                            name="from"
                            value={dateRange.from}
                            onChange={handleDateChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5d800]"
                        />
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            To
                        </label>
                        <input
                            type="datetime-local"
                            name="to"
                            value={dateRange.to}
                            onChange={handleDateChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5d800]"
                        />
                    </div>
                </div>

                {/* Logs Table */}
                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-[#f5d800] mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading activity logs...</p>
                            </div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-500 text-center">
                                No activity logs found for this user.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-gray-600">Action</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600">Entity Type</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600">Entity ID</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600">Date & Time</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600">Status Code</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600">IP Address</th>
                                        <th className="px-6 py-3 font-semibold text-gray-600 text-center">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {logs.map((log, index) => {
                                        const uniqueId = log.id || index;
                                        const hasDetails = log.request_body && Object.keys(log.request_body).length > 0;
                                        return (
                                        <React.Fragment key={uniqueId}>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-gray-900 font-medium">
                                                    {log.entity_type || 'N/A'}
                                                </td>
                                                <td className="px-6 py-3 text-gray-600 font-mono text-xs">
                                                    {log.entity_id ? log.entity_id.substring(0, 12) : 'N/A'}
                                                </td>
                                                <td className="px-6 py-3 text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        {formatDate(log.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-gray-600">
                                                    {log.status_code ? (
                                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                                            log.status_code < 300
                                                                ? 'bg-green-100 text-green-800'
                                                                : log.status_code < 400
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {log.status_code}
                                                        </span>
                                                    ) : 'N/A'}
                                                </td>
                                                <td className="px-6 py-3 text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        {log.ip_address || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    {hasDetails ? (
                                                        <button 
                                                            onClick={() => toggleExpand(uniqueId)}
                                                            className={`p-1.5 rounded transition-colors ${expandedLogId === uniqueId ? 'bg-[#f5d800]/20 text-[#155c27]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                                                            title={expandedLogId === uniqueId ? "Hide Details" : "View Details"}
                                                        >
                                                            {expandedLogId === uniqueId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">No Details</span>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedLogId === uniqueId && hasDetails && (
                                                <tr className="bg-gray-50 border-y border-gray-200">
                                                    <td colSpan="7" className="px-6 py-4">
                                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                                            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-gray-500" /> Data Payload Recorded
                                                            </h4>
                                                            <pre className="text-xs bg-[#f8fafc] p-4 rounded-lg border border-gray-100 overflow-x-auto text-gray-700 font-mono">
                                                                {JSON.stringify(log.request_body, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer with pagination */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {logs.length > 0 ? (page - 1) * LIMIT + 1 : 0} to {Math.min(page * LIMIT, totalLogs)} of {totalLogs} total activities
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Close Button */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#f5d800] text-[#155c27] font-semibold rounded-lg hover:bg-[#e6c700] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogModal;
