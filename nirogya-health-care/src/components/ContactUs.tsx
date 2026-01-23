import React, { useState } from 'react';

export const ContactUs: React.FC = () => {
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for contacting us! We will get back to you soon.');
        setFormState({ name: '', email: '', message: '' });
    };

    return (
        <section id="contact" className="section" style={{ backgroundColor: 'var(--white)' }}>
            <div className="container">
                <h2 className="section-title">Contact Us</h2>
                <p className="section-subtitle">We'd love to hear from you. Get in touch with us!</p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '4rem',
                    alignItems: 'start'
                }}>
                    {/* Contact Info */}
                    <div>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>Get In Touch</h3>
                            <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                                Have questions about our products or services? Our team is here to help.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {[
                                { icon: "📍", title: "Address", text: "123 Health Avenue, Medical District, City, Country" },
                                { icon: "📞", title: "Phone", text: "+1 (555) 123-4567" },
                                { icon: "✉️", title: "Email", text: "info@nirogyahealthcare.com" }
                            ].map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                    <div>
                                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.title}</h4>
                                        <p style={{ color: 'var(--text-light)' }}>{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            backgroundColor: 'var(--secondary-color)',
                            padding: '2rem',
                            borderRadius: '1rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                            <input
                                type="text"
                                required
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1',
                                    outline: 'none',
                                }}
                                placeholder="Your Name"
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                            <input
                                type="email"
                                required
                                value={formState.email}
                                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1',
                                    outline: 'none',
                                }}
                                placeholder="your.email@example.com"
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Message</label>
                            <textarea
                                required
                                rows={4}
                                value={formState.message}
                                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1',
                                    outline: 'none',
                                    resize: 'vertical'
                                }}
                                placeholder="How can we help you?"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};
