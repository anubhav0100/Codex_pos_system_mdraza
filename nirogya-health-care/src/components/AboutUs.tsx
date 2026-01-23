import React from 'react';

export const AboutUs: React.FC = () => {
    return (
        <section id="about" className="section">
            <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <h2 className="section-title">About Nirogya Health Care</h2>
                    <p className="section-subtitle">Dedicated to improving lives through innovation and care</p>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', lineHeight: 1.8 }}>
                        At Nirogya Health Care, we believe that good health is the foundation of a happy life.
                        Established with a vision to make premium healthcare accessible to everyone, we specialize
                        in providing top-tier medical equipment, diagnostic tools, and health solutions utilizing
                        cutting-edge technology. Our team of experts works tirelessly to ensure that every product
                        we offer meets the highest standards of safety and efficacy.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {[
                        { title: "Our Mission", text: "To empower individuals and healthcare professionals with reliable, affordable, and advanced medical solutions." },
                        { title: "Our Vision", text: "To be a global leader in healthcare innovation, ensuring a healthier future for generations to come." },
                        { title: "Our Values", text: "Integrity, Excellence, Compassion, and Customer-Centricity are at the heart of everything we do." }
                    ].map((item, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: 'white',
                                padding: '2rem',
                                borderRadius: '1rem',
                                boxShadow: 'var(--shadow-md)',
                                textAlign: 'center'
                            }}
                        >
                            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-light)' }}>{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
