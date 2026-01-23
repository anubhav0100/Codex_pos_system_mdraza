import React, { useState } from 'react';

export const ContactUs: React.FC = () => {
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for contacting us! We will get back to you soon.');
        setFormState({ name: '', email: '', message: '' });
    };

    return (
        <section id="contact" className="section" style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 0% 100%, rgba(14, 165, 233, 0.08) 0%, transparent 50%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <h2 className="section-title">Contact Us</h2>
                <p className="section-subtitle">We'd love to hear from you. Get in touch with us!</p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '3rem',
                    alignItems: 'stretch'
                }}>
                    {/* Contact Info */}
                    <div className="glass-panel" style={{
                        padding: '3rem',
                        borderRadius: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: '2.5rem',
                                marginBottom: '1rem',
                                color: 'var(--primary-dark)',
                                fontWeight: 700
                            }}>Reach Out to Us</h3>
                            <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', lineHeight: 1.6, fontFamily: "'Lato', sans-serif" }}>
                                Begin your journey to holistic wellness. Our Ayurvedic experts are here to guide you.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            {[
                                { icon: "🌿", title: "Visit Our Center", text: "123 Health Avenue, Medical District, City, Country" },
                                { icon: "🍂", title: "Consult-a-Vaidya", text: "+1 (555) 123-4567" },
                                { icon: "🪷", title: "Email Inquiry", text: "namaste@nirogyaayurveda.com" }
                            ].map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '12px',
                                        background: 'rgba(21, 128, 61, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        color: 'var(--primary-dark)',
                                        flexShrink: 0,
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        border: '1px solid rgba(180, 83, 9, 0.2)'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-dark)', fontFamily: "'Playfair Display', serif" }}>{item.title}</h4>
                                        <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: 1.5 }}>{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="glass-panel"
                        style={{
                            padding: '3rem',
                            borderRadius: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            background: 'white'
                        }}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Send a Message</h3>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-dark)' }}>Full Name</label>
                            <input
                                type="text"
                                required
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    border: '2px solid transparent',
                                    backgroundColor: 'var(--secondary-color)',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.borderColor = 'var(--primary-color)';
                                    e.target.style.boxShadow = 'var(--shadow-sm)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.backgroundColor = 'var(--secondary-color)';
                                    e.target.style.borderColor = 'transparent';
                                    e.target.style.boxShadow = 'none';
                                }}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-dark)' }}>Email Address</label>
                            <input
                                type="email"
                                required
                                value={formState.email}
                                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    border: '2px solid transparent',
                                    backgroundColor: 'var(--secondary-color)',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.borderColor = 'var(--primary-color)';
                                    e.target.style.boxShadow = 'var(--shadow-sm)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.backgroundColor = 'var(--secondary-color)';
                                    e.target.style.borderColor = 'transparent';
                                    e.target.style.boxShadow = 'none';
                                }}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-dark)' }}>Message</label>
                            <textarea
                                required
                                rows={4}
                                value={formState.message}
                                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    border: '2px solid transparent',
                                    backgroundColor: 'var(--secondary-color)',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.borderColor = 'var(--primary-color)';
                                    e.target.style.boxShadow = 'var(--shadow-sm)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.backgroundColor = 'var(--secondary-color)';
                                    e.target.style.borderColor = 'transparent';
                                    e.target.style.boxShadow = 'none';
                                }}
                                placeholder="Write your message here..."
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '1rem',
                            fontSize: '1.1rem',
                            letterSpacing: '0.5px'
                        }}>
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};
