import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://127.0.0.1:8000";

export default function Register() {
    const [formData, setFormData] = useState({
        fullname: '', email: '', phone: '', username: '', password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async () => {
        const { fullname, email, phone, username, password } = formData;
        if (!username || !password || !fullname || !email) {
            setError("All fields are required");
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/register`, formData);
            if (res.status === 200) {
                setSuccess("Account created!");
                setError('');
            }
        } catch (err) {
            let msg = err.response?.data?.detail;
            if (Array.isArray(msg)) msg = msg.map(e => e.msg).join(", ");
            setError(msg || "Connection Failed");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <i className="fas fa-user-plus"></i>
                    <h1>Create Account</h1>
                    <p>Join the Sentinel monitoring network</p>
                </div>

                <div className="auth-form">
                    <div className="form-row">
                        <div className="field-group">
                            <label className="auth-label" htmlFor="fullname">Full Name</label>
                            <input
                                className="auth-input"
                                type="text"
                                id="fullname"
                                placeholder="John Doe"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="field-group">
                            <label className="auth-label" htmlFor="phone">Phone</label>
                            <input
                                className="auth-input"
                                type="text"
                                id="phone"
                                placeholder="+1 234..."
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label className="auth-label" htmlFor="email">Email Address</label>
                        <input
                            className="auth-input"
                            type="email"
                            id="email"
                            placeholder="john@example.com"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="field-group">
                            <label className="auth-label" htmlFor="username">Username</label>
                            <input
                                className="auth-input"
                                type="text"
                                id="username"
                                placeholder="johndoe"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="field-group">
                            <label className="auth-label" htmlFor="password">Password</label>
                            <input
                                className="auth-input"
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button className="btn-premium btn-primary" onClick={handleRegister}>
                        <i className="fas fa-check-circle"></i> Create Account
                    </button>

                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i> {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            <i className="fas fa-check-circle"></i> {success}
                            <span
                                style={{ textDecoration: 'underline', cursor: 'pointer', marginLeft: 'auto', fontWeight: '700' }}
                                onClick={() => navigate('/login')}
                            >
                                Login now
                            </span>
                        </div>
                    )}

                    <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    </div>

                    <button className="btn-premium btn-secondary" onClick={() => navigate('/login')}>
                        Already have an account? Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}
