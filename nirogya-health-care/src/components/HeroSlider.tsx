import React, { useState, useEffect } from 'react';

const slides = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070',
        title: 'Advanced Healthcare Solutions',
        subtitle: 'Providing top-quality medical equipment for better patient care.',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=2070',
        title: 'Expert Medical Advice',
        subtitle: 'Consult with our specialists for a healthier tomorrow.',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1584036561566-b9370001e95e?auto=format&fit=crop&q=80&w=2070',
        title: 'Modern Diagnostic Tools',
        subtitle: 'Precision and accuracy in every diagnosis.',
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
                            background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.4) 100%)',
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
                            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                            marginBottom: '1.5rem',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            {slide.title}
                        </h1>
                        <p style={{
                            fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                            marginBottom: '2.5rem',
                            maxWidth: '800px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                            {slide.subtitle}
                        </p>
                        <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
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
                            backgroundColor: index === currentSlide ? 'var(--primary-color)' : 'rgba(255,255,255,0.5)',
                            transition: 'background-color 0.3s',
                        }}
                    />
                ))}
            </div>
        </section>
    );
};
