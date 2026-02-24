import { Link } from 'react-router-dom';
import { ShoppingBag, Star, ShieldCheck, Truck, Clock, ArrowRight, Sparkles, TrendingUp, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import StoreMap from '../components/StoreMap';
import { getImageUrl } from '../utils/imageHelper';

const Home = () => {
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products', { params: { limit: 4 } });
                setNewArrivals(data.products || []);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="w-full">
            {/* 1. HERO SECTION */}
            <section className="relative h-[85vh] bg-gray-900 dark:bg-gray-950 flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920"
                        alt="Grocery background"
                        className="w-full h-full object-cover opacity-60 dark:opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent dark:from-gray-950"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-xl animate-fade-in-up">
                        <span className="text-primary-500 font-bold tracking-widest uppercase text-sm mb-4 block animate-slide-in-left">Premium Retail Experience</span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 tracking-tight animate-fade-in-up stagger-1">
                            Premium Quality <span className="text-primary-500">Products</span> at 7 Super City
                        </h1>
                        <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light animate-fade-in-up stagger-2">
                            Your trusted retail partner for everyday essentials. Experience shopping like never before with our fresh selections and exclusive loyalty rewards.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 underline-offset-4 animate-fade-in-up stagger-3">
                            <Link
                                to="/products"
                                className="bg-primary-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary-700 transition-all hover:scale-105 shadow-xl shadow-primary-600/20 hover:shadow-2xl hover:shadow-primary-600/30"
                            >
                                Shop Now <ShoppingBag className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/register"
                                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/20 transition-all hover:scale-105"
                            >
                                Join Loyalty <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. TRUST BAR */}
            <section className="bg-[var(--color-card-bg)] py-12 border-b border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all duration-300 animate-fade-in-up hover:scale-105">
                            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg"><Truck className="w-6 h-6 text-primary-600" /></div>
                            <div><p className="font-bold text-[var(--color-text-primary)]">Free Parking</p><p className="text-xs text-[var(--color-text-secondary)]">Spacious lot available</p></div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all duration-300 animate-fade-in-up stagger-1 hover:scale-105">
                            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg"><ShieldCheck className="w-6 h-6 text-primary-600" /></div>
                            <div><p className="font-bold text-[var(--color-text-primary)]">Quality Assured</p><p className="text-xs text-[var(--color-text-secondary)]">100% fresh products</p></div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all duration-300 animate-fade-in-up stagger-2 hover:scale-105">
                            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg"><Clock className="w-6 h-6 text-primary-600" /></div>
                            <div><p className="font-bold text-[var(--color-text-primary)]">24/7 Support</p><p className="text-xs text-[var(--color-text-secondary)]">Always here to help</p></div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all duration-300 animate-fade-in-up stagger-3 hover:scale-105">
                            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg"><Star className="w-6 h-6 text-primary-600" /></div>
                            <div><p className="font-bold text-[var(--color-text-primary)]">Easy Returns</p><p className="text-xs text-[var(--color-text-secondary)]">No questions asked</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3-7. MID SECTION BACKDROP */}
            <section className="relative overflow-hidden bg-[var(--color-bg-primary)]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2200')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/65 to-white dark:from-gray-900/95 dark:via-gray-900/75 dark:to-gray-950" />
                <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary-600/20 blur-3xl rounded-full" />
                <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-emerald-500/20 blur-3xl rounded-full" />

                {/* 3. NEW ARRIVALS */}
                <div className="relative py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-12 animate-fade-in-up">
                            <div>
                                <h2 className="text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">New Arrivals</h2>
                                <p className="mt-2 text-lg font-light italic text-primary-600 dark:text-primary-200">Freshly stock items in our shelves</p>
                            </div>
                            <Link to="/products" className="text-primary-600 dark:text-primary-200 font-bold hover:underline flex items-center gap-2 hover:scale-105 transition-transform">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-96 bg-[var(--color-card-bg)] rounded-2xl overflow-hidden">
                                    <div className="w-full h-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-shimmer"></div>
                                    <div className="p-6 space-y-3">
                                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer"></div>
                                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {newArrivals.map((product, idx) => (
                                <div key={product._id} className={`group bg-[var(--color-card-bg)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--color-border)] hover:border-primary-500 animate-fade-in-up stagger-${idx % 4}`}>
                                    <div className="aspect-square bg-[var(--color-bg-secondary)] relative overflow-hidden flex items-center justify-center">
                                        {product.productImage ? (
                                            <img 
                                                src={getImageUrl(product.productImage)} 
                                                alt={product.productName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<svg class="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>';
                                                }}
                                            />
                                        ) : (
                                            <Package className="w-20 h-20 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                                        )}
                                        <div className="absolute top-4 left-4">
                                            {product.isActive === false ? (
                                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">Out of Stock</span>
                                            ) : (
                                                <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary-600 shadow-lg">New</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[10px] text-primary-500 font-bold uppercase mb-1 tracking-widest">{product.category?.categoryName || 'General'}</p>
                                        <h3 className="font-bold text-[var(--color-text-primary)] text-lg mb-2 truncate group-hover:text-primary-600 transition-colors uppercase">{product.productName}</h3>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-2xl font-black text-[var(--color-text-primary)]">LKR {product.sellingPrice.toLocaleString()}</span>
                                            <Link to="/products" className="p-2.5 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-lg ring-1 ring-primary-500/40 shadow-md shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/40 hover:scale-105 transition-all duration-300 group-hover:translate-y-[-2px]">
                                                <ShoppingBag className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    </div>
                </div>

                {/* 4. STORE EXPERIENCE */}
                <div className="relative py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                        <div className="text-[var(--color-text-primary)] animate-fade-in-up">
                            <span className="text-primary-600 dark:text-primary-400 font-bold tracking-widest uppercase text-xs">Experience</span>
                            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight text-gray-900 dark:text-white drop-shadow">
                                A modern store built for speed, freshness, and comfort
                            </h2>
                            <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-8">
                                From curated aisles to quick checkout lanes, every detail is designed to make shopping effortless. Enjoy fresh
                                products, dedicated staff, and a loyalty program that rewards every visit.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/70 dark:bg-white/10 border border-white/30 dark:border-white/10">
                                        <ShieldCheck className="w-6 h-6 text-primary-600 dark:text-primary-300" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">Food Safety First</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">Quality checks daily</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/70 dark:bg-white/10 border border-white/30 dark:border-white/10">
                                        <Truck className="w-6 h-6 text-primary-600 dark:text-primary-300" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">Fast Restocking</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">Always fresh shelves</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: '24/7 Service', value: 'Always Open' },
                                { label: 'Fresh Picks', value: 'Daily Supply' },
                                { label: 'Loyalty Rewards', value: 'Earn & Save' },
                                { label: 'Family Friendly', value: 'Comfort Shopping' },
                            ].map((card, i) => (
                                <div
                                    key={card.label}
                                    className={`rounded-2xl p-6 border border-white/30 dark:border-white/15 bg-white/70 dark:bg-white/10 text-[var(--color-text-primary)] dark:text-white shadow-xl animate-scale-in stagger-${i % 4}`}
                                >
                                    <p className="text-xs uppercase tracking-widest text-primary-600 dark:text-primary-200">{card.label}</p>
                                    <p className="text-2xl font-bold mt-3">{card.value}</p>
                                    <div className="mt-6 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-emerald-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </div>

                {/* 5. FEATURED COLLECTIONS */}
                <div className="relative py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-center text-4xl font-bold text-gray-900 dark:text-white mb-12 tracking-tight animate-fade-in-up drop-shadow">Featured Collections</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group relative h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 animate-fade-in-up">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                                <Sparkles className="w-12 h-12 mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                                <h3 className="text-2xl font-bold mb-2">New Arrivals</h3>
                                <p className="text-blue-200 text-sm">Check out the latest additions to our shelves</p>
                            </div>
                        </div>
                        <div className="group relative h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 animate-fade-in-up stagger-1">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                                <TrendingUp className="w-12 h-12 mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                                <h3 className="text-2xl font-bold mb-2">Best Sellers</h3>
                                <p className="text-amber-100 text-sm">Most popular products chosen by our customers</p>
                            </div>
                        </div>
                        <div className="group relative h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 animate-fade-in-up stagger-2">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                                <Tag className="w-12 h-12 mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                                <h3 className="text-2xl font-bold mb-2">Seasonal Offers</h3>
                                <p className="text-green-200 text-sm">Special deals and promotions this season</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                {/* 6. TESTIMONIALS */}
                <div className="relative py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-center text-4xl font-bold text-gray-900 dark:text-white mb-16 tracking-tight animate-fade-in-up drop-shadow">What Our Customers Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { name: "Kamal Perera", text: "Best place for groceries in Horana. Always fresh products and the staff is very helpful. The loyalty points are a great bonus!", stars: 5 },
                            { name: "Sanduni Silva", text: "Clean and well-organized store. I find everything I need in one place. Highly recommend 7 Super City!", stars: 5 },
                            { name: "Nimal Siri", text: "Affordable prices compared to other supermarkets nearby. The new arrivals section always has something interesting.", stars: 4 }
                        ].map((rev, i) => (
                            <div key={i} className={`bg-[var(--color-card-bg)] p-10 rounded-3xl relative shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--color-border)] hover:scale-105 animate-fade-in-up stagger-${i}`}>
                                <span className="absolute top-6 right-8 text-6xl text-primary-200 dark:text-primary-900 font-serif">"</span>
                                <div className="flex gap-1 mb-6">
                                    {[...Array(rev.stars)].map((_, j) => <Star key={j} className="w-4 h-4 fill-primary-500 text-primary-500" />)}
                                </div>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed italic mb-8">"{rev.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xl">{rev.name[0]}</div>
                                    <p className="font-bold text-[var(--color-text-primary)]">{rev.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                </div>

                {/* 7. USER-GENERATED CONTENT (Instagram-style grid) */}
                <div className="relative py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-center text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight animate-fade-in-up drop-shadow">#7SuperCity</h2>
                    <p className="text-center text-[var(--color-text-secondary)] mb-12 animate-fade-in-up stagger-1">See what our community is sharing</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop',
                        ].map((src, i) => (
                            <div key={i} className={`aspect-square rounded-xl overflow-hidden group cursor-pointer relative animate-scale-in stagger-${i % 4}`}>
                                <img src={src} alt="Community" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <Star className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                </div>
            </section>

            {/* 8. STORE MAP */}
            <StoreMap />
        </div>
    );
};

// Simple placeholder icon if Package is not available
const Package = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export default Home;
