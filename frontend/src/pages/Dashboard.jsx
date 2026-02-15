import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const location = useLocation();

    // Close sidebar on mobile route change
    useEffect(() => {
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    }, [location]);

    return (
        <div className="main-layout">
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isSidebarOpen && window.innerWidth <= 768 ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Navbar isSidebarOpen={isSidebarOpen} onMenuClick={() => setIsSidebarOpen(true)} />

                <div className="main-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
