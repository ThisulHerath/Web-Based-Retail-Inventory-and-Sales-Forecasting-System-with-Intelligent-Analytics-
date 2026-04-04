import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BusinessAssistantBot from '../components/BusinessAssistantBot';
import { useEffect, useState } from 'react';

const DashboardLayout = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        return localStorage.getItem('adminSidebarCollapsed') === 'true';
    });

    // Force light mode for admin dashboard
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        root.classList.add('light');
    }, []);

    useEffect(() => {
        localStorage.setItem('adminSidebarCollapsed', String(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            />
            <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Navbar />
                <main className="p-6">{children}</main>
            </div>
            <BusinessAssistantBot />
        </div>
    );
};

export default DashboardLayout;
