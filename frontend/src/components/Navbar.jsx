import { createPortal } from 'react-dom';
import useFocusTrap from '../hooks/useFocusTrap';
import { KeyRound, LogOut, User, Menu, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';


const Navbar = ({ mobileOpen, onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    useFocusTrap(showLogoutConfirm, '#logout-dialog', () => setShowLogoutConfirm(false), '#admin-logout-trigger');

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleChangePasswordClick = () => {
        navigate('/admin/change-password');
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
        navigate('/admin/login');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <header className="admin-topbar no-print">
            <div className="flex items-center gap-3 min-w-0">
                <button type="button" className="mobile-menu-button" id="admin-menu-trigger" onClick={onMenuClick} aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="admin-navigation"><Menu size={22} /></button>
                <div className="min-w-0"><p className="font-semibold text-slate-900 truncate">Retail workspace</p><p className="text-xs text-slate-500 hidden sm:block">7 Super City · Inventory & sales</p></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/" className="topbar-action" title="Open storefront" aria-label="Open storefront"><Store size={18} /><span className="hidden xl:inline">Storefront</span></Link>
                <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-3 min-w-0">
                    <span className="rounded-full bg-green-50 p-2 text-green-700"><User size={18} /></span>
                    <div className="max-w-[180px]"><p className="text-sm font-semibold text-slate-800 truncate">{user?.name || user?.email}</p><p className="text-xs text-slate-500 capitalize">{user?.role}</p></div>
                </div>
                <button type="button" onClick={handleChangePasswordClick} className="topbar-action" aria-label="Change password" title="Change password"><KeyRound size={18} /><span className="hidden lg:inline">Password</span></button>
                <button type="button" id="admin-logout-trigger" onClick={handleLogoutClick} className="topbar-action text-red-700" aria-label="Log out" title="Log out"><LogOut size={18} /><span className="hidden lg:inline">Log out</span></button>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div id="logout-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title" className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 animate-scale-in" onKeyDown={(e) => { if (e.key === 'Escape') cancelLogout(); }}>
                        <h2 id="logout-title" className="text-lg font-bold text-gray-800 mb-2">Confirm Logout</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to logout? You will need to login again to access the admin panel.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                                                onClick={cancelLogout}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            , document.body)}
        </header>
    );
};

export default Navbar;
