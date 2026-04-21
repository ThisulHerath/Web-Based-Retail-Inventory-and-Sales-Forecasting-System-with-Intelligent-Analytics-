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
        <div className="flex min-h-screen">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            />
            <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-24' : 'ml-64'}`}>
                <Navbar />
                <main 
                    className="p-6 relative min-h-[calc(100vh-73px)]"
                    style={{
                        background: `
                            linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(245, 245, 245, 0.95) 100%),
                            url('/7supercity-logo.jpg')
                        `,
                        backgroundSize: '120%, cover',
                        backgroundPosition: 'center 20%',
                        backgroundAttachment: 'fixed',
                    }}
                >
                    {/* Blurred background overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: `url('/7supercity-logo.jpg')`,
                            backgroundSize: '120%',
                            backgroundPosition: 'center 20%',
                            backgroundAttachment: 'fixed',
                            filter: 'blur(12px)',
                            opacity: 0.15,
                            zIndex: 0,
                        }}
                    />
                    
                    {/* Content wrapper with higher z-index */}
                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>
            <BusinessAssistantBot />
        </div>
    );
};

export default DashboardLayout;
