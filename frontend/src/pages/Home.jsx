import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import axios from 'axios';

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');
        try {
            await axios.post('http://localhost:8000/contact', formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Email send failed:', error);
            setStatus('error');
            setErrorMessage(error.response?.data?.message || error.message || 'Failed to send message');
        }
    };

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    return (
        <div className="landing-page" style={{
            background: 'var(--bg-page)',
            color: 'var(--text-main)',
            minHeight: '100vh',
            scrollBehavior: 'smooth'
        }}>
            <LandingNavbar />

            {/* Hero Section */}
            <section id="home" style={{
                minHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '120px 2rem 60px', /* Added padding top to account for navbar, bottom to reduce gap */
                position: 'relative',
                overflow: 'hidden',
                background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
            }}>
                <div className="animate-fade-up" style={{ zIndex: 10, maxWidth: '900px' }}>
                    <h1 className="hero-title" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', fontWeight: 900, lineHeight: 1.1 }}>
                        Protecting Our Forests with <br />
                        <span className="text-gradient">Intelligent Surveillance</span>
                    </h1>
                    <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
                        Sentinel AI leverages cutting-edge satellite imagery and neural networks to detect forest fires
                        at their earliest stages, saving ecosystems and lives.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            className="btn-premium btn-primary tap-effect"
                            style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}
                            onClick={() => navigate('/login')}
                        >
                            <i className="fas fa-rocket" style={{ marginRight: '10px' }}></i> Get Started
                        </button>

                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section id="impact" style={{ padding: '60px 2rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Global <span className="text-gradient">Impact</span></h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>The devastating consequences of forest fires on our planet.</p>
                    </div>

                    <div className="impact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        <ImpactCard
                            icon="fa-biohazard"
                            title="Biodiversity Loss"
                            desc="Every year, millions of acres of wildlife habitat are destroyed, pushing thousands of species toward extinction."
                            onClick={() => navigate('/impact/biodiversity')}
                        />
                        <ImpactCard
                            icon="fa-cloud-sun"
                            title="Carbon Emissions"
                            desc="Forest fires release billions of tons of CO2, significantly accelerating global climate change."
                            onClick={() => navigate('/impact/carbon')}
                        />
                        <ImpactCard
                            icon="fa-house-damage"
                            title="Economic Toll"
                            desc="Beyond ecological damage, fires cost billions in property loss and firefighting resources worldwide."
                            onClick={() => navigate('/impact/economic')}
                        />
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" style={{ padding: '100px 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem' }}>About <span className="text-gradient">Sentinel AI</span></h2>
                        <p className="about-text" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
                            Our mission is to bridge the gap between satellite technology and environmental conservation.
                            By utilizing high-resolution imagery from the Sentinel-2 constellation and custom-trained
                            deep learning models, we provide real-time thermal anomaly detection with unprecedented accuracy.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <CheckItem text="24/7 Global Satellite Monitoring" />
                            <CheckItem text="98.5% Early Detection Accuracy" />
                            <CheckItem text="Instant Alert System for Authorities" />
                            <CheckItem text="Comprehensive Historical Fire Data" />
                        </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <div className="glass" style={{
                            height: '400px',
                            borderRadius: '30px',
                            border: '1px solid var(--glass-border)',
                            background: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop) no-repeat center center/cover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                        }}>
                            <i className="fas fa-satellite" style={{ fontSize: '120px', color: 'rgba(52, 211, 153, 0.3)' }}></i>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" style={{ padding: '100px 2rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Get in <span className="text-gradient">Touch</span></h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Have questions or want to partner with us for forest conservation?</p>

                    <form style={{ display: 'grid', gap: '20px' }} onSubmit={handleSubmit}>
                        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <input
                                type="text"
                                placeholder="Full Name"
                                style={inputStyle}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                style={inputStyle}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Subject"
                            style={inputStyle}
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Your Message"
                            rows="5"
                            style={inputStyle}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                        ></textarea>
                        <button
                            type="submit"
                            className="btn-premium btn-primary tap-effect"
                            style={{ padding: '1.2rem', fontSize: '1.1rem' }}
                            disabled={status === 'sending'}
                        >
                            {status === 'sending' ? 'Sending...' : 'Send Message'}
                        </button>
                        {status === 'success' && <p style={{ color: '#10b981', marginTop: '10px' }}>Message sent successfully!</p>}
                        {status === 'error' && (
                            <div style={{ color: '#ef4444', marginTop: '10px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                                <p style={{ fontWeight: 'bold' }}>Failed to send message:</p>
                                <p style={{ fontSize: '0.9rem' }}>{errorMessage}</p>
                            </div>
                        )}
                    </form>
                </div>
            </section>

            <footer style={{ padding: '40px 2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>© 2026 Sentinel AI Forest Protection. All rights reserved.</p>
            </footer>

            <style>{`
                @media (max-width: 768px) {
                    .hero-title { font-size: 2.5rem !important; }
                    .contact-grid { grid-template-columns: 1fr !important; }
                    .impact-grid { grid-template-columns: 1fr !important; }
                    .about-text { padding-bottom: 40px; }
                }
            `}</style>
        </div>
    );
}

function ImpactCard({ icon, title, desc, onClick }) {
    return (
        <div
            className="glass-card hover-lift"
            style={{ padding: '40px', textAlign: 'center', cursor: 'pointer' }}
            onClick={onClick}
        >
            <div style={{
                width: '70px', height: '70px', borderRadius: '20px',
                background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 25px'
            }}>
                <i className={`fas ${icon}`} style={{ fontSize: '30px' }}></i>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '15px' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
        </div>
    );
}

function CheckItem({ text }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fas fa-check-circle" style={{ color: 'var(--primary)' }}></i>
            <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
    );
}

const inputStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '1rem',
    color: 'var(--text-main)',
    outline: 'none',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease',
    width: '100%'
};
