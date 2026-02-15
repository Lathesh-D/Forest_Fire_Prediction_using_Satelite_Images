import { useParams, useNavigate } from 'react-router-dom';

const impactData = {
    biodiversity: {
        title: "Biodiversity Loss",
        subtitle: "A Crisis for Wildlife and Ecosystems",
        description: "Forest fires cause immediate and long-term damage to ecosystems. The destruction of habitats forces wildlife to flee, often leading to injury or death. Beyond the immediate loss of life, the alteration of the landscape can lead to soil erosion, water pollution, and a loss of food sources, pushing vulnerable species toward extinction.",
        stats: [
            { label: "Wildlife Impacted", value: "3B+" },
            { label: "Species at Risk", value: "4000+" },
            { label: "Habitat Recovery", value: "50+ Years" }
        ],
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        icon: "fa-biohazard",
        image: "https://images.unsplash.com/photo-1542601906990-24d4ef1d1024?q=80&w=1000&auto=format&fit=crop"
    },
    carbon: {
        title: "Carbon Emissions",
        subtitle: "Accelerating Global Climate Change",
        description: "When forests burn, the carbon stored in trees and soil is released into the atmosphere as carbon dioxide and other greenhouse gases. This creates a vicious cycle: climate change leads to more fires, and more fires lead to more climate change. The smoke from these fires also degrades air quality, affecting human health hundreds of miles away.",
        stats: [
            { label: "CO2 Released", value: "8B Tons" },
            { label: "Global Warming Contribution", value: "20%" },
            { label: "Air Quality Index Impact", value: "Severe" }
        ],
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        icon: "fa-cloud-sun",
        image: "https://images.unsplash.com/photo-1611273426721-df536627c8b0?q=80&w=1000&auto=format&fit=crop"
    },
    economic: {
        title: "Economic Toll",
        subtitle: "The Financial Cost of Destruction",
        description: "The economic impact of forest fires extends far beyond the cost of firefighting. It includes the destruction of homes, businesses, and infrastructure, as well as the loss of timber resources and tourism revenue. Insurance costs rise, and local economies can struggle to recover for decades after a major fire event.",
        stats: [
            { label: "Annual Global Cost", value: "$350B+" },
            { label: "Property Damage", value: "High" },
            { label: "Firefighting Expenses", value: "$50B+" }
        ],
        gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
        icon: "fa-house-damage",
        image: "https://images.unsplash.com/photo-1604147495798-57beb5d6af88?q=80&w=1000&auto=format&fit=crop"
    }
};

export default function ImpactDetail() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const topicOrder = ['biodiversity', 'carbon', 'economic'];
    const currentIndex = topicOrder.indexOf(topicId);
    const data = impactData[topicId];

    const goToNext = () => {
        const nextIndex = (currentIndex + 1) % topicOrder.length;
        navigate(`/impact/${topicOrder[nextIndex]}`);
    };

    const goToPrev = () => {
        const prevIndex = (currentIndex - 1 + topicOrder.length) % topicOrder.length;
        navigate(`/impact/${topicOrder[prevIndex]}`);
    };

    if (!data) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', color: 'var(--text-main)' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Topic Not Found</h2>
                    <button className="btn-premium btn-primary" onClick={() => navigate('/')}>Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{
            minHeight: '100vh',
            background: 'var(--bg-page)',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <button
                onClick={() => navigate('/#impact')}
                style={{
                    position: 'absolute',
                    top: '30px',
                    left: '30px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid var(--glass-border)',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600
                }}
                className="hover-lift"
            >
                <i className="fas fa-arrow-left"></i> Back to Impact
            </button>

            {/* Navigation Arrows */}

            <button
                onClick={goToNext}
                className="hover-scale"
                style={{
                    position: 'fixed',
                    right: '40px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 50,
                    backdropFilter: 'blur(10px)',
                    fontSize: '1.5rem'
                }}
            >
                <i className="fas fa-chevron-right"></i>
            </button>

            {/* Hero Header */}
            <div style={{
                height: '60vh',
                background: `radial-gradient(circle at center, transparent 0%, var(--bg-page) 100%), ${data.gradient}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'url(/path/to/placeholder-texture.png)', // Placeholder for texture if needed
                    opacity: 0.1
                }}></div>

                <i className={`fas ${data.icon}`} style={{ fontSize: '300px', opacity: 0.1, position: 'absolute' }}></i>

                <div className="animate-fade-up" style={{ textAlign: 'center', zIndex: 10, padding: '0 2rem' }}>
                    <h1 style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '1rem', textShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                        {data.title}
                    </h1>
                    <p style={{ fontSize: '1.8rem', opacity: 0.9, fontWeight: 300 }}>{data.subtitle}</p>
                </div>
            </div>

            {/* Content Section */}
            <div style={{
                maxWidth: '1000px',
                margin: '-100px auto 50px',
                position: 'relative',
                zIndex: 20
            }}>
                <div className="glass" style={{ padding: '60px', borderRadius: '30px' }}>
                    <p style={{ fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '50px' }}>
                        {data.description}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                        {data.stats.map((stat, index) => (
                            <div key={index} style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '30px',
                                borderRadius: '20px',
                                textAlign: 'center',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
