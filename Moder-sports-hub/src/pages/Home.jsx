// Fashion slider data for homepage hero section
const fashionSlides = [
  {
    id: 1,
    title: 'Puma Phase Sports Bag - Californiann',
    price: '₹130',
    image: 'https://www.californian.co.za/wp-content/uploads/2023/10/A1849-PUMA-BLACK-PHASE-SPORT4-1024x1024.jpg',
    bg: '#c2b1a0'
  },
  {
    id: 2,
    label: 'HOT DEAL',
    title: 'Nike Run Division Miler Mens Flash Running Jacket. Nike SG',
    price: '₹99',
    image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/dfd51767-5abf-4e76-b94e-83a2fb7556c0/run-division-miler-flash-running-jacket-vNGRMq.png',
    bg: '#e0e0e0'
  },
  {
    id: 3,
    label: 'TRENDING',
    title: 'Cricket Bat\nPro Series',
    price: '₹150',
    image: 'https://www.romida.co.uk/wp-content/uploads/2024/12/Kookaburra-Rapid-Pro-Bat-2025-Art.jpg',
    bg: '#d1c4e9'
  },
   {
    id: 2,
    label: 'HOT DEAL',
    title: 'Sports Shoes\nLimited Edition',
    price: '₹99',
    image: 'https://tse1.mm.bing.net/th/id/OIP.RBQzOzeCj_SCSb1MAizonwHaHw?rs=1&pid=ImgDetMain&o=7&rm=3',
    bg: '#e0e0e0'
  }
];
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductContext'

// Default hero banner slides (fallback) - matching homepage theme colors


function Home({ onAddToCart, wishlist, onToggleWishlist }) {
  // Fashion slider state
  const [fashionIndex, setFashionIndex] = useState(0);
  const fashion = fashionSlides[fashionIndex];

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setFashionIndex((prev) => (prev + 1) % fashionSlides.length);
    }, 3500); // Slide every 3.5 seconds
    return () => clearInterval(interval);
  }, [fashionSlides.length]);

  // Products state
  const { getActiveProducts } = useProducts();
  const products = getActiveProducts ? getActiveProducts() : [];

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
