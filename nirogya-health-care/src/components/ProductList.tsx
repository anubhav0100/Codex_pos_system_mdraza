import React from 'react';

const products = [
    {
        id: 1,
        name: "Nirogya Health Plus Syrup",
        image: "/bottle-3.png",
        category: "Immunity",
        color: "text-rainbow-red"
    },
    {
        id: 2,
        name: "Vitamin C Supplements",
        image: "/bottle-2.png",
        category: "Wellness",
        color: "text-rainbow-orange"
    },
    {
        id: 3,
        name: "Advanced Digest Aid",
        image: "/bottle-1.png",
        category: "Digestion",
        color: "text-rainbow-yellow"
    },
    {
        id: 4,
        name: "Premium Health Supplement",
        image: "/product-7.png",
        category: "Supplement",
        color: "text-rainbow-green"
    },
    {
        id: 5,
        name: "Ayurvedic Liver Tonic",
        image: "/product-8.png",
        category: "Wellness",
        color: "text-rainbow-cyan"
    },
    {
        id: 6,
        name: "Digestive Care Syrup",
        image: "/product-9.png",
        category: "Digestion",
        color: "text-rainbow-blue"
    },
    {
        id: 7,
        name: "Pro-Immunity Capsules",
        image: "/product-10.png",
        category: "Immunity",
        color: "text-rainbow-violet"
    },
    {
        id: 8,
        name: "Herbal Joint Pain Relief",
        image: "/product-11.png",
        category: "Pain Relief",
        color: "text-rainbow-red"
    },
    {
        id: 9,
        name: "Advanced Calcium Tablets",
        image: "/product-12.png",
        category: "Supplements",
        color: "text-rainbow-orange"
    },
    {
        id: 10,
        name: "Digestive Enzyme Syrup",
        image: "/product-13.png",
        category: "Digestion",
        color: "text-rainbow-yellow"
    },
    {
        id: 11,
        name: "Vitality Plus Tonic",
        image: "/product-14.png",
        category: "Wellness",
        color: "text-rainbow-green"
    },
    {
        id: 12,
        name: "Respiratory Care Drops",
        image: "/product-15.png",
        category: "Respiratory",
        color: "text-rainbow-cyan"
    },
    {
        id: 13,
        name: "Natural Sleep Aid",
        image: "/product-16.png",
        category: "Wellness",
        color: "text-rainbow-blue"
    },
    {
        id: 14,
        name: "Kidney Health Syrup",
        image: "/product-17.png",
        category: "Specialized",
        color: "text-rainbow-violet"
    }
];

export const ProductList: React.FC = () => {
    return (
        <section id="products" className="section" style={{ position: 'relative' }}>
            {/* Background elements moved to CSS via ::before/after on .section usually, or keep simple here */}

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <h2 className="section-title">Nature's Finest Collection</h2>
                <p style={{
                    maxWidth: '600px',
                    margin: '0 auto 4rem',
                    textAlign: 'center',
                    color: 'hsl(var(--muted-foreground))',
                    fontSize: '1.125rem'
                }}>
                    Explore our range of time-honored herbal remedies, crafted for balance and vitality.
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2.5rem',
                }}>
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="glass-card hover-scale"
                            style={{
                                borderRadius: '1.5rem',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
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
                                    background: 'hsl(var(--card))',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    boxShadow: 'var(--shadow-sm)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }} className={product.color}>
                                    {product.category}
                                </div>
                            </div>

                            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    marginBottom: '0.75rem',
                                    color: 'hsl(var(--card-foreground))',
                                    fontWeight: 700,
                                    lineHeight: 1.4
                                }}>
                                    {product.name}
                                </h3>
                                <div style={{
                                    width: '40px',
                                    height: '3px',
                                    background: 'hsl(var(--primary))',
                                    borderRadius: '2px',
                                    marginBottom: '1rem'
                                }} />
                                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                    Premium quality assurance. Clinically tested for safety and efficacy.
                                </p>

                                <div style={{ marginTop: 'auto' }}>
                                    <button
                                        className="btn"
                                        style={{
                                            border: '1px solid hsl(var(--primary))',
                                            color: 'hsl(var(--primary))',
                                            width: '100%',
                                            textTransform: 'uppercase',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'hsl(var(--primary))';
                                            e.currentTarget.style.color = 'hsl(var(--primary-foreground))';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'hsl(var(--primary))';
                                        }}
                                    >
                                        Discover Benefits
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
