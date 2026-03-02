import { Link } from 'react-router-dom'

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

function ProductCard({ product, onAddToCart, wishlist, onToggleWishlist }) {
  const { id, name, price, originalPrice, badge, tag, image, description } = product
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
  const isWishlisted = wishlist?.includes(id)

  return (
    <Link to={`/product/${id}`} className="text-decoration-none">
      <div className="card product-card h-100" style={{ cursor: 'pointer' }}>
        <div className="img-wrapper position-relative">
          <img src={image} className="card-img-top" alt={name} />
          {discount > 0 && (
            <span className="discount-badge">-{discount}%</span>
          )}
          <button
            className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist?.(id) }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <i className={`bi ${isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart text-white'}`}></i>
          </button>
        </div>

        <div className="card-body d-flex flex-column product-card-body">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="badge badge-primary product-card-badge black-font">{badge}</span>
            <small className="text-muted-custom product-card-tag black-font">{tag}</small>
          </div>

          <h5 className="card-title mb-1 product-card-title black-font">{name}</h5>

            {/* Rating and Review Section */}
            <div className="product-card-rating d-flex align-items-center mb-1">
              {/* Example: 4.5 stars, 120 reviews. Replace with real data if available */}
              <span className="star-rating">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`bi ${i < Math.floor(product.rating || 0) ? 'bi-star-fill' : (i < (product.rating || 0) ? 'bi-star-half' : 'bi-star')}`}
                    style={{ color: '#FFD700', fontSize: '1rem', marginRight: '2px' }}
                  />
                ))}
              </span>
              <span className="ms-2 small text-muted">{product.rating?.toFixed(1) || '4.5'} ({product.reviewCount || 120} reviews)</span>
            </div>

          <p className="card-text small mb-1 product-card-desc black-font">
            {description?.substring(0, 60) || 'Optimized fabrics, ergonomic cuts.'}...
          </p>

          <div className="d-flex justify-content-between align-items-center mt-auto pt-1 pt-md-2 border-top border-custom">
            <div>
              <span className="price-current product-card-price price-black">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="price-original ms-1 ms-md-2 product-card-original-price">{formatPrice(originalPrice)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
