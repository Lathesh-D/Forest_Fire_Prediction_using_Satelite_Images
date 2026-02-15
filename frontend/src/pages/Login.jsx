import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://127.0.0.1:8000";

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API_URL}/login`, { username, password });
            if (res.status === 200) {
                const data = res.data;
                localStorage.setItem('username', data.username);
                localStorage.setItem('userEmail', data.email || '');
                localStorage.setItem('userPhone', data.phone || '');
                localStorage.setItem('userRole', 'Standard User'); // Backend doesn't return role yet, default ok.

                if (data.profile_image) {
                    localStorage.setItem('profileImage', data.profile_image);
                } else {
                    localStorage.removeItem('profileImage');
                }

                // Dispatch profile update event to sync Navbar immediately
                window.dispatchEvent(new Event('profileUpdated'));

                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Connection Failed");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <i className="fas fa-tree"></i>
                    <h1>Welcome Back</h1>
                    <p>Sign in to your Sentinel account</p>
                </div>

                <div className="auth-form">
                    <div className="field-group">
                        <label className="auth-label" htmlFor="loginUsername">Username</label>
                        <input
                            className="auth-input"
                            type="text"
                            id="loginUsername"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="field-group">
                        <label className="auth-label" htmlFor="loginPassword">Password</label>
                        <input
                            className="auth-input"
                            type="password"
                            id="loginPassword"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button className="btn-premium btn-primary" onClick={handleLogin}>
                        <i className="fas fa-sign-in-alt"></i> Sign In
                    </button>

                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i> {error}
                        </div>
                    )}

                    <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    </div>

                    <button className="btn-premium btn-secondary" onClick={() => navigate('/register')}>
                        Don't have an account? Create one
                    </button>
                </div>
            </div>
        </div>
    );
}
