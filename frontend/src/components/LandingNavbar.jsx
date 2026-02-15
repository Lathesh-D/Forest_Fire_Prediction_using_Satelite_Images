import { useNavigate } from 'react-router-dom';

export default function LandingNavbar() {
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        if (window.location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <nav className="glass" style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '1200px',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            borderRadius: '20px',
            zIndex: 1000,
            border: '1px solid var(--glass-border)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                <div style={{
                    width: '35px',
                    height: '35px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, #34d399 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <i className="fas fa-fire-extinguisher" style={{ color: 'white', fontSize: '18px' }}></i>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }} className="text-gradient">Sentinel AI</h2>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <NavLink label="Home" onClick={() => navigate('/')} />
                <NavLink label="About" onClick={() => scrollToSection('about')} />
                <NavLink label="Impact" onClick={() => scrollToSection('impact')} />
                <NavLink label="Contact" onClick={() => scrollToSection('contact')} />

            </div>
        </nav>
    );
}

function NavLink({ label, onClick }) {
    return (
        <span
            onClick={onClick}
            style={{
                color: 'var(--text-secondary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--text-main)'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
            {label}
        </span>
    );
}
