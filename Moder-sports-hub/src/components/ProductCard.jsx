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

          <p className="card-text small mb-1 product-card-desc black-font">
            {description?.substring(0, 60) || 'Optimized fabrics, ergonomic cuts.'}...
          </p>

          <div className="d-flex justify-content-between align-items-center mt-auto pt-1 pt-md-2 border-top border-custom">
            <div>
              <span className="price-current product-card-price black-font">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="price-original ms-1 ms-md-2 product-card-original-price black-font">{formatPrice(originalPrice)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
