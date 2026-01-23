import React from 'react';

const products = [
    {
        id: 1,
        name: "Nirogya Health Plus Syrup",
        image: "/bottle-3.png",
        category: "Immunity"
    },
    {
        id: 2,
        name: "Vitamin C Supplements",
        image: "/bottle-2.png",
        category: "Wellness"
    },
    {
        id: 3,
        name: "Advanced Digest Aid",
        image: "/bottle-1.png",
        category: "Digestion"
    },
    {
        id: 4,
        name: "Premium Health Supplement",
        image: "/product-7.png",
        category: "Supplement"
    },
    {
        id: 5,
        name: "Ayurvedic Liver Tonic",
        image: "/product-8.png",
        category: "Wellness"
    },
    {
        id: 6,
        name: "Digestive Care Syrup",
        image: "/product-9.png",
        category: "Digestion"
    },
    {
        id: 7,
        name: "Pro-Immunity Capsules",
        image: "/product-10.png",
        category: "Immunity"
    },
    {
        id: 8,
        name: "Herbal Joint Pain Relief",
        image: "/product-11.png",
        category: "Pain Relief"
    },
    {
        id: 9,
        name: "Advanced Calcium Tablets",
        image: "/product-12.png",
        category: "Supplements"
    },
    {
        id: 10,
        name: "Digestive Enzyme Syrup",
        image: "/product-13.png",
        category: "Digestion"
    },
    {
        id: 11,
        name: "Vitality Plus Tonic",
        image: "/product-14.png",
        category: "Wellness"
    },
    {
        id: 12,
        name: "Respiratory Care Drops",
        image: "/product-15.png",
        category: "Respiratory"
    },
    {
        id: 13,
        name: "Natural Sleep Aid",
        image: "/product-16.png",
        category: "Wellness"
    },
    {
        id: 14,
        name: "Kidney Health Syrup",
        image: "/product-17.png",
        category: "Specialized"
    }
];

export const ProductList: React.FC = () => {
    return (
        <section id="products" className="section" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.05) 0%, transparent 50%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <h2 className="section-title">Our Premium Collection</h2>
                <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto 4rem' }}>
                    Discover our range of scientifically formulated healthcare products designed for your well-being.
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2.5rem',
                }}>
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="glass-panel"
                            style={{
                                borderRadius: '1.5rem',
                                overflow: 'hidden',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                        >
                            <div style={{
                                height: '300px',
                                overflow: 'hidden',
                                position: 'relative',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                                padding: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                        objectFit: 'contain',
                                        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))',
                                        transition: 'transform 0.5s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'rgba(255,255,255,0.9)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: 'var(--primary-dark)',
                                    boxShadow: 'var(--shadow-sm)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {product.category}
                                </div>
                            </div>

                            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.6)' }}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    marginBottom: '0.75rem',
                                    color: 'var(--text-dark)',
                                    fontWeight: 700,
                                    lineHeight: 1.4
                                }}>
                                    {product.name}
                                </h3>
                                <div style={{
                                    width: '40px',
                                    height: '3px',
                                    background: 'var(--primary-color)',
                                    borderRadius: '2px',
                                    marginBottom: '1rem'
                                }} />
                                <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                    Premium quality assurance. Clinically tested for safety and efficacy.
                                </p>

                                <div style={{ marginTop: 'auto' }}>
                                    <button style={{
                                        background: 'transparent',
                                        border: '1px solid var(--primary-color)',
                                        color: 'var(--primary-dark)',
                                        padding: '0.75rem 0',
                                        width: '100%',
                                        borderRadius: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '0.9rem'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--primary-color)';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'var(--primary-dark)';
                                        }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
