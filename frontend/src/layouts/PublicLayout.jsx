import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, MapPin, Phone, Mail, Instagram, Facebook, Twitter, Sun, Moon, Menu, X, ArrowUp } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';

const PublicLayout = () => {
    const { customer, logout, isCustomerAuthenticated } = useCustomer();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const handleLocationClick = (e) => {
        e.preventDefault();
        
        // Navigate to home page first if not already there
        if (window.location.pathname !== '/') {
            navigate('/');
            // Wait for navigation to complete, then scroll
            setTimeout(() => {
                const locationSection = document.getElementById('location');
                if (locationSection) {
                    locationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            // Already on home page, just scroll
            const locationSection = document.getElementById('location');
            if (locationSection) {
                locationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);
        };

        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        return () => window.removeEventListener('storage', updateCartCount);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[var(--color-bg-primary)] transition-colors duration-300">
            {/* Navigation Header */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-[var(--color-card-bg)] shadow-lg backdrop-blur-md bg-opacity-90' 
                    : 'bg-[var(--color-card-bg)] shadow-sm'
            }`}>
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2 animate-slide-in-left">
                            <Link to="/" className="text-2xl font-bold text-primary-600 flex items-center gap-2 hover:scale-105 transition-transform">
                                <span className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-1.5 rounded-xl shadow-lg">7</span>
                                <span className="hidden sm:inline bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">Super City</span>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-[var(--color-text-secondary)] hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105">Home</Link>
                            <Link to="/products" className="text-[var(--color-text-secondary)] hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105">Shop</Link>
                            <a href="/#location" onClick={handleLocationClick} className="text-[var(--color-text-secondary)] hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105 cursor-pointer">Location</a>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4 animate-slide-in-right">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-primary-600 transition-all duration-200 hover:scale-110"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            <Link to="/cart" className="relative p-2 text-[var(--color-text-secondary)] hover:text-primary-600 transition-all duration-200 hover:scale-110 rounded-xl hover:bg-[var(--color-bg-secondary)]">
                                <ShoppingCart className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-[var(--color-card-bg)] animate-scale-in">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {isCustomerAuthenticated() ? (
                                <div className="hidden md:flex items-center gap-4">
                                    <Link to="/my-account" className="flex items-center gap-2 text-[var(--color-text-primary)] hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold border-2 border-primary-200 shadow-lg">
                                            {customer.firstName[0]}
                                        </div>
                                        <span className="hidden sm:inline">Hi, {customer.firstName}</span>
                                    </Link>
                                    <button
                                        onClick={() => { logout(); navigate('/'); }}
                                        className="text-sm text-[var(--color-text-secondary)] hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-[var(--color-bg-secondary)]"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link to="/login" className="text-[var(--color-text-secondary)] hover:text-primary-600 font-medium transition-all duration-200 px-4 py-2 rounded-xl hover:bg-[var(--color-bg-secondary)] hover:scale-105">Login</Link>
                                    <Link to="/register" className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-primary-600/30 transition-all duration-200 font-medium hover:scale-105">Join 7+ Points</Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-primary-600 transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 space-y-2 animate-fade-in-up border-t border-[var(--color-border)]">
                            <Link to="/" className="block px-4 py-2 text-[var(--color-text-secondary)] hover:text-primary-600 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                            <Link to="/products" className="block px-4 py-2 text-[var(--color-text-secondary)] hover:text-primary-600 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
                            <a href="/#location" onClick={handleLocationClick} className="block px-4 py-2 text-[var(--color-text-secondary)] hover:text-primary-600 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors cursor-pointer">Location</a>
                            {!isCustomerAuthenticated() && (
                                <>
                                    <Link to="/login" className="block px-4 py-2 text-[var(--color-text-secondary)] hover:text-primary-600 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                                    <Link to="/register" className="block px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-center font-medium" onClick={() => setMobileMenuOpen(false)}>Join 7+ Points</Link>
                                </>
                            )}
                        </div>
                    )}
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {showScrollTop && (
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-6 right-6 z-50 group"
                    aria-label="Back to top"
                >
                    <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-xl shadow-primary-600/30 ring-1 ring-primary-400/40 transition-transform duration-200 group-hover:scale-105">
                        <ArrowUp className="w-5 h-5" />
                    </span>
                </button>
            )}

            {/* Footer */}
            <footer className="bg-gray-900 dark:bg-gray-950 text-white pt-12 pb-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1 animate-fade-in-up">
                            <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 mb-4 hover:scale-105 transition-transform">
                                <span className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-1.5 rounded-xl shadow-lg">7</span>
                                <span>Super City</span>
                            </Link>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Premium quality products at affordable prices. Your trusted retail partner for everyday essentials in Horana.
                            </p>
                        </div>

                        <div className="animate-fade-in-up stagger-1">
                            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/products" className="hover:text-primary-500 transition-all duration-200 hover:translate-x-1 inline-block">Our Catalog</Link></li>
                                <li><Link to="/register" className="hover:text-primary-500 transition-all duration-200 hover:translate-x-1 inline-block">Loyalty Program</Link></li>
                                <li><a href="/#location" onClick={handleLocationClick} className="hover:text-primary-500 transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer">Find Store</a></li>
                            </ul>
                        </div>

                        <div className="animate-fade-in-up stagger-2">
                            <h4 className="text-lg font-bold mb-4">Contact Info</h4>
                            <ul className="space-y-3 text-gray-400 text-sm">
                                <li className="flex items-start gap-3 group">
                                    <MapPin className="w-5 h-5 text-primary-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                                    <span>6°42'35.1"N 80°03'57.0"E<br />7 Super City, Horana</span>
                                </li>
                                <li className="flex items-center gap-3 group">
                                    <Phone className="w-5 h-5 text-primary-500 shrink-0 group-hover:scale-110 transition-transform" />
                                    <span>+94 34 220 0000</span>
                                </li>
                                <li className="flex items-center gap-3 group">
                                    <Mail className="w-5 h-5 text-primary-500 shrink-0 group-hover:scale-110 transition-transform" />
                                    <span>hello@7supercity.lk</span>
                                </li>
                            </ul>
                        </div>

                        <div className="animate-fade-in-up stagger-3">
                            <h4 className="text-lg font-bold mb-4">Follow Us</h4>
                            <div className="flex gap-4">
                                <a href="#" className="bg-gray-800 dark:bg-gray-900 p-2.5 rounded-xl hover:bg-primary-600 transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-lg"><Facebook className="w-5 h-5" /></a>
                                <a href="#" className="bg-gray-800 dark:bg-gray-900 p-2.5 rounded-xl hover:bg-primary-600 transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-lg"><Instagram className="w-5 h-5" /></a>
                                <a href="#" className="bg-gray-800 dark:bg-gray-900 p-2.5 rounded-xl hover:bg-primary-600 transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-lg"><Twitter className="w-5 h-5" /></a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-xs">
                        &copy; {new Date().getFullYear()} 7 Super City Retail (Pvt) Ltd. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
