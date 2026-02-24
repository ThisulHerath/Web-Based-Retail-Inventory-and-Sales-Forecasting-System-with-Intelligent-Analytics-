import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, ShoppingCart, ChevronDown } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';
import { getImageUrl } from '../utils/imageHelper';

const PublicProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPageState] = useState(() => {
        const p = parseInt(searchParams.get('page'), 10);
        return p && p > 0 ? p : 1;
    });
    const [totalPages, setTotalPages] = useState(1);

    const setPage = useCallback((p) => {
        setPageState(p);
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (p <= 1) {
                next.delete('page');
            } else {
                next.set('page', String(p));
            }
            return next;
        }, { replace: true });
    }, [setSearchParams]);
    const [toast, setToast] = useState(null);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const categoryRef = useRef(null);

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
        setToast({ message: `${product.productName} added to cart`, type: 'success' });
    };

    const selectedCategoryLabel = selectedCategory
        ? (categories.find((cat) => cat._id === selectedCategory)?.categoryName || 'All Categories')
        : 'All Categories';

    return (
        <div className="w-full bg-[var(--color-bg-primary)]">
            <section className="relative h-[40vh] min-h-[320px] bg-gray-900 overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=2000')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/60 to-transparent" />
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                    <div className="max-w-2xl text-white">
                        <span className="text-primary-300 font-bold tracking-widest uppercase text-xs">Shop</span>
                        <h1 className="text-4xl md:text-5xl font-bold mt-3">Our Products</h1>
                        <p className="text-lg text-gray-200 mt-3">
                            Browse our wide selection of quality products curated for everyday needs.
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Filters */}
            <div className="shop-filter-unit flex items-center gap-4 px-4 py-3 mb-8 relative z-30">
                <div className="relative flex-1">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--shop-filter-text)] opacity-70" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-transparent pl-8 pr-3 py-2 text-[var(--shop-filter-text)] placeholder:text-[var(--color-text-tertiary)] outline-none"
                    />
                </div>
                <div className="shop-filter-divider" />
                <div className="relative" ref={categoryRef}>
                    <button
                        type="button"
                        onClick={() => setCategoryOpen((prev) => !prev)}
                        className="flex items-center gap-2 text-[var(--shop-filter-text)] font-semibold text-sm tracking-wide"
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
                                All Categories
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

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-80 bg-[var(--color-card-bg)] rounded-2xl animate-pulse border border-[var(--color-border)]"></div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <ShoppingBag className="w-16 h-16 text-[var(--color-text-tertiary)] mx-auto mb-4" />
                    <p className="text-lg text-[var(--color-text-secondary)]">No products found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-0">
                    {products.map((product) => (
                        <div key={product._id} className="group bg-[var(--color-card-bg)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--color-border)] flex flex-col">
                            <div className="aspect-square bg-[var(--color-bg-secondary)] relative overflow-hidden flex items-center justify-center">
                                {product.productImage ? (
                                    <img
                                        src={getImageUrl(product.productImage)}
                                        alt={product.productName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<svg class="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>';
                                        }}
                                    />
                                ) : (
                                    <PackageIcon className="w-16 h-16 text-[var(--color-text-tertiary)] group-hover:scale-110 transition-transform duration-500" />
                                )}
                                {product.isActive === false ? (
                                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Out of Stock</span>
                                ) : product.currentStock > 0 ? (
                                    <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">In Stock</span>
                                ) : (
                                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Out of Stock</span>
                                )}
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mb-1">
                                    {product.category?.categoryName || 'General'}
                                </p>
                                <h3 className="font-bold text-[var(--color-text-primary)] text-base mb-2 truncate group-hover:text-primary-600 transition-colors">
                                    {product.productName}
                                </h3>
                                {product.description && (
                                    <p className="text-xs text-[var(--color-text-tertiary)] mb-3 line-clamp-2">{product.description}</p>
                                )}
                                <div className="mt-auto flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
                                    <span className="text-xl font-black text-[var(--color-text-primary)]">
                                        LKR {product.sellingPrice?.toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.isActive === false || product.currentStock <= 0}
                                        className="p-2.5 bg-gray-900 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        title={product.isActive === false ? 'Product unavailable' : 'Add to cart'}
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-12 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                p === page
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* In-store message */}
            <div className="mt-16 bg-[var(--color-bg-secondary)] rounded-2xl p-8 text-center border border-[var(--color-border)]">
                <ShoppingBag className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Visit Us In-Store</h3>
                <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
                    Please visit our store to complete your purchase. Add items to your cart to plan your shopping trip!
                </p>
                <a
                    href="https://www.google.com/maps/dir/?api=1&destination=6.709753,80.065837"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 bg-primary-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-700 transition-colors"
                >
                    Get Directions
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
