import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

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
                background: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: isScrolled ? 'var(--shadow-md)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: isScrolled ? '0.75rem 0' : '1.5rem 0',
                borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
            }}
            className={isScrolled ? 'glass-card' : ''}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        letterSpacing: '-0.02em'
                    }}
                >
                    {/* Logo Icon */}
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21C12 21 16 20 19 16C22 12 22 7 22 7C22 7 17 7 13 10C9 13 8 17 8 17" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 21C12 21 8 20 5 16C2 12 2 7 2 7C2 7 7 7 11 10C15 13 16 17 16 17" stroke="hsl(var(--rainbow-violet))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="gradient-text">Nirogya Health</span>
                </div>

                {/* Desktop Navigation */}
                <nav style={{ display: 'none', gap: '2.5rem', alignItems: 'center' }} className="desktop-nav">
                    {['Home', 'Products', 'About', 'Contact'].map((item) => (
                        <button
                            key={item}
                            onClick={() => scrollToSection(item.toLowerCase())}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1rem',
                                color: 'hsl(var(--foreground))',
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'hsl(var(--primary))';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'hsl(var(--foreground))';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {item}
                        </button>
                    ))}

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'transparent',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'hsl(var(--foreground))',
                            transition: 'all 0.3s ease'
                        }}
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(var(--primary))'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(var(--border))'}
                    >
                        {theme === 'light' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        )}
                    </button>
                </nav>

                {/* Mobile Menu Button */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="mobile-controls">
                    <button
                        onClick={toggleTheme}
                        className="mobile-theme-toggle"
                        style={{ display: 'none' }} // Hidden by default, shown via CSS media query if needed
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{ display: 'block', padding: '0.5rem', color: 'hsl(var(--foreground))' }}
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
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div
                    className="glass-card"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        borderTop: 'none',
                        borderRadius: '0 0 1rem 1rem'
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
                                color: 'hsl(var(--foreground))',
                                width: '100%',
                                cursor: 'pointer'
                            }}
                        >
                            {item}
                        </button>
                    ))}
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'transparent',
                            border: '1px solid hsl(var(--border))',
                            padding: '0.75rem',
                            textAlign: 'center',
                            borderRadius: '0.5rem',
                            color: 'hsl(var(--foreground))',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {theme === 'light' ? 'Switch to Dark Mode 🌙' : 'Switch to Light Mode ☀️'}
                    </button>
                </div>
            )}

            <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-controls { display: none !important; }
        }
        @media (max-width: 767px) {
           .mobile-theme-toggle { display: block !important; }
        }
      `}</style>
        </header>
    );
};
