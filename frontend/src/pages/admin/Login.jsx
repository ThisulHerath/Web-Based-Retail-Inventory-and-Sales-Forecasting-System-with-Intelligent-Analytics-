import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock } from 'lucide-react';
import Toast from '../../components/Toast';
import BrandLogo from '../../components/BrandLogo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const { login, logout } = useAuth();
    const navigate = useNavigate();

    // Force light mode for admin login
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        root.classList.add('light');
    }, []);

    // Clear any existing session when visiting login page
    useEffect(() => {
        logout();
    }, [logout]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setToast({ message: 'Please enter your email address', type: 'error' });
            return;
        }

        if (!password) {
            setToast({ message: 'Please enter your password', type: 'error' });
            return;
        }

        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setToast({ message: result.message, type: 'error' });
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#155c27] via-[#155c27] to-[#0d3d1a] flex items-center justify-center p-4">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <BrandLogo className="h-16 w-auto" />
                    </div>
                    <p className="text-gray-600">Retail Management System</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-[rgba(245,216,0,0.3)] rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none transition"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-[rgba(245,216,0,0.3)] rounded-lg focus:ring-2 focus:ring-[#f5d800] focus:border-transparent outline-none transition"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#f5d800] text-[#155c27] py-3 rounded-lg font-semibold hover:bg-[#e6c700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_0_4px_rgba(245,216,0,0.2)]"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;


