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
                    name: 'Products',
                    path: '/admin/products',
                    icon: Package,
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
        <aside className={`bg-[#155c27] text-white min-h-screen fixed left-0 top-0 transition-all duration-300 shadow-2xl ${isCollapsed ? 'w-24' : 'w-64'}`}>
            <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'flex-col'}`}>
                {/* Header Section with Toggle Button */}
                <div className={`w-full px-4 py-6 border-b border-white/10 ${isCollapsed ? 'flex flex-col items-center gap-4' : 'flex items-start justify-between gap-3'}`}>
                    {/* Logo */}
                    <div className={`flex items-center justify-center ${isCollapsed ? 'w-full' : ''}`}>
                        {!isCollapsed ? (
                            <BrandLogo className="h-10 w-auto" />
                        ) : (
                            <ShoppingBag className="w-8 h-8 text-[#f5d800]" />
                        )}
                    </div>
                    
                    {/* Toggle Button - More Visible */}
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                           className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f5d800] hover:bg-[#e6c700] text-[#155c27] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                        {!isCollapsed && <span className="font-bold text-xs whitespace-nowrap">Collapse</span>}
                    </button>
                </div>

                {/* User Info Section */}
                {!isCollapsed ? (
                    <div className="w-full px-4 py-4 border-b border-white/10">
                        <div className="px-3 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-gray-300 font-bold">Logged in as</p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-[#f5d800] text-[#155c27] text-xs font-bold flex items-center justify-center shadow-md">
                                        {getInitials(user?.name || '')}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm truncate">{user?.name || 'User'}</p>
                                        <p className="text-xs text-gray-300">Staff</p>
                                    </div>
                                </div>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-[#f5d800] text-[#155c27] capitalize font-bold">
                                    {user?.role?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full px-4 py-4 border-b border-white/10 flex justify-center">
                        <div className="w-12 h-12 rounded-lg bg-[#f5d800] text-[#155c27] font-bold flex items-center justify-center shadow-md text-lg" title={`${user?.name} (${user?.role})`}>
                            {getInitials(user?.name || '')}
                        </div>
                    </div>
                )}

                {/* Navigation Section */}
                <nav className={`flex-1 w-full ${isCollapsed ? 'py-4 px-2' : 'p-4'}`}>
                    {filteredSections.map((section, sectionIndex) => (
                        <div key={section.label} className={isCollapsed ? 'flex flex-col gap-2' : 'mb-4'}>
                            {!isCollapsed && sectionIndex > 0 && <div className="mb-4 border-t border-white/10"></div>}
                            
                            {!isCollapsed && (
                                <p className="px-3 mb-2 text-[11px] uppercase tracking-[0.15em] text-white/60 font-bold">
                                    {section.label}
                                </p>
                            )}
                            
                            <div className={isCollapsed ? 'flex flex-col gap-2' : 'space-y-1'}>
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            title={item.name}
                                            className={`group relative flex items-center ${isCollapsed ? 'justify-center w-full' : 'justify-start gap-3'} px-3 py-2.5 rounded-lg transition-all duration-200 transform ${active
                                                ? 'bg-[#f5d800] text-[#155c27] font-bold shadow-lg scale-105'
                                                : 'text-gray-200 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${active ? 'drop-shadow-md' : 'group-hover:scale-110'}`} strokeWidth={1.8} />
                                            {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                                            
                                            {/* Tooltip for collapsed state */}
                                            {isCollapsed && (
                                                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                    {item.name}
                                                </div>
                                            )}
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



