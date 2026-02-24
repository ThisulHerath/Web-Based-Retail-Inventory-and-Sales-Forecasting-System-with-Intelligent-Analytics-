import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useEffect } from 'react';

const DashboardLayout = ({ children }) => {
    // Force light mode for admin dashboard
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        root.classList.add('light');
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-64">
                <Navbar />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
