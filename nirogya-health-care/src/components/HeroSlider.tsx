import React, { useState, useEffect } from 'react';

const slides = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=2070',
        title: 'Ancient Wisdom, Modern Healing',
        subtitle: 'Experience the power of authentic Ayurveda for holistic wellness.',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1628088306391-1631cdd36e7c?auto=format&fit=crop&q=80&w=2070',
        title: 'Pure & Natural Ingredients',
        subtitle: 'Hand-picked herbs carefully processed to preserve nature’s potency.',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2070',
        title: 'Holistic Wellness Journey',
        subtitle: 'Restore balance to your body, mind, and soul with our premium formulations.',
    },
];

export const HeroSlider: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section id="home" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: index === currentSlide ? 1 : 0,
                        transition: 'opacity 1s ease-in-out',
                        zIndex: index === currentSlide ? 10 : 0,
                    }}
                >
                    {/* Background Image with Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${slide.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%)', // Darker overlay for better text contrast
                        }} />
                    </div>

                    {/* Content */}
                    <div className="container" style={{
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        color: 'white',
                        zIndex: 20,
                    }}>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 'clamp(3rem, 6vw, 5rem)',
                            marginBottom: '1.5rem',
                            textShadow: '0 4px 8px rgba(0,0,0,0.5)',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            background: 'linear-gradient(90deg, #fff, #fbbf24)', // slight gold gradient text
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}>
                            {slide.title}
                        </h1>
                        <p style={{
                            fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
                            marginBottom: '2.5rem',
                            maxWidth: '800px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            opacity: 0.9,
                        }}>
                            {slide.subtitle}
                        </p>
                        <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                            View Collection
                        </button>
                    </div>
                </div>
            ))}

            {/* Dots Indicator */}
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '0.75rem',
                zIndex: 30,
            }}>
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: index === currentSlide ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.3)',
                            border: index === currentSlide ? 'none' : '1px solid white',
                            transition: 'all 0.3s ease',
                        }}
                    />
                ))}
            </div>
        </section>
    );
};
