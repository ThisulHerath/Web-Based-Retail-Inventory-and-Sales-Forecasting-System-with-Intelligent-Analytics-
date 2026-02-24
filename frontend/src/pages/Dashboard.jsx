import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Users, Package, AlertTriangle, Truck, ClipboardList, Tag, Layers, UserCheck, Gift } from 'lucide-react';
import { getSalesStats } from '../services/salesService';
import { getAllProducts } from '../services/productService';
import { getAllUsers } from '../services/userService';
import { getSupplierStats } from '../services/supplierService';
import { getPurchaseStats } from '../services/purchaseService';
import { getInventoryStats } from '../services/inventoryService';
import { getAllCategories } from '../services/categoryService';
import { getCustomerStats } from '../services/customerService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, isAdmin, isManager } = useAuth();
    const [stats, setStats] = useState({
        totalSales: 0,
        totalRevenue: 0,
        todaySales: 0,
        totalProducts: 0,
        lowStockCount: 0,
        totalUsers: 0,
        totalSuppliers: 0,
        totalPurchases: 0,
        totalPurchaseCost: 0,
        totalCategories: 0,
        totalStockValue: 0,
        totalProfit: 0,
        totalCustomers: 0,
        activeCustomers: 0,
        totalLoyaltyPoints: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const promises = [
                getSalesStats(),
                getAllProducts(1, 1),
            ];

            if (isAdmin() || isManager()) {
                promises.push(getInventoryStats());
                promises.push(getAllCategories(1, 1));
                promises.push(getSupplierStats());
                promises.push(getPurchaseStats());
                promises.push(getCustomerStats());
            }

            if (isAdmin()) {
                promises.push(getAllUsers(1, 1));
            }

            const results = await Promise.all(promises);
            const salesData = results[0];
            const productsData = results[1];

            let invStats = { totalProducts: 0, lowStockCount: 0, totalStockValue: 0 };
            let catData = { totalCategories: 0 };
            let supplierData = { totalSuppliers: 0 };
            let purchaseData = { totalPurchases: 0, totalPurchaseCost: 0 };
            let customerData = { totalCustomers: 0, activeCustomers: 0, totalPoints: 0 };
            let usersData = { totalUsers: 0 };

            if (isAdmin() || isManager()) {
                invStats = results[2];
                catData = results[3];
                supplierData = results[4];
                purchaseData = results[5];
                customerData = results[6];
                if (isAdmin()) {
                    usersData = results[7];
                }
            }

            setStats({
                totalSales: salesData.totalSales,
                totalRevenue: salesData.totalRevenue,
                todaySales: salesData.todaySales,
                totalProducts: invStats.totalProducts || productsData.totalProducts || 0,
                lowStockCount: invStats.lowStockCount || 0,
                totalUsers: usersData.totalUsers || 0,
                totalSuppliers: supplierData.totalSuppliers || 0,
                totalPurchases: purchaseData.totalPurchases || 0,
                totalPurchaseCost: purchaseData.totalPurchaseCost || 0,
                totalCategories: catData.totalCategories || 0,
                totalStockValue: invStats.totalStockValue || 0,
                totalProfit: salesData.totalProfit || 0,
                totalCustomers: customerData.totalCustomers || 0,
                activeCustomers: customerData.activeCustomers || 0,
                totalLoyaltyPoints: customerData.totalPoints || 0,
            });

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatCards = () => {
        const cards = [];

        // Common for all: Sales Count
        cards.push({
            title: 'Total Sales',
            value: stats.totalSales,
            icon: ShoppingCart,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            link: '/admin/sales',
        });

        // Revenue: Admin Only
        if (isAdmin()) {
            cards.push({
                title: 'Total Revenue',
                value: `LKR ${stats.totalRevenue.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                icon: DollarSign,
                color: 'bg-green-500',
                bgColor: 'bg-green-50',
                textColor: 'text-green-600',
            });

            cards.push({
                title: 'Total Profit',
                value: `LKR ${stats.totalProfit.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                icon: TrendingUp,
                color: 'bg-emerald-500',
                bgColor: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            });
        }

        // Inventory: Admin & Manager
        if (isAdmin() || isManager()) {
            cards.push({
                title: 'Total Products',
                value: stats.totalProducts,
                icon: Package,
                color: 'bg-purple-500',
                bgColor: 'bg-purple-50',
                textColor: 'text-purple-600',
                link: '/admin/products',
            });

            cards.push({
                title: 'Categories',
                value: stats.totalCategories,
                icon: Tag,
                color: 'bg-violet-500',
                bgColor: 'bg-violet-50',
                textColor: 'text-violet-600',
                link: '/admin/categories',
            });

            cards.push({
                title: 'Low Stock Items',
                value: stats.lowStockCount,
                icon: AlertTriangle,
                color: 'bg-orange-500',
                bgColor: 'bg-orange-50',
                textColor: 'text-orange-600',
                link: '/admin/inventory',
            });
        }

        // Users: Admin Only
        if (isAdmin()) {
            cards.push({
                title: 'Total Users',
                value: stats.totalUsers,
                icon: Users,
                color: 'bg-indigo-500',
                bgColor: 'bg-indigo-50',
                textColor: 'text-indigo-600',
                link: '/admin/users',
            });
        }

        // Supplier & Purchase stats: Admin & Manager
        if (isAdmin() || isManager()) {
            cards.push({
                title: 'Total Suppliers',
                value: stats.totalSuppliers,
                icon: Truck,
                color: 'bg-cyan-500',
                bgColor: 'bg-cyan-50',
                textColor: 'text-cyan-600',
                link: '/admin/suppliers',
            });

            cards.push({
                title: 'Total Purchases',
                value: stats.totalPurchases,
                icon: ClipboardList,
                color: 'bg-amber-500',
                bgColor: 'bg-amber-50',
                textColor: 'text-amber-600',
                link: '/admin/purchases',
            });
        }

        // Purchase cost: Admin only
        if (isAdmin()) {
            cards.push({
                title: 'Total Purchase Cost',
                value: `LKR ${stats.totalPurchaseCost.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                icon: DollarSign,
                color: 'bg-rose-500',
                bgColor: 'bg-rose-50',
                textColor: 'text-rose-600',
            });
        }

        // Today's Sales: Everyone
        cards.push({
            title: "Today's Sales",
            value: stats.todaySales,
            icon: TrendingUp,
            color: 'bg-teal-500',
            bgColor: 'bg-teal-50',
            textColor: 'text-teal-600',
        });

        // Customer stats: Admin & Manager
        if (isAdmin() || isManager()) {
            cards.push({
                title: 'Total Customers',
                value: stats.totalCustomers,
                icon: UserCheck,
                color: 'bg-pink-500',
                bgColor: 'bg-pink-50',
                textColor: 'text-pink-600',
                link: '/admin/customers',
            });

            cards.push({
                title: 'Loyalty Points Issued',
                value: stats.totalLoyaltyPoints,
                icon: Gift,
                color: 'bg-yellow-500',
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-600',
            });
        }

        return cards;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Welcome back, <span className="font-semibold">{user?.name}</span> ({user?.role})
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getStatCards().map((card, index) => {
                    const Icon = card.icon;
                    const CardContent = (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    {card.title}
                                </p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {card.value}
                                </p>
                            </div>
                            <div className={`${card.bgColor} p-4 rounded-full`}>
                                <Icon className={`w-8 h-8 ${card.textColor}`} />
                            </div>
                        </div>
                    );

                    return (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
                        >
                            {card.link ? (
                                <Link to={card.link} className="block h-full">
                                    {CardContent}
                                </Link>
                            ) : (
                                CardContent
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-5">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <Link to="/admin/sales/create" className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">New Sale</span>
                    </Link>
                    {(isAdmin() || isManager()) && (
                        <>
                            <Link to="/admin/products/create" className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 hover:shadow-md transition-all duration-200">
                                <div className="p-3 rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
                                    <Package className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">Add Product</span>
                            </Link>
                            <Link to="/admin/inventory" className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-teal-50 hover:border-teal-200 hover:shadow-md transition-all duration-200">
                                <div className="p-3 rounded-full bg-teal-100 text-teal-600 group-hover:bg-teal-200 transition-colors">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700 transition-colors">Manage Inventory</span>
                            </Link>
                            <Link to="/admin/suppliers/create" className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-cyan-50 hover:border-cyan-200 hover:shadow-md transition-all duration-200">
                                <div className="p-3 rounded-full bg-cyan-100 text-cyan-600 group-hover:bg-cyan-200 transition-colors">
                                    <Truck className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-700 transition-colors">Add Supplier</span>
                            </Link>
                            <Link to="/admin/purchases/create" className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 hover:shadow-md transition-all duration-200">
                                <div className="p-3 rounded-full bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-colors">
                                    <ClipboardList className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors">New Purchase</span>
                            </Link>
                            <Link to="/admin/customers" className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-pink-50 hover:border-pink-200 hover:shadow-md transition-all duration-200">
                                <div className="p-3 rounded-full bg-pink-100 text-pink-600 group-hover:bg-pink-200 transition-colors">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors">Customers</span>
                            </Link>
                        </>
                    )}
                    <Link to="/admin/validate-coupon" className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-yellow-50 hover:border-yellow-200 hover:shadow-md transition-all duration-200">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200 transition-colors">
                            <Gift className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-yellow-700 transition-colors">Validate Coupon</span>
                    </Link>
                    {isAdmin() && (
                        <Link to="/admin/users/create" className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors">Add User</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
