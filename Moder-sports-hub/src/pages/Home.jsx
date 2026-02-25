// Fashion slider data for homepage hero section
const fashionSlides = [
  {
    id: 1,
    label: 'NEW PRODUCT',
    title: 'Denim Longline\nT-Shirt Dress\nWith Split',
    price: '$130',
    image: 'https://cdn.dribbble.com/users/25514/screenshots/15170899/media/7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.gif', // Provided image
    bg: '#c2b1a0'
  },
  // Add more slides as needed
];
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductContext'

// Default hero banner slides (fallback) - matching homepage theme colors
const defaultHeroSlides = [
  {
    id: 1,
    title: 'Gym & Fitness',
    subtitle: 'Train harder, get stronger',
    gradient: 'linear-gradient(135deg, #ff8533 0%, #ff5500 50%, #cc4400 100%)',
    image: 'https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=900&q=80',
    active: true,
    offer: 'flash sale 50% off'
  },
  {
    id: 2,
    title: 'Running Gear',
    subtitle: 'Built for speed',
    gradient: 'linear-gradient(135deg, #4aa8ff 0%, #2196f3 50%, #0d47a1 100%)',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    active: true
  },
  {
    id: 3,
    title: 'Basketball',
    subtitle: 'Dominate the court',
    gradient: 'linear-gradient(135deg, #ff8533 0%, #4aa8ff 100%)',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    active: true
  },
  {
    id: 4,
    title: 'Football',
    subtitle: 'Own the pitch',
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=900&q=80',
    active: true
  },
  {
    id: 5,
    title: 'Workout Equipment',
    subtitle: 'Premium gear for athletes',
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffb347 100%)',
    image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=900&q=80',
    active: true
  },
]

// Load slider images from localStorage
const loadSliderImages = () => {
  try {
    const saved = localStorage.getItem('moder_slider_images')
    if (saved) {
      const slides = JSON.parse(saved)
      const activeSlides = Array.isArray(slides) ? slides.filter(s => s.active) : [];
      if (activeSlides.length > 0) return activeSlides;
    }
    return defaultHeroSlides;
  } catch {
    return defaultHeroSlides;
  }
}

