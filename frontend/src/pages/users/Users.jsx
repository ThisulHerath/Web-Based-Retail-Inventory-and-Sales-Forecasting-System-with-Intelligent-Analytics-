import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ShieldAlert, Mail, Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getAllUsers, deleteUser, resendWelcomeEmail } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import RoleBadge from '../../components/RoleBadge';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import ActivityLogModal from './ActivityLogModal';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [joinSort, setJoinSort] = useState('newest');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResendModal, setShowResendModal] = useState(false);
    const [showActivityLogModal, setShowActivityLogModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToResend, setUserToResend] = useState(null);
    const [selectedUserForLog, setSelectedUserForLog] = useState(null);
    const [toast, setToast] = useState(null);
    const [isDeletingUser, setIsDeletingUser] = useState(false);
    const [isResendingEmail, setIsResendingEmail] = useState(false);

    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers(1, 100, roleFilter); // Fetch all for now
            setUsers(data.users);
            setLoading(false);
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to fetch users' });
            setLoading(false);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            setIsDeletingUser(true);
            await deleteUser(userToDelete._id);
            setToast({ type: 'success', message: 'User deleted successfully' });
            fetchUsers();
            setShowDeleteModal(false);
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.message || 'Failed to delete user' });
            setShowDeleteModal(false);
        } finally {
            setIsDeletingUser(false);
        }
    };

    const handleResendClick = (user) => {
        setUserToResend(user);
        setShowResendModal(true);
    };

    const handleActivityLogClick = (user) => {
        setSelectedUserForLog(user);
        setShowActivityLogModal(true);
    };

    const confirmResendWelcomeEmail = async () => {
        if (!userToResend?._id) {
            return;
        }

        try {
            setIsResendingEmail(true);
            const result = await resendWelcomeEmail(userToResend._id);
            setToast({ type: 'success', message: result?.message || 'Welcome email resent successfully' });
            setShowResendModal(false);
            setUserToResend(null);
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.message || 'Failed to resend welcome email' });
        } finally {
            setIsResendingEmail(false);
        }
    };

    const filteredUsers = users.filter((user) =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const roleDistributionData = [
        { name: 'Admins', value: users.filter((user) => user.role === 'admin').length, color: '#E4D84A' },
        { name: 'Cashiers', value: users.filter((user) => user.role === 'cashier').length, color: '#6AA5F3' },
        { name: 'Managers', value: users.filter((user) => user.role === 'manager').length, color: '#74D58D' }
    ].filter((item) => item.value > 0);

    const statusDistributionData = [
        { name: 'Active', value: users.filter((user) => user.isActive).length, color: '#59C06A' },
        { name: 'Inactive', value: users.filter((user) => !user.isActive).length, color: '#DD4B46' }
    ].filter((item) => item.value > 0);

    const displayUsers = filteredUsers
        .filter((user) => {
            if (statusFilter === 'all') {
                return true;
            }
            return statusFilter === 'active' ? user.isActive : !user.isActive;
        })
        .sort((a, b) => {
            const aDate = new Date(a.createdAt).getTime();
            const bDate = new Date(b.createdAt).getTime();
            return joinSort === 'newest' ? bDate - aDate : aDate - bDate;
        });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    <p className="text-gray-600">Manage system access and roles</p>
                </div>
                <Link
                    to="/admin/users/create"
                    className="flex items-center gap-2 bg-[#f5d800] text-[#155c27] font-weight-600 px-4 py-2 rounded-lg hover:bg-[#e6c700] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New User</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[220px] flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                        <p className="text-gray-500 font-semibold mt-2">Total Employees</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[220px] p-4">
                    <h3 className="text-center text-gray-700 font-semibold mb-2">Role Distribution</h3>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleDistributionData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={48}
                                    outerRadius={70}
                                    stroke="#ffffff"
                                    strokeWidth={4}
                                >
                                    {roleDistributionData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" iconType="square" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[220px] p-4">
                    <h3 className="text-center text-gray-700 font-semibold mb-2">User Status</h3>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistributionData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={48}
                                    outerRadius={70}
                                    stroke="#ffffff"
                                    strokeWidth={4}
                                >
                                    {statusDistributionData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" iconType="square" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[260px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5d800]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5d800]"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                </select>

                <select
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5d800]"
                    value={joinSort}
                    onChange={(e) => setJoinSort(e.target.value)}
                >
                    <option value="newest">Joined: Newest First</option>
                    <option value="oldest">Joined: Oldest First</option>
                </select>

                <select
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5d800]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Sort by Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">User</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Role</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Last Login</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Joined</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    Loading users...
                                </td>
                            </tr>
                        ) : displayUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            displayUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge isActive={user.isActive} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {user.lastLoginDate
                                            ? new Date(user.lastLoginDate).toLocaleDateString(undefined, {
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                              })
                                            : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleActivityLogClick(user)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="View Activity Log"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                            <Link
                                                to={`/admin/users/edit/${user._id}`}
                                                className="p-2 text-[#f5d800] hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            {user._id !== currentUser._id && (
                                                <button
                                                    onClick={() => handleResendClick(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Resend Welcome Email"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                            )}
                                            {user._id !== currentUser._id && (
                                                <button
                                                    onClick={() => handleDeleteClick(user)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Resend Welcome Email Confirmation Modal */}
            {showResendModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fade-in border border-gray-100">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold text-blue-600 leading-tight">Resend Welcome Email?</h2>
                            </div>
                        </div>
                        <p className="text-gray-700 text-xl font-semibold leading-snug mb-7">
                            Are you sure you want to generate a new password and resend the welcome email to {userToResend?.name}?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    if (!isResendingEmail) {
                                        setShowResendModal(false);
                                        setUserToResend(null);
                                    }
                                }}
                                disabled={isResendingEmail}
                                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmResendWelcomeEmail}
                                disabled={isResendingEmail}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isResendingEmail ? 'Resending...' : 'Resend Email'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                        <div className="flex items-center gap-4 text-red-600 mb-4">
                            <ShieldAlert className="w-8 h-8" />
                            <h2 className="text-xl font-bold">Delete User?</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeletingUser}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeletingUser}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeletingUser ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeletingUser && (
                <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl px-6 py-5 shadow-lg border border-gray-100 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-red-600"></div>
                        <p className="text-gray-800 font-medium">Deleting user...</p>
                    </div>
                </div>
            )}

            {/* Activity Log Modal */}
            {showActivityLogModal && selectedUserForLog && (
                <ActivityLogModal
                    user={selectedUserForLog}
                    onClose={() => {
                        setShowActivityLogModal(false);
                        setSelectedUserForLog(null);
                    }}
                />
            )}

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

export default Users;





