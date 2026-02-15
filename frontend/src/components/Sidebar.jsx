import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [username, setUsername] = useState('User');
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        const updateUserData = () => {
            const storedUser = localStorage.getItem('username');
            const storedImage = localStorage.getItem('profileImage');
            if (storedUser) setUsername(storedUser);
            setProfileImage(storedImage || null);
        };

        updateUserData();
        window.addEventListener('profileUpdated', updateUserData);
        return () => window.removeEventListener('profileUpdated', updateUserData);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div
            className={`sidebar glass ${isOpen ? 'open' : ''}`}
            style={{
                /* Styles moved to CSS for responsiveness */
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                zIndex: 50
            }}
        >
            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass" style={{
                        background: 'rgba(30, 41, 59, 0.95)', padding: '24px', borderRadius: '16px',
                        maxWidth: '320px', width: '90%', textAlign: 'center',
                        border: '1px solid var(--glass-border)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'rgba(248, 81, 73, 0.15)', color: 'var(--error)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <i className="fas fa-sign-out-alt" style={{ fontSize: '24px' }}></i>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'white' }}>Log Out?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Are you sure you want to end your session?
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)',
                                    background: 'transparent', color: 'white', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                    background: 'var(--error)', color: 'white', cursor: 'pointer', fontWeight: 600
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="logo-area" style={{
                marginBottom: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        background: 'var(--primary)',
                        padding: '8px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i className="fas fa-tree" style={{ fontSize: '24px', color: 'var(--text-inverse)' }}></i>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }} className="text-gradient">
                        SafeForest
                    </span>
                </div>

                <div
                    className="tap-effect"
                    onClick={onClose}
                    style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                    <i className="fas fa-chevron-left" style={{ fontSize: '24px' }}></i>
                </div>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                marginBottom: '32px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: profileImage ? 'transparent' : 'linear-gradient(135deg, var(--primary) 0%, #34d399 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    {profileImage ? (
                        <img
                            src={profileImage}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <i className="fas fa-user-shield" style={{ fontSize: '24px', color: 'white' }}></i>
                    )}
                </div>
                <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>{username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                        Online
                    </div>
                </div>
            </div>

            <div className="nav-links" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {/* Home Button triggers Logout Modal */}
                <div
                    className="nav-link-item tap-effect"
                    onClick={() => setShowLogoutModal(true)}
                    style={{ cursor: 'pointer' }}
                >
                    <i className="fas fa-home"></i>
                    <span style={{ fontWeight: 500 }}>Home</span>
                </div>
            </div>

            <div
                className="logout-btn tap-effect"
                onClick={handleLogout}
                style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: 'var(--error)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: 'auto',
                    border: '1px solid transparent',
                    transition: 'all 0.2s ease',
                    background: 'rgba(248, 81, 73, 0)'
                }}
            >
                <i className="fas fa-sign-out-alt" style={{ fontSize: '20px' }}></i>
                <span style={{ fontWeight: 500 }}>Logout</span>
            </div>

            <style>{`
                .nav-link-item {
                    text-decoration: none;
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    borderRadius: 12px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid transparent;
                }
                .nav-link-item:hover {
                    color: var(--text-main);
                    background: rgba(255,255,255,0.05);
                }
                .nav-link-item.active {
                    color: var(--primary);
                    background: var(--primary-glow);
                    border-color: rgba(16, 185, 129, 0.2);
                }
                .logout-btn:hover {
                    background: rgba(248, 81, 73, 0.1);
                }
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}

function SidebarItem({ to, icon, label, end }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
        >
            {icon}
            <span style={{ fontWeight: 500 }}>{label}</span>
        </NavLink>
    );
}
