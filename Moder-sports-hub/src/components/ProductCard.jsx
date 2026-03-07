import { Link } from 'react-router-dom'

const formatPrice = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

function ProductCard({ product, onAddToCart, wishlist, onToggleWishlist }) {
  const { id, name, price, originalPrice, badge, tag, image, description, category } = product
  const isWishlisted = wishlist?.includes(id)

  return (
    <Link to={`/product/${id}`} className="text-decoration-none">
      <div className="product-card-modern">
        {/* Image Section */}
        <div className="product-card-image-wrapper">
          {badge && <span className="product-hot-badge">{badge}</span>}
          <img src={image} className="product-card-image" alt={name} />
        </div>

        {/* Content Section */}
        <div className="product-card-content">
          <span className="product-card-category">{category || tag || 'SPORTS'}</span>
          <h3 className="product-card-name">{name}</h3>
          
          {/* Rating Section */}
          <div className="product-card-rating">
            <div className="product-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`bi ${
                    star <= Math.floor(product.rating || 4.5)
                      ? 'bi-star-fill'
                      : star - 0.5 <= (product.rating || 4.5)
                      ? 'bi-star-half'
                      : 'bi-star'
                  }`}
                ></i>
              ))}
            </div>
            <span className="product-review-count">
              ({product.reviewCount || Math.floor(Math.random() * 200) + 50})
            </span>
          </div>

          <p className="product-card-description">
            {description?.substring(0, 80) || 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vero, possimus nostrum!'}
          </p>

          <div className="product-card-footer">
            <div className="product-card-pricing">
              {originalPrice && (
                <span className="product-original-price">{formatPrice(originalPrice)}</span>
              )}
              <span className="product-sale-price">{formatPrice(price)}</span>
            </div>
            <div className="product-card-actions">
              <button
                className={`product-action-btn ${isWishlisted ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist?.(id) }}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              </button>
              <button
                className="product-action-btn"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product) }}
                aria-label="Add to cart"
              >
                <i className="bi bi-cart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
