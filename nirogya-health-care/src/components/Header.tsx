import React, { useState, useEffect } from 'react';

export const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setIsMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                backgroundColor: isScrolled ? 'rgba(255, 250, 245, 0.92)' : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: isScrolled ? 'var(--shadow-md)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: isScrolled ? '0.75rem 0' : '1.5rem 0',
                borderBottom: isScrolled ? '1px solid var(--accent-color)' : '1px solid transparent',
            }}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: 'var(--primary-dark)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        letterSpacing: '-0.02em'
                    }}
                >
                    {/* Leaf/Ayurveda Logo Icon */}
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21C12 21 16 20 19 16C22 12 22 7 22 7C22 7 17 7 13 10C9 13 8 17 8 17" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 21C12 21 8 20 5 16C2 12 2 7 2 7C2 7 7 7 11 10C15 13 16 17 16 17" stroke="var(--primary-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Nirogya <span style={{ color: 'var(--accent-color)', fontStyle: 'italic' }}>Ayurveda</span>
                </div>

                {/* Desktop Navigation */}
                <nav style={{ display: 'none', gap: '2.5rem' }} className="desktop-nav">
                    {['Home', 'Products', 'About', 'Contact'].map((item) => (
                        <button
                            key={item}
                            onClick={() => scrollToSection(item.toLowerCase())}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1rem',
                                color: 'var(--text-dark)',
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                                padding: '0.5rem 0',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--primary-color)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-dark)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ display: 'block', padding: '0.5rem' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isMobileMenuOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" />
                        ) : (
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        padding: '1rem',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}
                >
                    {['Home', 'Products', 'About', 'Contact'].map((item) => (
                        <button
                            key={item}
                            onClick={() => scrollToSection(item.toLowerCase())}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.125rem',
                                padding: '0.5rem',
                                textAlign: 'left',
                                color: 'var(--text-dark)',
                                width: '100%',
                                cursor: 'pointer'
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}

            <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
        </header>
    );
};
