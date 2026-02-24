import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, ShoppingBag, Truck, ClipboardList, Tag, Layers, UserCheck, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { user, hasRole } = useAuth();

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/admin/dashboard',
            icon: LayoutDashboard,
            roles: ['admin', 'manager', 'cashier'],
        },
        {
            name: 'Sales',
            path: '/admin/sales',
            icon: ShoppingCart,
            roles: ['admin', 'manager', 'cashier'],
        },
        {
            name: 'Products',
            path: '/admin/products',
            icon: Package,
            roles: ['admin', 'manager'],
        },
        {
            name: 'Categories',
            path: '/admin/categories',
            icon: Tag,
            roles: ['admin', 'manager'],
        },
        {
            name: 'Inventory',
            path: '/admin/inventory',
            icon: Layers,
            roles: ['admin', 'manager'],
        },
        {
            name: 'Suppliers',
            path: '/admin/suppliers',
            icon: Truck,
            roles: ['admin', 'manager'],
        },
        {
            name: 'Purchases',
            path: '/admin/purchases',
            icon: ClipboardList,
            roles: ['admin', 'manager'],
        },
        {
            name: 'Customers',
            path: '/admin/customers',
            icon: UserCheck,
            roles: ['admin', 'manager', 'cashier'],
        },
        {
            name: 'Validate Coupon',
            path: '/admin/validate-coupon',
            icon: Gift,
            roles: ['admin', 'manager', 'cashier'],
        },
        {
            name: 'User Management',
            path: '/admin/users',
            icon: Users,
            roles: ['admin'],
        },
    ];

    const filteredItems = menuItems.filter(item => hasRole(...item.roles));

    const isActive = (path) => {
        if (path === '/admin/products') return location.pathname.startsWith('/admin/products');
        if (path === '/admin/categories') return location.pathname.startsWith('/admin/categories');
        if (path === '/admin/inventory') return location.pathname === '/admin/inventory';
        if (path === '/admin/sales') return location.pathname.startsWith('/admin/sales');
        if (path === '/admin/suppliers') return location.pathname.startsWith('/admin/suppliers');
        if (path === '/admin/purchases') return location.pathname.startsWith('/admin/purchases');
        if (path === '/admin/users') return location.pathname.startsWith('/admin/users');
        if (path === '/admin/customers') return location.pathname.startsWith('/admin/customers');
        if (path === '/admin/validate-coupon') return location.pathname === '/admin/validate-coupon';
        return location.pathname === path;
    };

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    <ShoppingBag className="w-8 h-8 text-primary-400" />
                    <div>
                        <h1 className="text-xl font-bold">7 Super City</h1>
                        <p className="text-xs text-gray-400">Retail Management</p>
                    </div>
                </div>

                <div className="mb-6 px-4 py-2 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-400">Logged in as:</p>
                    <p className="font-semibold">{user?.name || 'User'}</p>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary-900 text-primary-300 capitalize border border-primary-700">
                        {user?.role}
                    </span>
                </div>

                <nav className="space-y-1">
                    {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${active
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
