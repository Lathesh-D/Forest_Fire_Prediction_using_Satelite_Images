import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export default function Navbar({ isSidebarOpen, onMenuClick }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [username, setUsername] = useState('User');
    const [profileImage, setProfileImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        username: 'User',
        email: 'user@example.com',
        role: 'Standard User',
        phone: ''
    });
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const updateProfileData = () => {
            const storedUser = localStorage.getItem('username');
            const storedEmail = localStorage.getItem('userEmail');
            const storedImage = localStorage.getItem('profileImage');
            const storedPhone = localStorage.getItem('userPhone');

            if (storedUser) {
                setUsername(storedUser);
                setEditData(prev => ({
                    ...prev,
                    username: storedUser,
                    email: storedEmail || prev.email,
                    phone: storedPhone || prev.phone
                }));
            }
            // Always update image state
            setProfileImage(storedImage); // using storedImage directly handles null
        };

        // Initial load
        updateProfileData();

        // Listen for updates
        window.addEventListener('profileUpdated', updateProfileData);
        return () => window.removeEventListener('profileUpdated', updateProfileData);
    }, []);

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('token'); // Assuming you have a token or just username for now
            // In this simple app, we are just sending username. In prod, use JWT.

            const payload = {
                username: editData.username,
                email: editData.email,
                phone: editData.phone,
                profile_image: profileImage // This can be large (Base64), might need to handle size limits
            };

            await axios.put('http://127.0.0.1:8000/update-profile', payload);

            localStorage.setItem('username', editData.username);
            localStorage.setItem('userEmail', editData.email);
            localStorage.setItem('userPhone', editData.phone);

            if (profileImage) {
                localStorage.setItem('profileImage', profileImage);
            } else {
                localStorage.removeItem('profileImage');
            }

            // Dispatch event for other components (Sidebar) to update
            window.dispatchEvent(new Event('profileUpdated'));

            setUsername(editData.username);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to save profile. Please try again.");
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setProfileImage(localStorage.getItem('profileImage')); // Revert image
        setEditData(prev => ({ ...prev, username }));
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <>
            <div className="navbar glass animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {!isSidebarOpen && (
                        <button
                            className="tap-effect"
                            onClick={onMenuClick}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                cursor: 'pointer',
                                color: 'var(--text-main)',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '12px'
                            }}
                        >
                            <i className="fas fa-bars" style={{ fontSize: '20px' }}></i>
                        </button>
                    )}
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }} className="text-gradient">Dashboard</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div
                        className="tap-effect"
                        style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                        <i className="fas fa-bell" style={{ fontSize: '20px' }}></i>
                        <span style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-2px',
                            width: '8px',
                            height: '8px',
                            background: 'var(--error)',
                            borderRadius: '50%',
                            border: '2px solid var(--bg-page)'
                        }}></span>
                    </div>

                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative' }}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{username}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>User</div>
                        </div>
                        <div
                            className="tap-effect"
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: profileImage ? 'transparent' : 'linear-gradient(135deg, var(--primary) 0%, #34d399 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px var(--primary-glow)',
                                overflow: 'hidden'
                            }}
                        >
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <i className="fas fa-user-circle" style={{ fontSize: '22px' }}></i>
                            )}
                        </div>
                        <i className="fas fa-chevron-down" style={{ fontSize: '14px', color: 'var(--text-secondary)', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>

                        {showDropdown && (
                            <div
                                className="dropdown-menu"
                                style={{
                                    position: 'absolute',
                                    top: '60px',
                                    right: '0',
                                    background: 'var(--bg-sidebar)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '16px',
                                    boxShadow: 'var(--shadow-lg)',
                                    width: '220px',
                                    overflow: 'hidden',
                                    zIndex: 100,
                                    padding: '8px'
                                }}
                            >
                                <DropdownItem
                                    icon={<i className="fas fa-user" style={{ fontSize: '18px' }}></i>}
                                    label="Profile"
                                    onClick={() => setShowProfileModal(true)}
                                />
                                <DropdownItem
                                    icon={<i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`} style={{ fontSize: '18px' }}></i>}
                                    label={`Theme: ${theme === 'dark' ? 'Light' : 'Dark'}`}
                                    onClick={toggleTheme}
                                />
                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }}></div>
                                <DropdownItem
                                    icon={<i className="fas fa-sign-out-alt" style={{ fontSize: '18px' }}></i>}
                                    label="Logout"
                                    danger
                                    onClick={handleLogout}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showProfileModal && (
                <div
                    className="modal-backdrop"
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    <div
                        className="glass modal-content"
                        style={{
                            maxWidth: '500px',
                            width: '100%',
                            borderRadius: '24px',
                            padding: '32px',
                            position: 'relative',
                            border: '1px solid var(--glass-border)'
                        }}
                    >
                        <button
                            onClick={() => setShowProfileModal(false)}
                            style={{
                                position: 'absolute', top: '24px', right: '24px',
                                cursor: 'pointer', background: 'rgba(255,255,255,0.05)',
                                border: 'none', borderRadius: '50%', width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            <i className="fas fa-times" style={{ fontSize: '20px' }}></i>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '20px',
                                    background: profileImage ? 'transparent' : 'linear-gradient(135deg, var(--primary) 0%, #34d399 100%)',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 8px 24px var(--primary-glow)',
                                    overflow: 'hidden',
                                    border: isEditing ? '2px dashed var(--primary)' : 'none'
                                }}>
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <i className="fas fa-user-circle" style={{ fontSize: '40px' }}></i>
                                    )}
                                </div>
                                {isEditing && (
                                    <label
                                        style={{
                                            position: 'absolute', bottom: '-5px', right: '-5px',
                                            background: 'var(--primary)', color: 'white',
                                            width: '28px', height: '28px', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <i className="fas fa-camera" style={{ fontSize: '12px' }}></i>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>{username}</h2>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    marginTop: '4px', background: 'rgba(16, 185, 129, 0.1)',
                                    color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px',
                                    fontSize: '0.8rem', width: 'fit-content', border: '1px solid rgba(16, 185, 129, 0.2)'
                                }}>
                                    <i className="fas fa-check-circle" style={{ fontSize: '14px' }}></i> Active Account
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <ProfileField
                                label="Username"
                                value={editData.username}
                                isEditing={isEditing}
                                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                            />
                            <ProfileField
                                label="Email"
                                value={editData.email}
                                isEditing={isEditing}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            />
                            <ProfileField
                                label="Role"
                                value={editData.role}
                                isEditing={isEditing}
                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                            />
                            <ProfileField
                                label="Phone"
                                value={editData.phone}
                                isEditing={isEditing}
                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            />
                        </div>

                        <div style={{ marginTop: '40px', display: 'flex', gap: '12px' }}>
                            {isEditing ? (
                                <>
                                    <button
                                        className="btn-premium"
                                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn-premium btn-primary"
                                        style={{ flex: 1 }}
                                        onClick={handleSaveProfile}
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="btn-premium"
                                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
                                        onClick={() => setShowProfileModal(false)}
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        className="btn-premium btn-primary"
                                        style={{ flex: 1 }}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Profile
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function DropdownItem({ icon, label, onClick, danger }) {
    return (
        <div
            className="dropdown-item-hover"
            onClick={onClick}
            style={{
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.9rem',
                borderRadius: '10px',
                color: danger ? 'var(--error)' : 'var(--text-main)',
                transition: 'all 0.2s ease'
            }}
        >
            {icon}
            <span style={{ fontWeight: 500 }}>{label}</span>
            <style>{`
                .dropdown-item-hover:hover {
                    transform: translateX(4px);
                    background: ${danger ? 'rgba(248, 81, 73, 0.1)' : 'rgba(255,255,255,0.05)'};
                }
            `}</style>
        </div>
    );
}

function ProfileField({ label, value, isEditing, onChange }) {
    return (
        <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{label}</label>
            {isEditing ? (
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'white',
                        width: '100%',
                        fontSize: '0.9rem'
                    }}
                />
            ) : (
                <div style={{ fontWeight: 600, color: 'var(--text-main)', minHeight: '38px', display: 'flex', alignItems: 'center' }}>{value || '--'}</div>
            )}
        </div>
    );
}
