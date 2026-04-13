import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, ShoppingBag, Truck, ClipboardList, Tag, Layers, UserCheck, Gift, PanelLeftClose, PanelLeftOpen, BrainCircuit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
    const location = useLocation();
    const { user, hasRole } = useAuth();

    const getInitials = (fullName = '') => {
        return fullName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || '')
            .join('') || 'U';
    };

    const menuSections = [
        {
            label: 'Main Menu',
            items: [
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
                    name: 'Validate Coupon',
                    path: '/admin/validate-coupon',
                    icon: Gift,
                    roles: ['admin', 'manager', 'cashier'],
                },
            ],
        },
        {
            label: 'Inventory',
            items: [
                {
                    name: 'Categories',
                    path: '/admin/categories',
                    icon: Tag,
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
                    name: 'Inventory',
                    path: '/admin/inventory',
                    icon: Layers,
                    roles: ['admin', 'manager'],
                },
                {
                    name: 'Products',
                    path: '/admin/products',
                    icon: Package,
                    roles: ['admin', 'manager'],
                },
            ],
        },
        {
            label: 'Management',
            items: [
                {
                    name: 'Customers',
                    path: '/admin/customers',
                    icon: UserCheck,
                    roles: ['admin', 'manager', 'cashier'],
                },
                {
                    name: 'User Management',
                    path: '/admin/users',
                    icon: Users,
                    roles: ['admin'],
                },
                {
                    name: 'AI Prediction',
                    path: '/admin/ai-prediction',
                    icon: BrainCircuit,
                    roles: ['admin'],
                },
            ],
        },
    ];

    const filteredSections = menuSections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => hasRole(...item.roles)),
        }))
        .filter((section) => section.items.length > 0);

    const isActive = (path) => {
        if (path === '/admin/products') return location.pathname.startsWith('/admin/products');
        if (path === '/admin/categories') return location.pathname.startsWith('/admin/categories');
        if (path === '/admin/inventory') return location.pathname.startsWith('/admin/inventory');
        if (path === '/admin/sales') return location.pathname.startsWith('/admin/sales');
        if (path === '/admin/suppliers') return location.pathname.startsWith('/admin/suppliers');
        if (path === '/admin/purchases') return location.pathname.startsWith('/admin/purchases');
        if (path === '/admin/users') return location.pathname.startsWith('/admin/users');
        if (path === '/admin/customers') return location.pathname.startsWith('/admin/customers');
        if (path === '/admin/validate-coupon') return location.pathname === '/admin/validate-coupon';
        if (path === '/admin/ai-prediction') return location.pathname.startsWith('/admin/ai-prediction');
        return location.pathname === path;
    };

    return (
        <aside className={`bg-[#155c27] text-white min-h-screen fixed left-0 top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="p-6">
                <div className={`mb-8 ${isCollapsed ? 'space-y-4' : 'flex items-start justify-between gap-3'}`}>
                    <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
                        {!isCollapsed ? (
                            <BrandLogo className="h-10 w-auto" />
                        ) : (
                            <ShoppingBag className="w-8 h-8 text-[#f5d800] flex-shrink-0" />
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="p-2 rounded-lg bg-[#0d3d1a] hover:bg-[#0d3d1a]/80 text-gray-200 transition-colors"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                    </button>
                </div>

                {!isCollapsed ? (
                    <div className="mb-5 px-3 py-2.5 bg-[#0d3d1a] rounded-lg border border-white/10">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-300">Logged in as</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-[#f5d800] text-[#155c27] text-xs font-bold flex items-center justify-center">
                                    {getInitials(user?.name || '')}
                                </div>
                                <p className="font-semibold text-[13.5px] tracking-[0.01em] truncate">{user?.name || 'User'}</p>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#f5d800] text-[#155c27] capitalize border border-[#f5d800] font-semibold tracking-[0.01em]">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 flex justify-center">
                        <span className="text-xs px-2 py-0.5 rounded bg-[#f5d800] text-[#155c27] capitalize border border-[#f5d800] font-semibold" title={user?.role || 'User'}>
                            {user?.role?.[0]?.toUpperCase() || 'U'}
                        </span>
                    </div>
                )}

                <nav>
                    {filteredSections.map((section, sectionIndex) => (
                        <div key={section.label} className={`${sectionIndex > 0 ? 'mt-3 pt-3 border-t border-white/10' : ''}`}>
                            {!isCollapsed && (
                                <p className="px-3 mb-1 text-[10px] uppercase tracking-[0.12em] text-gray-300">
                                    {section.label}
                                </p>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            title={item.name}
                                            className={`flex items-center ${isCollapsed ? 'justify-center px-2.5' : 'gap-3 px-3.5'} py-2.5 rounded-md transition-all ${active
                                                ? 'bg-[#f5d800] text-[#155c27] font-semibold shadow-md'
                                                : 'text-gray-200 hover:bg-[#0d3d1a] hover:text-white'
                                                }`}
                                        >
                                            <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                                            {!isCollapsed && <span className="font-medium text-[13.5px] tracking-[0.01em]">{item.name}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;



