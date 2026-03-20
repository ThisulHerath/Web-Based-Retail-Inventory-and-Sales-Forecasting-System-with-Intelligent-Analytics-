import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, ShoppingCart, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Toast from '../../components/Toast';
import { getImageUrl } from '../../utils/imageHelper';

const PublicProducts = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [toast, setToast] = useState(null);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [addedToCartId, setAddedToCartId] = useState(null);
    const categoryRef = useRef(null);

    // Sync page to URL
    useEffect(() => {
        const params = {};
        if (page > 1) params.page = page;
        setSearchParams(params, { replace: true });
    }, [page]);

    useEffect(() => {
        fetchProducts();
    }, [page, search, selectedCategory]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const cards = document.querySelectorAll('.shop-card-reveal');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        cards.forEach((card) => observer.observe(card));
        return () => observer.disconnect();
    }, [products]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12, search };
            if (selectedCategory) params.category = selectedCategory;
            const { data } = await api.get('/products', { params });
            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories', { params: { limit: 100 } });
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const addToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item._id === product._id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                _id: product._id,
                productName: product.productName,
                sellingPrice: product.sellingPrice,
                category: product.category?.categoryName || 'General',
                quantity: 1,
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));
        setAddedToCartId(product._id);
        setTimeout(() => {
            setAddedToCartId((prev) => (prev === product._id ? null : prev));
        }, 450);
        setToast({ message: `${product.productName} ${t('shop_extra.added_to_cart')}`, type: 'success' });
    };

    const selectedCategoryLabel = selectedCategory
        ? (categories.find((cat) => cat._id === selectedCategory)?.categoryName || t('shop.all_categories'))
        : t('shop.all_categories');

    return (
        <div className="w-full bg-[var(--color-bg-primary)]">
            <section className="relative h-[40vh] min-h-[320px] bg-gradient-to-r from-[#155c27] via-[#1a6e30] to-transparent overflow-hidden border-b-[3px] border-[#f5d800]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=2000')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 hero-bg-zoom" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=2000')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#155c27]/85 via-[#155c27]/60 to-transparent" />
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                    <div className="max-w-2xl text-white">
                        <span className="text-[#f5d800] font-bold tracking-widest uppercase text-sm border-l-[3px] border-[#f5d800] pl-3">{t('shop.badge')}</span>
                        <h1 className="text-4xl md:text-[48px] font-bold mt-3" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>{t('shop.title')}</h1>
                        <p className="text-lg text-gray-200 mt-3">
                            {t('shop.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Filters */}
            <div className="shop-filter-unit flex items-center gap-4 px-4 py-0 mb-8 relative z-30 min-h-[52px] rounded-xl">
                <div className="relative flex-1 h-[52px] flex items-center">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-[#f5d800]" />
                    <input
                        type="text"
                        placeholder={t('shop.search_placeholder')}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-transparent pl-8 pr-3 py-2 text-[var(--shop-filter-text)] placeholder:text-[var(--color-text-tertiary)] outline-none h-[52px]"
                    />
                </div>
                <div className="shop-filter-divider" />
                <div className="relative" ref={categoryRef}>
                    <button
                        type="button"
                        onClick={() => setCategoryOpen((prev) => !prev)}
                        className="flex items-center gap-2 text-[var(--shop-filter-text)] font-semibold text-sm tracking-wide px-2 py-2 hover:brightness-110"
                        aria-haspopup="listbox"
                        aria-expanded={categoryOpen}
                    >
                        <span>{selectedCategoryLabel}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {categoryOpen && (
                        <div
                            className="absolute right-0 mt-3 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-xl shadow-black/10 z-20 overflow-hidden"
                            role="listbox"
                        >
                            <button
                                type="button"
                                onClick={() => { setSelectedCategory(''); setPage(1); setCategoryOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                            >
                                {t('shop.all_categories')}
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    type="button"
                                    onClick={() => { setSelectedCategory(cat._id); setPage(1); setCategoryOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                                >
                                    {cat.categoryName}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="relative">
                {/* Product listing background layers only */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" aria-hidden="true">
                    {/* Dot-grid base texture */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(245,216,0,0.16) 1.2px, transparent 1.2px)',
                            backgroundSize: '16px 16px',
                        }}
                    />
                    {/* Radial glow overlay */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(circle at 50% 30%, rgba(245,216,0,0.2) 0%, rgba(245,216,0,0) 62%)',
                        }}
                    />
                    {/* Faint organic watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
                        <svg viewBox="0 0 400 400" className="w-[600px] h-[600px] text-[#f5d800]" fill="currentColor" role="presentation" aria-hidden="true">
                            <path d="M200 30C136 65 98 121 88 182c-11 68 12 132 79 188 6-54 26-92 62-116 36-24 78-34 129-31-37-31-56-72-56-122 0-27 6-52 18-75-43-3-82 2-120 16z" />
                        </svg>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 relative z-[1]">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-80 bg-[var(--color-card-bg)] rounded-2xl animate-pulse border border-[var(--color-border)]"></div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 relative z-[1]">
                        <ShoppingBag className="w-16 h-16 text-[var(--color-text-tertiary)] mx-auto mb-4" />
                        <p className="text-lg text-[var(--color-text-secondary)]">{t('shop_extra.no_products_found')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 relative z-[1]">
                        {products.map((product, index) => (
                            <div
                                key={product._id}
                                className="group shop-card-reveal relative z-[1] bg-[var(--color-card-bg)] rounded-[14px] overflow-hidden shadow-sm border border-[rgba(245,216,0,0.15)] flex flex-col hover:scale-[1.03] hover:border-[#f5d800] hover:shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
                                style={{ transition: 'all 0.25s ease', transitionDelay: `${index * 50}ms` }}
                            >
                            <div className="aspect-square bg-[var(--color-bg-secondary)] relative overflow-hidden flex items-center justify-center">
                                {product.productImage ? (
                                    <img
                                        src={getImageUrl(product.productImage)}
                                        alt={product.productName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<svg class="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>';
                                        }}
                                    />
                                ) : (
                                    <PackageIcon className="w-16 h-16 text-[var(--color-text-tertiary)] group-hover:scale-110 transition-transform duration-500" />
                                )}
                                {product.isActive === false ? (
                                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{t('common.out_of_stock')}</span>
                                ) : product.currentStock > 0 ? (
                                    <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                                        <span className="inline-flex w-1.5 h-1.5 rounded-full bg-white animate-stock-pulse" />
                                        {t('shop.in_stock')}
                                    </span>
                                ) : (
                                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{t('common.out_of_stock')}</span>
                                )}
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <p className="text-[10px] text-[#f5d800] font-bold uppercase tracking-[0.06em] mb-2 pb-1 border-b border-[rgba(245,216,0,0.2)]">
                                    {product.category?.categoryName || 'General'}
                                </p>
                                <h3 className="font-semibold text-[var(--color-text-primary)] text-[16px] leading-[1.3] mb-2 truncate group-hover:text-[#f5d800] transition-colors">
                                    {product.productName}
                                </h3>
                                {product.description && (
                                    <p className="text-xs text-[var(--color-text-tertiary)] mb-3 line-clamp-2">{product.description}</p>
                                )}
                                <div className="mt-auto flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
                                    <span className="text-[18px] font-bold text-[var(--color-text-primary)] group-hover:[text-shadow:0_0_8px_rgba(245,216,0,0.3)]">
                                        LKR {product.sellingPrice?.toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.isActive === false || product.currentStock <= 0}
                                        className={`p-2.5 bg-gray-900 text-white rounded-[10px] hover:bg-primary-600 hover:scale-110 hover:border hover:border-[#f5d800] transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed ${addedToCartId === product._id ? 'animate-cart-bounce' : ''}`}
                                        title={product.isActive === false ? t('shop_extra.product_unavailable') : t('shop_extra.add_to_cart')}
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-12 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-[8px] font-medium transition-all duration-200 ${
                                p === page
                                    ? 'bg-[#f5d800] text-[#155c27] border-2 border-[#f5d800] font-weight-600 shadow-lg'
                                    : 'bg-[#155c27] text-white border border-[rgba(245,216,0,0.3)] hover:bg-[#1e7a34] hover:border-[#f5d800]'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* In-store message */}
            <div className="mt-16 bg-[var(--color-bg-secondary)] rounded-[16px] py-10 px-8 text-center border-2 border-[rgba(245,216,0,0.3)] border-t-2 border-t-[#f5d800]">
                <ShoppingBag className="w-8 h-8 text-[#f5d800] mx-auto mb-4 animate-float-soft" />
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">{t('shop.visit_store')}</h3>
                <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
                    {t('shop.visit_store_sub')}
                </p>
                <a
                    href="https://www.google.com/maps/dir/?api=1&destination=6.709753,80.065837"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 bg-[#f5d800] text-[#155c27] font-weight-600 px-6 py-3 rounded-full font-semibold hover:bg-[#e6c700] hover:scale-[1.03] transition-all duration-200"
                >
                    {t('shop.get_directions')}
                </a>
            </div>
            </div>
        </div>
    );
};

// Simple package icon
const PackageIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export default PublicProducts;





