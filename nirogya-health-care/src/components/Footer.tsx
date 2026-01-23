import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer style={{ backgroundColor: '#1e293b', color: 'white', padding: '4rem 0 2rem' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '3rem',
                    marginBottom: '3rem'
                }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Nirogya Health</h3>
                        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
                            Your trusted partner in healthcare. Providing world-class medical equipment and services.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Quick Links</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {['Home', 'Products', 'About', 'Contact'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    style={{ color: '#94a3b8', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Services</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#94a3b8' }}>
                            <span>Medical Supply</span>
                            <span>Diagnostics</span>
                            <span>Consultation</span>
                            <span>Emergency Support</span>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Connect</h4>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        color: 'white',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                >
                                    {social[0]}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '2rem',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '0.9rem'
                }}>
                    <p>&copy; {new Date().getFullYear()} Nirogya Health Care. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
