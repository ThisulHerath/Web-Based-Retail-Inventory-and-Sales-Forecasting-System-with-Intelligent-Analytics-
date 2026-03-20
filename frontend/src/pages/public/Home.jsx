import { Link } from 'react-router-dom';
import { ShoppingBag, Star, ShieldCheck, Truck, Clock, ArrowRight, Sparkles, TrendingUp, Tag, Hash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import StoreMap from '../../components/StoreMap';
import { getImageUrl } from '../../utils/imageHelper';
import { useCustomer } from '../../context/CustomerContext';
import { getPublicFeedbacks } from '../../services/feedbackService';

const Home = () => {
    const { customer } = useCustomer();
    const { t } = useTranslation();
    const [newArrivals, setNewArrivals] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedbackLoading, setFeedbackLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
        fetchFeedbacks();
    }, []);

    useEffect(() => {
        const sections = document.querySelectorAll('.reveal-on-scroll');
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

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

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

    const fetchFeedbacks = async () => {
        try {
            const data = await getPublicFeedbacks(6);
            setFeedbacks(data || []);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        } finally {
            setFeedbackLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* 1. HERO SECTION */}
            <section className="relative h-[85vh] bg-gray-900 dark:bg-gray-950 flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div
                        className="absolute inset-0 hero-bg-kenburns bg-cover bg-center"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920')" }}
                        role="img"
                        aria-label="Grocery background"
                    />
                    <div className="absolute inset-0 hero-overlay-produce" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-xl animate-fade-in-up">
                        <span className="text-[#f5d800] font-bold tracking-widest uppercase text-sm mb-4 block animate-slide-in-left border-l-[3px] border-[#f5d800] pl-3">{t('hero.badge')}</span>
                        <h1 className="text-5xl md:text-[56px] font-bold text-white leading-tight mb-6 tracking-tight animate-fade-in-up stagger-1" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                            {t('hero.title_1')} <span className="text-[#f5d800]">{t('hero.title_2')}</span> {t('hero.title_3')}
                        </h1>
                        <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light animate-fade-in-up stagger-2">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 underline-offset-4 animate-fade-in-up stagger-3">
                            <Link
                                to="/products"
                                className="bg-[#f5d800] text-[#155c27] font-weight-600 px-8 h-[52px] rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#e6c700] transition-all duration-200 ease-in-out hover:scale-[1.04] shadow-xl shadow-[rgba(245,216,0,0.2)] hover:shadow-2xl hover:shadow-[rgba(245,216,0,0.3)]"
                            >
                                {t('hero.shop_now')} <ShoppingBag className="w-5 h-5" />
                            </Link>
                            {!customer && (
                                <Link
                                    to="/register"
                                    className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/20 transition-all hover:scale-105"
                                >
                                    {t('hero.join_loyalty')} <ArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. TRUST BAR */}
            <section className="reveal-on-scroll bg-[var(--color-card-bg)] py-12 border-t border-b border-[rgba(245,216,0,0.15)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                        <div className="group flex items-center gap-4 p-4 md:pr-8 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all duration-300 animate-fade-in-up hover:scale-[1.01] md:border-r md:border-[rgba(245,216,0,0.2)]">
                            <div className="bg-[#d4e8d0] dark:bg-[#0d3d1a]/30 p-3 rounded-lg transition-transform duration-200 group-hover:scale-110"><Truck className="w-6 h-6 text-[#f5d800]" /></div>
                            <div><p className="font-bold text-[var(--color-text-primary)]">{t('features.parking')}</p><p className="text-xs text-[var(--color-text-secondary)]">{t('features.parking_sub')}</p></div>
                        </div>
                        <div className="group flex items-center gap-4 p-4 md:px-8 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all duration-300 animate-fade-in-up stagger-1 hover:scale-[1.01] md:border-r md:border-[rgba(245,216,0,0.2)]">
                            <div className="bg-[#d4e8d0] dark:bg-[#0d3d1a]/30 p-3 rounded-lg transition-transform duration-200 hover:scale-110"><ShieldCheck className="w-6 h-6 text-[#f5d800]" /></div>
                            <div><p className="font-bold text-[var(--color-text-primary)]">{t('features.quality')}</p><p className="text-xs text-[var(--color-text-secondary)]">{t('features.quality_sub')}</p></div>
                        </div>
                        <div className="group flex items-center gap-4 p-4 md:px-8 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all duration-300 animate-fade-in-up stagger-2 hover:scale-[1.01] md:border-r md:border-[rgba(245,216,0,0.2)]">
                            <div className="bg-[#d4e8d0] dark:bg-[#0d3d1a]/30 p-3 rounded-lg transition-transform duration-200 hover:scale-110"><Clock className="w-6 h-6 text-[#f5d800]" /></div>
                            <div><p className="font-bold text-[var(--color-text-primary)]">{t('features.support')}</p><p className="text-xs text-[var(--color-text-secondary)]">{t('features.support_sub')}</p></div>
                        </div>
                        <div className="group flex items-center gap-4 p-4 md:pl-8 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all duration-300 animate-fade-in-up stagger-3 hover:scale-[1.01]">
                            <div className="bg-[#d4e8d0] dark:bg-[#0d3d1a]/30 p-3 rounded-lg transition-transform duration-200 hover:scale-110"><Star className="w-6 h-6 text-[#f5d800]" /></div>
                            <div><p className="font-bold text-[var(--color-text-primary)]">{t('features.returns')}</p><p className="text-xs text-[var(--color-text-secondary)]">{t('features.returns_sub')}</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3-7. MID SECTION BACKDROP */}
            <section className="relative overflow-hidden bg-[var(--color-bg-primary)]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=2200')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/65 to-white dark:from-gray-900/95 dark:via-gray-900/75 dark:to-gray-950" />
                <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary-600/20 blur-3xl rounded-full" />
                <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-emerald-500/20 blur-3xl rounded-full" />

                {/* 3. NEW ARRIVALS */}
                <div className="relative py-24 reveal-on-scroll">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-12 animate-fade-in-up">
                            <div>
                                <h2 className="text-4xl font-bold text-[var(--color-text-primary)] tracking-tight border-l-[3px] border-[#f5d800] pl-4">{t('new_arrivals.title')}</h2>
                                <p className="mt-2 text-lg font-light italic text-[#f5d800] dark:text-[#f5d800]">{t('new_arrivals.subtitle')}</p>
                            </div>
                            <Link to="/products" className="group text-[#f5d800] dark:text-[#f5d800] font-bold hover:underline flex items-center gap-2 hover:scale-105 transition-transform">
                                <span>{t('new_arrivals.view_all')}</span> <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
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
                                <div key={product._id} className={`group bg-[var(--color-card-bg)] rounded-2xl overflow-hidden shadow-sm transition-all duration-300 border border-[var(--color-border)] hover:border-[#f5d800] hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] animate-fade-in-up stagger-${idx % 4}`}>
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
                                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">{t('common.out_of_stock')}</span>
                                            ) : (
                                                <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#f5d800] shadow-lg">{t('new_arrivals.badge')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[10px] text-[#f5d800] font-bold uppercase mb-1 tracking-widest">{product.category?.categoryName || 'General'}</p>
                                        <h3 className="font-bold text-[var(--color-text-primary)] text-lg mb-2 truncate group-hover:text-[#f5d800] transition-colors uppercase">{product.productName}</h3>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-2xl font-black text-[var(--color-text-primary)]">LKR {product.sellingPrice.toLocaleString()}</span>
                                            <Link to="/products" className="p-2.5 bg-gradient-to-br from-[#f5d800] to-[#e6c700] text-white rounded-lg ring-1 ring-[rgba(245,216,0,0.4)] shadow-md shadow-[rgba(245,216,0,0.2)] hover:shadow-lg hover:shadow-primary-600/40 hover:scale-105 transition-all duration-300 group-hover:translate-y-[-2px]">
                                                <ShoppingBag className="w-5 h-5 transition-transform duration-200 group-hover:rotate-[-8deg] group-hover:scale-110" />
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
                <div className="relative py-28 reveal-on-scroll">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                        <div className="text-[var(--color-text-primary)] animate-fade-in-up">
                            <span className="text-[#f5d800] dark:text-[#f5d800] font-bold tracking-widest uppercase text-xs border-l-2 border-[#f5d800] pl-3">{t('store_info.badge')}</span>
                            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight text-gray-900 dark:text-white drop-shadow">
                                {t('store_info.title')}
                            </h2>
                            <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-8">
                                {t('store_info.subtitle')}
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/70 dark:bg-white/10 border border-white/30 dark:border-white/10">
                                        <ShieldCheck className="w-6 h-6 text-[#f5d800] dark:text-[#f0e68c]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{t('store_info.food_safety')}</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">{t('store_info.food_safety_sub')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/70 dark:bg-white/10 border border-white/30 dark:border-white/10">
                                        <Truck className="w-6 h-6 text-[#f5d800] dark:text-[#f0e68c]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{t('store_info.restocking')}</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">{t('store_info.restocking_sub')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: t('store_info.fresh_daily_label'), value: t('store_info.fresh_daily') },
                                { label: t('store_info.fresh_picks'), value: t('store_info.daily_supply') },
                                { label: t('store_info.loyalty'), value: t('store_info.earn_save') },
                                { label: t('store_info.family'), value: t('store_info.comfort') },
                            ].map((card, i) => (
                                <div
                                    key={card.label}
                                    className={`rounded-2xl p-6 border border-[rgba(255,255,255,0.1)] bg-white/70 dark:bg-white/10 text-[var(--color-text-primary)] dark:text-white shadow-xl animate-scale-in stagger-${i % 4} transition-all duration-200 hover:bg-white/80 dark:hover:bg-white/15 hover:border-[rgba(255,255,255,0.25)]`}
                                >
                                    <p className="text-xs uppercase tracking-widest text-[#f5d800] dark:text-[#f5d800]">{card.label}</p>
                                    <p className="text-2xl font-bold mt-3">{card.value}</p>
                                    <div className="mt-6 h-[3px] w-20 rounded-full bg-[#f5d800]" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </div>

                {/* 5. FEATURED COLLECTIONS */}
                <div className="relative py-24 reveal-on-scroll">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-center text-4xl font-bold text-gray-900 dark:text-white mb-12 tracking-tight animate-fade-in-up drop-shadow">{t('collections.title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group relative h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1e7a34] to-[#155c27] cursor-pointer hover:scale-[1.03] transition-all duration-[250ms] ease-in-out hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] animate-fade-in-up border-b border-[rgba(255,255,255,0.15)]">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                                <Sparkles className="w-12 h-12 mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300" />
                                <h3 className="text-2xl font-bold mb-2">{t('collections.new_arrivals')}</h3>
                                <p className="text-green-100 text-sm">{t('collections.new_arrivals_sub')}</p>
                            </div>
                        </div>
                        <div className="group relative h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-[#f5d800] to-[#e6c700] cursor-pointer hover:scale-[1.03] transition-all duration-[250ms] ease-in-out hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] animate-fade-in-up stagger-1 border-b border-[rgba(255,255,255,0.15)]">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#155c27] p-8 text-center">
                                <TrendingUp className="w-12 h-12 mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300" />
                                <h3 className="text-2xl font-bold mb-2">{t('collections.best_sellers')}</h3>
                                <p className="text-[#155c27]/80 text-sm">{t('collections.best_sellers_sub')}</p>
                            </div>
                        </div>
                        <div className="group relative h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0d3d1a] to-[#0a2811] cursor-pointer hover:scale-[1.03] transition-all duration-[250ms] ease-in-out hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] animate-fade-in-up stagger-2 border-b border-[rgba(255,255,255,0.15)]">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                                <Tag className="w-12 h-12 mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300" />
                                <h3 className="text-2xl font-bold mb-2">{t('collections.seasonal')}</h3>
                                <p className="text-green-100 text-sm">{t('collections.seasonal_sub')}</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                {/* 6. TESTIMONIALS */}
                <div className="relative py-24 overflow-hidden reveal-on-scroll">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-center text-4xl font-bold text-gray-900 dark:text-white mb-16 tracking-tight animate-fade-in-up drop-shadow">{t('reviews.title')}</h2>
                    {feedbackLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                        </div>
                    ) : feedbacks.length === 0 ? (
                        <div className="text-center py-10 bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)]">
                            <p className="text-[var(--color-text-secondary)]">{t('feedback.subtitle')}</p>
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {feedbacks.map((rev, i) => (
                            <div
                                key={rev._id || i}
                                className={`bg-[#1a6e30] p-10 rounded-3xl relative border border-[rgba(255,255,255,0.2)] border-t-2 border-t-[#f5d800] hover:bg-[#2ea44f] hover:border-2 hover:border-[#f5d800] hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] hover:-translate-y-1 animate-fade-in-up stagger-${i % 3}`}
                                style={{ transition: 'all 0.25s ease' }}
                            >
                                <span className="absolute top-4 right-5 text-2xl text-[#f5d800] font-serif">"</span>
                                <div className="flex gap-1 mb-6">
                                    {Array.from({ length: 5 }).map((_, j) => {
                                        const ratingValue = Number(rev.rating) || 0;
                                        const isFilled = j < ratingValue;
                                        return (
                                            <Star
                                                key={j}
                                                className={`w-4 h-4 ${isFilled ? 'text-[#f5d800] fill-[#f5d800]' : 'text-[#2f9b52]'}`}
                                            />
                                        );
                                    })}
                                </div>
                                <p className="text-white leading-relaxed italic opacity-100 mb-8">"{rev.comment}"</p>
                                <div className="h-px bg-[rgba(255,255,255,0.2)] mb-6" />
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#f5d800] text-[#155c27] font-weight-600 flex items-center justify-center font-bold text-xl">{rev.customerName?.[0] || 'C'}</div>
                                    <div>
                                        <p className="font-semibold text-white">{rev.customerName}</p>
                                        <p className="text-xs text-white/70">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}

                    <div className="mt-12 text-center">
                        <Link
                            to="/feedback"
                            className="inline-flex items-center justify-center bg-[#155c27] border border-[#f5d800] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#f5d800] hover:text-[#155c27] transition-all duration-200"
                        >
                            {t('reviews.share_feedback')}
                        </Link>
                    </div>
                </div>
                </div>

                {/* 7. USER-GENERATED CONTENT (Instagram-style grid) */}
                <div className="relative py-24 reveal-on-scroll">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-center text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight animate-fade-in-up drop-shadow">{t('social.title')}</h2>
                    <p className="text-center text-[var(--color-text-secondary)] mb-12 animate-fade-in-up stagger-1">{t('social.subtitle')}</p>
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
                                <img src={src} alt="Community" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
                                <div className="absolute inset-0 bg-[rgba(21,92,39,0)] group-hover:bg-[rgba(21,92,39,0.55)] transition-colors duration-300 flex items-center justify-center">
                                    <Hash className="w-8 h-8 text-[#f5d800] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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







