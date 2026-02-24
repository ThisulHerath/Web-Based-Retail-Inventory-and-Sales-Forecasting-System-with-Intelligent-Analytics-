import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, MapPin, ShoppingBag } from 'lucide-react';

const Cart = () => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        const stored = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(stored);
    };

    const updateQuantity = (id, delta) => {
        const updated = cart.map(item => {
            if (item._id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCart(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    };

    const removeItem = (id) => {
        const updated = cart.filter(item => item._id !== id);
        setCart(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.setItem('cart', JSON.stringify([]));
        window.dispatchEvent(new Event('storage'));
    };

    const total = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);

    if (cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in-up">
                <ShoppingCart className="w-20 h-20 text-[var(--color-text-secondary)] mx-auto mb-6 animate-scale-in" />
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-3">Your Cart is Empty</h2>
                <p className="text-[var(--color-text-secondary)] mb-8">Browse our products and add items to plan your visit.</p>
                <Link
                    to="/products"
                    className="inline-block bg-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary-600/30"
                >
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Shopping Cart</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">{cart.length} item(s) in your cart</p>
                </div>
                <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors hover:scale-105 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    Clear All
                </button>
            </div>

            <div className="space-y-4 mb-8">
                {cart.map((item, idx) => (
                    <div key={item._id} className={`bg-[var(--color-card-bg)] rounded-xl p-5 shadow-sm border border-[var(--color-border)] flex items-center gap-5 hover:shadow-lg transition-all duration-300 animate-slide-in-right stagger-${idx % 4}`}>
                        <div className="w-16 h-16 bg-[var(--color-bg-secondary)] rounded-lg flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-8 h-8 text-[var(--color-text-secondary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[var(--color-text-primary)] truncate">{item.productName}</h3>
                            <p className="text-xs text-[var(--color-text-secondary)]">{item.category}</p>
                            <p className="text-primary-600 font-bold mt-1">LKR {item.sellingPrice.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateQuantity(item._id, -1)}
                                className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] hover:scale-110 transition-all duration-200"
                            >
                                <Minus className="w-4 h-4 text-[var(--color-text-primary)]" />
                            </button>
                            <span className="w-10 text-center font-bold text-[var(--color-text-primary)]">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item._id, 1)}
                                className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] hover:scale-110 transition-all duration-200"
                            >
                                <Plus className="w-4 h-4 text-[var(--color-text-primary)]" />
                            </button>
                        </div>
                        <div className="text-right min-w-[100px]">
                            <p className="font-bold text-[var(--color-text-primary)]">
                                LKR {(item.sellingPrice * item.quantity).toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={() => removeItem(item._id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="glassmorphism rounded-xl p-6 border border-[var(--color-border)] mb-8 animate-fade-in-up">
                <div className="flex items-center justify-between text-xl font-bold text-[var(--color-text-primary)]">
                    <span>Estimated Total:</span>
                    <span>LKR {total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2">* Final price may vary. Tax applied at store.</p>
            </div>

            {/* In-Store Notice */}
            <div className="glassmorphism rounded-2xl p-8 text-center border border-primary-200 dark:border-primary-900 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 animate-fade-in-up stagger-1">
                <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-scale-in" />
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Please Visit Our Store</h3>
                <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto mb-6">
                    Online ordering is not available. Please visit 7 Super City to complete your purchase.
                    Show this cart to our staff for a faster checkout experience!
                </p>
                <a
                    href="https://www.google.com/maps/dir/?api=1&destination=6.709753,80.065837"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-700 transition-all duration-200 shadow-lg hover:scale-105 hover:shadow-xl hover:shadow-primary-600/30"
                >
                    <MapPin className="w-5 h-5" />
                    Get Directions to Store
                </a>
            </div>
        </div>
    );
};

export default Cart;
