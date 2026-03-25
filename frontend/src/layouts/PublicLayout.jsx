import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, MapPin, Phone, Mail, Instagram, Facebook, Twitter, Menu, X, ArrowUp } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BrandLogo from '../components/BrandLogo';

const PublicLayout = () => {
    const { customer, logout, isCustomerAuthenticated } = useCustomer();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'si' : 'en';
        i18n.changeLanguage(newLang);
    };

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

    const requestLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        setMobileMenuOpen(false);
        navigate('/');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[var(--color-bg-primary)] transition-colors duration-300 animate-page-fade">
            {/* Navigation Header */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-[#155c27]/92 shadow-lg backdrop-blur-[8px]' 
                    : 'bg-[#155c27]/96 shadow-sm backdrop-blur-[8px]'
            } border-b-2 border-[#f5d800]`}>
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2 animate-slide-in-left">
                            <Link to="/" className="flex items-center hover:scale-105 transition-transform">
                                <BrandLogo className="h-10 w-auto" />
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <NavLink
                                to="/"
                                className={({ isActive }) => `nav-link-animated text-white hover:text-[#f5d800] font-medium transition-all duration-200 ${isActive ? 'active' : ''}`}
                            >
                                {t('nav.home')}
                            </NavLink>
                            <NavLink
                                to="/products"
                                className={({ isActive }) => `nav-link-animated text-white hover:text-[#f5d800] font-medium transition-all duration-200 ${isActive ? 'active' : ''}`}
                            >
                                {t('nav.shop')}
                            </NavLink>
                            <NavLink
                                to="/feedback"
                                className={({ isActive }) => `nav-link-animated text-white hover:text-[#f5d800] font-medium transition-all duration-200 ${isActive ? 'active' : ''}`}
                            >
                                {t('nav.feedback')}
                            </NavLink>
                            <a href="/#location" onClick={handleLocationClick} className="nav-link-animated text-white hover:text-[#f5d800] font-medium transition-all duration-200 cursor-pointer">{t('nav.location')}</a>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4 animate-slide-in-right">
                            <button
                                onClick={toggleLanguage}
                                className="px-3 py-1 rounded-lg border border-yellow-400 text-yellow-400 text-sm font-semibold hover:bg-yellow-400 hover:text-green-900 transition-all duration-200"
                            >
                                {i18n.language === 'en' ? 'සිං' : 'EN'}
                            </button>

                            <Link to="/cart" className="relative p-2 text-white hover:text-[#f5d800] transition-all duration-200 hover:scale-110 rounded-xl hover:bg-[rgba(245,216,0,0.1)]">
                                <ShoppingCart className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#f5d800] to-[#e6c700] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-[var(--color-card-bg)] animate-scale-in">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {isCustomerAuthenticated() ? (
                                <div className="hidden md:flex items-center gap-4">
                                    <Link to="/my-account" className="flex items-center gap-2 text-white hover:text-[#f5d800] font-medium transition-all duration-200 hover:scale-105 border border-[#f5d800] px-2.5 py-1.5 rounded-xl">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f5d800] to-[#e6c700] flex items-center justify-center text-[#155c27] font-bold border-2 border-[rgba(245,216,0,0.3)] shadow-lg">
                                            {customer.firstName[0]}
                                        </div>
                                        <span className="hidden sm:inline">{t('nav.hi')}, {customer.firstName}</span>
                                    </Link>
                                    <button
                                        onClick={requestLogout}
                                        className="text-sm text-white hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-[rgba(245,216,0,0.1)]"
                                    >
                                        {t('nav.logout')}
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link to="/login" className="text-white hover:text-[#f5d800] font-medium transition-all duration-200 px-4 py-2 rounded-xl hover:bg-[rgba(245,216,0,0.1)] hover:scale-105">{t('nav.login')}</Link>
                                    <Link to="/register" className="bg-[#f5d800] text-[#155c27] px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-[rgba(245,216,0,0.3)] transition-all duration-200 font-medium hover:scale-105 font-weight-600">{t('nav.join_points')}</Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-white hover:text-[#f5d800] transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 space-y-2 animate-fade-in-up border-t border-[rgba(255,255,255,0.1)]">
                            <Link to="/" className="block px-4 py-2 text-white hover:text-[#f5d800] hover:bg-[rgba(245,216,0,0.1)] rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>{t('nav.home')}</Link>
                            <Link to="/products" className="block px-4 py-2 text-white hover:text-[#f5d800] hover:bg-[rgba(245,216,0,0.1)] rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>{t('nav.shop')}</Link>
                            <Link to="/feedback" className="block px-4 py-2 text-white hover:text-[#f5d800] hover:bg-[rgba(245,216,0,0.1)] rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>{t('nav.feedback')}</Link>
                            <a href="/#location" onClick={handleLocationClick} className="block px-4 py-2 text-white hover:text-[#f5d800] hover:bg-[rgba(245,216,0,0.1)] rounded-lg transition-colors cursor-pointer">{t('nav.location')}</a>
                            {!isCustomerAuthenticated() && (
                                <>
                                    <Link to="/login" className="block px-4 py-2 text-white hover:text-[#f5d800] hover:bg-[rgba(245,216,0,0.1)] rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>{t('nav.login')}</Link>
                                    <Link to="/register" className="block px-4 py-2 bg-[#f5d800] text-[#155c27] rounded-lg text-center font-medium font-weight-600" onClick={() => setMobileMenuOpen(false)}>{t('nav.join_points')}</Link>
                                </>
                            )}
                            {isCustomerAuthenticated() && (
                                <button
                                    onClick={requestLogout}
                                    className="block w-full text-left px-4 py-2 text-white hover:text-red-400 hover:bg-[rgba(245,216,0,0.1)] rounded-lg transition-colors"
                                >
                                    {t('nav.logout')}
                                </button>
                            )}
                        </div>
                    )}
                </nav>
            </header>

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-[#f5d800]/40 bg-[#0f4a21] text-white shadow-2xl">
                        <div className="p-5 border-b border-[#f5d800]/20">
                            <h3 className="text-lg font-semibold">
                                {t('nav.logout_confirm_title', { defaultValue: 'Confirm Logout' })}
                            </h3>
                            <p className="mt-1 text-sm text-gray-200">
                                {t('nav.logout_confirm_message', { defaultValue: 'Are you sure you want to log out from your account?' })}
                            </p>
                        </div>
                        <div className="p-4 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={cancelLogout}
                                className="px-4 py-2 rounded-lg border border-white/25 text-white hover:bg-white/10 transition-colors"
                            >
                                {t('common.cancel', { defaultValue: 'Cancel' })}
                            </button>
                            <button
                                type="button"
                                onClick={confirmLogout}
                                className="px-4 py-2 rounded-lg bg-[#f5d800] text-[#155c27] font-semibold hover:bg-[#e6c700] transition-colors"
                            >
                                {t('nav.logout', { defaultValue: 'Logout' })}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#f5d800] text-[#155c27] shadow-xl shadow-[rgba(245,216,0,0.3)] border-2 border-[#155c27] transition-transform duration-200 group-hover:scale-105 font-weight-600">
                        <ArrowUp className="w-5 h-5 scroll-top-icon" />
                    </span>
                </button>
            )}

            {/* Footer */}
            <footer className="bg-[#0d3d1a] text-white pt-12 pb-8 mt-12 border-t-2 border-[rgba(245,216,0,0.2)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1 animate-fade-in-up">
                            <Link to="/" className="inline-flex items-center mb-4 hover:scale-105 transition-transform">
                                <BrandLogo className="h-12 w-auto" />
                            </Link>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {t('footer.description')}
                            </p>
                        </div>

                        <div className="animate-fade-in-up stagger-1">
                            <h4 className="text-lg font-bold mb-4">{t('footer.quick_links')}</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link to="/products" className="hover:text-[#f5d800] transition-all duration-150 hover:translate-x-1 inline-block">{t('footer.catalog')}</Link></li>
                                <li><Link to="/register" className="hover:text-[#f5d800] transition-all duration-150 hover:translate-x-1 inline-block">{t('footer.loyalty')}</Link></li>
                                <li><Link to="/feedback" className="hover:text-[#f5d800] transition-all duration-150 hover:translate-x-1 inline-block">{t('footer.share_feedback')}</Link></li>
                                <li><a href="/#location" onClick={handleLocationClick} className="hover:text-[#f5d800] transition-all duration-150 hover:translate-x-1 inline-block cursor-pointer">{t('footer.find_store')}</a></li>
                            </ul>
                        </div>

                        <div className="animate-fade-in-up stagger-2">
                            <h4 className="text-lg font-bold mb-4">{t('footer.contact_info')}</h4>
                            <ul className="space-y-3 text-gray-400 text-sm">
                                <li className="flex items-start gap-3 group">
                                    <MapPin className="w-5 h-5 text-[#f5d800] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                                    <span>6°42'35.1"N 80°03'57.0"E<br />7 Super City, Horana</span>
                                </li>
                                <li className="flex items-center gap-3 group">
                                    <Phone className="w-5 h-5 text-[#f5d800] shrink-0 group-hover:scale-110 transition-transform" />
                                    <span>+94 34 220 0000</span>
                                </li>
                                <li className="flex items-center gap-3 group">
                                    <Mail className="w-5 h-5 text-[#f5d800] shrink-0 group-hover:scale-110 transition-transform" />
                                    <span>hello@7supercity.lk</span>
                                </li>
                            </ul>
                        </div>

                        <div className="animate-fade-in-up stagger-3">
                            <h4 className="text-lg font-bold mb-4">{t('footer.follow_us')}</h4>
                            <div className="flex gap-4">
                                <a href="#" className="bg-[#1e7a34] dark:bg-[#1e7a34] p-2.5 rounded-xl hover:bg-[#f5d800] hover:text-[#155c27] transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-lg"><Facebook className="w-5 h-5" /></a>
                                <a href="#" className="bg-[#1e7a34] dark:bg-[#1e7a34] p-2.5 rounded-xl hover:bg-[#f5d800] hover:text-[#155c27] transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-lg"><Instagram className="w-5 h-5" /></a>
                                <a href="#" className="bg-[#1e7a34] dark:bg-[#1e7a34] p-2.5 rounded-xl hover:bg-[#f5d800] hover:text-[#155c27] transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-lg"><Twitter className="w-5 h-5" /></a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-xs">
                        {t('footer.copyright')}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;




