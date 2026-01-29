import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer style={{
            background: 'linear-gradient(to bottom, hsl(var(--foreground)) 0%, #1e1b4b 100%)', // Dark rich gradient
            color: 'hsl(var(--primary-foreground))',
            padding: '6rem 0 3rem',
            borderTop: '4px solid hsl(var(--accent))'
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
                            <span className="text-rainbow-green">✦</span> Nirogya Health
                        </div>
                        <p style={{ color: 'hsl(var(--muted))', lineHeight: 1.7, maxWidth: '300px' }}>
                            Empowering lives through world-class medical innovation. Trusted by professionals, loved by families.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'hsl(var(--muted))', letterSpacing: '0.05em', fontWeight: 700 }}>Quick Navigation</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['Home', 'Products', 'About', 'Contact'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    style={{ color: 'hsl(var(--primary-foreground))', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'hsl(var(--primary))';
                                        e.currentTarget.style.paddingLeft = '5px';
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'hsl(var(--primary-foreground))';
                                        e.currentTarget.style.paddingLeft = '0';
                                        e.currentTarget.style.opacity = '0.8';
                                    }}
                                >
                                    › {item}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'hsl(var(--muted))', letterSpacing: '0.05em', fontWeight: 700 }}>Our Expertise</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'hsl(var(--primary-foreground))', opacity: 0.8 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>• Medical Supply Chain</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>• Advanced Diagnostics</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>• Healthcare Consulting</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>• 24/7 Emergency Support</span>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'hsl(var(--muted))', letterSpacing: '0.05em', fontWeight: 700 }}>Connect With Us</h4>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(255,255,255,0.1)',
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
                                        e.currentTarget.style.background = 'hsl(var(--primary))';
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.borderColor = 'hsl(var(--primary))';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(14, 165, 233, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
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
                    color: 'hsl(var(--muted))',
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
