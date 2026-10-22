import useFocusTrap from '../hooks/useFocusTrap';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BusinessAssistantBot from '../components/BusinessAssistantBot';
import { Suspense, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const { pathname } = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true');
    const [mobileOpen, setMobileOpen] = useState(false);
    useFocusTrap(mobileOpen, '#admin-navigation', () => setMobileOpen(false), '#admin-menu-trigger');
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }, []);
    useEffect(() => localStorage.setItem('adminSidebarCollapsed', String(isSidebarCollapsed)), [isSidebarCollapsed]);
    useEffect(() => setMobileOpen(false), [pathname]);
    useEffect(() => {
        if (!mobileOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const close = (event) => { if (event.key === 'Escape') setMobileOpen(false); };
        document.addEventListener('keydown', close);
        return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', close); };
    }, [mobileOpen]);
    const segments = pathname.split('/').filter(Boolean).slice(1);
    const label = (segment) => segment === 'ai-prediction' ? 'AI Prediction' : segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return (
        <div className={`admin-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <a href="#main-content" className="skip-link">Skip to content</a>
            {mobileOpen && <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
            <Sidebar isCollapsed={isSidebarCollapsed && !mobileOpen} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)} />
            <div className="admin-workspace" inert={mobileOpen ? '' : undefined}>
                <Navbar mobileOpen={mobileOpen} onMenuClick={() => setMobileOpen(prev => !prev)} />
                <main id="main-content" className="admin-main" tabIndex={-1}>
                    <div className="workspace-atmosphere no-print" aria-hidden="true"><span /><span /><span /></div>
                    <nav aria-label="Breadcrumb" className="breadcrumbs no-print">
                        <Link to="/admin/dashboard">Workspace</Link>
                        {segments.map((segment, index) => (
                            <span key={index} className="inline-flex items-center gap-2">
                                <ChevronRight size={14} aria-hidden="true" />
                                {index === 0 && segments.length > 1 ? <Link to={`/admin/${segment}`}>{label(segment)}</Link> : <span aria-current={index === segments.length - 1 ? 'page' : undefined}>{/^[a-f\d]{24}$/i.test(segment) ? 'Details' : label(segment)}</span>}
                            </span>
                        ))}
                    </nav>
                    <div key={pathname} className="page-content route-enter"><Suspense fallback={<div role="status" className="route-loading">Loading workspace…</div>}>{children}</Suspense></div>
                </main>
            </div>
            <BusinessAssistantBot />
        </div>
    );
};
export default DashboardLayout;
