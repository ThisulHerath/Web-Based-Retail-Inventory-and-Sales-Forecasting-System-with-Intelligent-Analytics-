import { LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import BrandLogo from './BrandLogo';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
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
        <div className="bg-gradient-to-r from-[#155c27] via-[#1a6e30] to-[#155c27] shadow-lg px-6 py-4 border-b-4 border-[#f5d800]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                        <BrandLogo className="h-10 w-auto" />
                    </div>
                    <p className="text-sm text-white/80 font-medium">Manage your retail operations efficiently</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:border-[#f5d800]/50 transition-all duration-300">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f5d800]">
                            <User className="w-5 h-5 text-[#155c27]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{user?.email}</p>
                            <p className="text-xs text-white/70 capitalize font-semibold">{user?.role}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 animate-scale-in">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Confirm Logout</h2>
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
            )}
        </div>
    );
};

export default Navbar;