function Home({ onAddToCart, wishlist, onToggleWishlist }) {
    // Fashion slider state
    const [fashionIndex, setFashionIndex] = useState(0);
    const fashion = fashionSlides[fashionIndex];
  const { getActiveProducts } = useProducts()
  const products = getActiveProducts()
  const sliderRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroSlides, setHeroSlides] = useState(loadSliderImages())
  
  // Listen for localStorage changes (when admin updates sliders)
  useEffect(() => {
    const handleStorageChange = () => {
      setHeroSlides(loadSliderImages())
    }
    
    // Check for updates periodically (for same-tab updates)
    const interval = setInterval(() => {
      const newSlides = loadSliderImages()
      if (JSON.stringify(newSlides) !== JSON.stringify(heroSlides)) {
        setHeroSlides(newSlides)
      }
    }, 2000)
    
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [heroSlides])

  // Auto slide
  useEffect(() => {
    if (heroSlides.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    if (heroSlides.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    if (heroSlides.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  // Reset current slide if it's out of bounds
  useEffect(() => {
    if (currentSlide >= heroSlides.length) {
      setCurrentSlide(0)
    }
  }, [heroSlides.length, currentSlide])

  return (
    <main>
      {/* Fashion Slider */}
      <section className="fashion-slider" style={{background: fashion.bg}}>
        <div className="fashion-slider-content">
          <span className="fashion-slider-label">{fashion.label}</span>
          <div className="fashion-slider-title">
            {fashion.title.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          <div className="fashion-slider-btns">
            <button className="fashion-slider-price">{fashion.price}</button>
            <button className="fashion-slider-buy">BUY NOW</button>
          </div>
        </div>
        <div className="fashion-slider-image">
          <img src={fashion.image} alt="Fashion Model" />
        </div>
        <div className="fashion-slider-nav">
          <span style={{color: '#ff2e63'}}>{fashionIndex + 1}</span>
          <span style={{color: '#fff'}}> / {fashionSlides.length}</span>
        </div>
        <div className="fashion-slider-dots">
          {fashionSlides.map((_, idx) => (
            <button
              key={idx}
              className={`fashion-slider-dot${idx === fashionIndex ? ' active' : ''}`}
              onClick={() => setFashionIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>
      {/* Hero Banner Slider Section */}
      <section className="position-relative overflow-hidden hero-slider-section mb-5" style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
        {/* No Slides Fallback */}
        {heroSlides.length === 0 ? (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #080c16 0%, #0d1b2a 100%)' }}>
            <div className="text-center">
              <i className="bi bi-shop display-1 mb-4" style={{ color: '#ff8533' }}></i>
              <h1 className="text-white display-4 fw-bold mb-2">Welcome to Moder Sports Hub</h1>
              <p className="text-white-50 fs-5 mb-4">Your ultimate destination for sports gear</p>
              <Link to="/products" className="btn btn-lg" style={{ background: '#ff8533', color: '#fff' }}>
                <i className="bi bi-bag me-2"></i> Shop Now
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Banner Slides */}
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center`}
                style={{
                  transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                  opacity: index === currentSlide ? 1 : 0,
                  transform: index === currentSlide ? 'scale(1)' : 'scale(1.05)',
                  backgroundImage: `url('${slide.image}'), ${slide.gradient || 'linear-gradient(135deg, #ff8533 0%, #4aa8ff 100%)'}`,
                  backgroundSize: 'cover, cover',
                  backgroundPosition: 'center, center',
                  backgroundRepeat: 'no-repeat, no-repeat'
                }}
              >
                {/* Overlay for darkening the image for better text visibility */}
                <div 
                  className="position-absolute w-100 h-100" 
                  style={{ 
                    background: 'rgba(0,0,0,0.25)',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }}
                ></div>
                {/* Banner Content with Animations */}
                {index === currentSlide && (
                  <div className="text-center position-relative px-3" style={{ zIndex: 2, animation: 'fadeInUp 0.6s ease-out' }}>
                    <h1 
                      className="text-white fw-bold mb-2 mb-md-3 d-flex align-items-center justify-content-center gap-2" 
                      style={{ 
                        textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                        animation: 'fadeInUp 0.7s ease-out',
                        fontSize: 'clamp(1.5rem, 6vw, 3rem)'
                      }}
                    >
                      {slide.title}
                    </h1>
                    <p 
                      className="text-white mb-3 mb-md-4"
                      style={{
                        fontSize: 'clamp(0.85rem, 3vw, 1.25rem)',
                        opacity: 0.95,
                        textShadow: '1px 1px 4px rgba(0,0,0,0.2)',
                        animation: 'fadeInUp 0.8s ease-out'
                      }}
                    >
                      {slide.subtitle}
                    </p>
                    {/* Offer/Sale Badge - 80% Discount */}
                    <div className="mt-2 mt-md-3 d-flex justify-content-center">
                      <div
                        style={{
                          background: 'radial-gradient(circle at 60% 40%, #ff006a 60%, #7c004c 100%)',
                          color: '#fff',
                          borderRadius: '50%',
                          border: '3px solid #fff',
                          boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)',
                          width: '90px',
                          height: '90px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.35rem',
                          letterSpacing: '0.5px',
                          textAlign: 'center',
                          position: 'relative',
                          zIndex: 2
                        }}
                      >
                        <span style={{fontSize: '1.5rem', fontWeight: 700, lineHeight: 1}}>80%</span>
                        <span style={{fontSize: '1.1rem', fontWeight: 600, lineHeight: 1}}>OFF</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Slidebar Dots Indicator */}
            {heroSlides.length > 1 && (
              <div className="position-absolute w-100 d-flex justify-content-center align-items-center px-2 px-md-4" style={{ bottom: 24, left: 0, zIndex: 10 }}>
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    className="btn btn-sm rounded-pill slider-dot mx-1"
                    style={{ 
                      width: index === currentSlide ? 24 : 8, 
                      height: 8, 
                      padding: 0, 
                      border: 'none',
                      background: index === currentSlide ? '#ff8533' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.3s ease',
                      boxShadow: index === currentSlide ? '0 2px 8px rgba(255,133,51,0.5)' : 'none'
                    }}
                    onClick={() => setCurrentSlide(index)}
                  ></button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Our Products Section */}
      <section className="py-3 py-md-5" id="products">
        <div className="container-fluid px-2 px-md-5">
          <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
            <div className="d-flex flex-column">
              <span className="badge badge-primary mb-1" style={{ fontSize: 'clamp(0.55rem, 1.5vw, 0.85rem)', width: 'fit-content', color: '#111' }}>Our Products</span>
              <h2 className="mb-0 d-none d-md-block" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.75rem)', color: '#111' }}>Ready for the weekend series.</h2>
            </div>
            <div className="d-flex gap-1 gap-md-2 align-items-center">
              <button 
                className="btn btn-outline-light rounded-circle product-slider-btn"
                onClick={() => {
                  const slider = document.getElementById('productSlider')
                  if (slider) slider.scrollBy({ left: -320, behavior: 'smooth' })
                }}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button 
                className="btn btn-outline-light rounded-circle product-slider-btn"
                onClick={() => {
                  const slider = document.getElementById('productSlider')
                  if (slider) slider.scrollBy({ left: 320, behavior: 'smooth' })
                }}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
              <Link to="/products" className="btn btn-primary btn-sm ms-1 ms-md-2" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.875rem)', padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)' }}>Shop All</Link>
            </div>
          </div>
          {/* Product Slider */}
          <div 
            id="productSlider"
            className="d-flex gap-3 overflow-auto pb-3"
            style={{ 
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {products.length === 0 ? (
              <div className="text-center py-5 w-100">
                <i className="bi bi-box-seam display-1 text-muted-custom mb-4 d-block"></i>
                <h4 className="text-white mb-2">No Products Available Yet</h4>
                <p className="text-muted-custom mb-4">Our store is being set up. Products will appear here once added by admin.</p>
                <Link to="/admin-login" className="btn btn-outline-warning">
                  <i className="bi bi-shield-lock me-2"></i>Admin Login
                </Link>
              </div>
            ) : (
              products.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card-wrapper"
                  style={{ 
                    scrollSnapAlign: 'start'
                  }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    wishlist={wishlist}
                    onToggleWishlist={onToggleWishlist}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 border-top border-custom">
        <div className="container">
          <div className="row g-4 text-center features-row-mobile">
            <div className="col-md-3 col-6">
              <div className="p-3">
                <i className="bi bi-truck fs-1 text-warning mb-3"></i>
                <h6 style={{color: '#111'}}>Free Shipping</h6>
                <p className="text-muted-custom small mb-0">On orders over ₹5,000</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-3">
                <i className="bi bi-arrow-repeat fs-1 text-warning mb-3"></i>
                <h6 style={{color: '#111'}}>Easy Returns</h6>
                <p className="text-muted-custom small mb-0">30-day return policy</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-3">
                <i className="bi bi-shield-check fs-1 text-warning mb-3"></i>
                <h6 style={{color: '#111'}}>Secure Payment</h6>
                <p className="text-muted-custom small mb-0">100% secure checkout</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-3">
                <i className="bi bi-headset fs-1 text-warning mb-3"></i>
                <h6 style={{color: '#111'}}>24/7 Support</h6>
                <p className="text-muted-custom small mb-0">Dedicated support team</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
