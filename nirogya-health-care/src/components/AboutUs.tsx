import React from 'react';

export const AboutUs: React.FC = () => {
    return (
        <section id="about" className="section">
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="glass-panel" style={{
                    padding: '4rem 2rem',
                    borderRadius: '2rem',
                    textAlign: 'center',
                    maxWidth: '900px',
                    margin: '0 auto 4rem',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
                    border: '1px solid var(--accent-color)'
                }}>
                    <h2 className="section-title" style={{ marginBottom: '1rem' }}>Our Heritage</h2>
                    <p className="section-subtitle" style={{ marginBottom: '2rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--primary-dark)' }}>Preserving the 5,000-year-old science of life</p>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', lineHeight: 1.8, maxWidth: '800px', margin: '0 auto', fontFamily: "'Lato', sans-serif" }}>
                        At Nirogya Ayurveda, we bridge the gap between ancient wisdom and modern lifestyle.
                        Our formulations are rooted in authentic Ayurvedic texts, using potent herbs sourced directly from nature.
                        We believe that true health is a harmony of body, mind, and spirit.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {[
                        { title: "Purity", text: "100% natural, ethically sourced ingredients free from harmful chemicals.", icon: "🌿" },
                        { title: "Tradition", text: "Recipes inspired by ancient Samhitas and perfected by generations of Vaidyas.", icon: "📜" },
                        { title: "Wellness", text: "Holistic healing that treats the root cause, not just the symptoms.", icon: "✨" }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="glass-panel"
                            style={{
                                padding: '2.5rem',
                                borderRadius: '1.5rem',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = 'var(--primary-color)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                            }}
                        >
                            <div style={{
                                fontSize: '3rem',
                                marginBottom: '1.5rem',
                                background: 'var(--primary-light)',
                                width: '80px',
                                height: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                {item.icon}
                            </div>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark)', fontSize: '1.5rem', fontWeight: 700 }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-light)', fontSize: '1.05rem' }}>{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
