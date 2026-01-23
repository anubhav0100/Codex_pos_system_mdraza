import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer style={{
            background: 'linear-gradient(to bottom, #14532d 0%, #052e16 100%)',
            color: '#f0fdf4',
            padding: '6rem 0 3rem',
            borderTop: '4px solid var(--accent-color)'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '4rem',
                    marginBottom: '4rem'
                }}>
                    <div>
                        <div style={{
                            fontSize: '1.75rem',
                            marginBottom: '1.5rem',
                            color: 'white',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ color: 'var(--primary-color)' }}>✦</span> Nirogya Health
                        </div>
                        <p style={{ color: '#94a3b8', lineHeight: 1.7, maxWidth: '300px' }}>
                            Empowering lives through world-class medical innovation. Trusted by professionals, loved by families.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1.5rem', color: '#64748b', letterSpacing: '0.05em', fontWeight: 700 }}>Quick Navigation</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['Home', 'Products', 'About', 'Contact'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    style={{ color: '#e2e8f0', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'var(--primary-color)';
                                        e.currentTarget.style.paddingLeft = '5px';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = '#e2e8f0';
                                        e.currentTarget.style.paddingLeft = '0';
                                    }}
                                >
                                    › {item}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1.5rem', color: '#64748b', letterSpacing: '0.05em', fontWeight: 700 }}>Our Expertise</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#e2e8f0' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>• Medical Supply Chain</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>• Advanced Diagnostics</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>• Healthcare Consulting</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>• 24/7 Emergency Support</span>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1.5rem', color: '#64748b', letterSpacing: '0.05em', fontWeight: 700 }}>Connect With Us</h4>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        color: 'white',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        fontSize: '1.2rem',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--primary-color)';
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.borderColor = 'var(--primary-color)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(14, 165, 233, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {social === 'Facebook' && 'f'}
                                    {social === 'Twitter' && 't'}
                                    {social === 'Instagram' && 'i'}
                                    {social === 'LinkedIn' && 'in'}
                                </a>
                            ))}
                        </div>
                        <div style={{ marginTop: '2rem' }}>
                            <button className="btn btn-primary" style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.9rem',
                                background: 'linear-gradient(to right, var(--primary-color), var(--primary-dark))',
                                border: 'none'
                            }}>
                                Subscribe to Newsletter
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '2rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    color: '#64748b',
                    fontSize: '0.9rem'
                }}>
                    <p>&copy; {new Date().getFullYear()} Nirogya Health Care. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <a href="#" style={{ transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>Privacy Policy</a>
                        <a href="#" style={{ transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
