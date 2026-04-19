import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`
const IMAGE_FALLBACK_URL = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=640&q=80'

function ProductCard({ product, onAddToCart, wishlist, onToggleWishlist }) {
  const { id, name, price, originalPrice, badge, tag, image, description, category } = product
  const resolvedImage = image || IMAGE_FALLBACK_URL
  const isAvifImage = useMemo(() => /\.avif(?:\?|#|$)/i.test(resolvedImage), [resolvedImage])
  const [imgSrc, setImgSrc] = useState(resolvedImage)

  useEffect(() => {
    setImgSrc(resolvedImage)
  }, [resolvedImage])

  const isWishlisted = wishlist?.includes(id)

  return (
    <Link to={`/product/${id}`} className="text-decoration-none">
      <div className="product-card-modern">
        {/* Image Section */}
        <div className="product-card-image-wrapper">
          {badge && <span className="product-hot-badge">{badge}</span>}
          <picture>
            {isAvifImage && <source srcSet={resolvedImage} type="image/avif" />}
            <img
              src={imgSrc}
              className="product-card-image"
              alt={name}
              onError={(e) => {
                if (imgSrc !== IMAGE_FALLBACK_URL) {
                  setImgSrc(IMAGE_FALLBACK_URL)
                } else {
                  e.currentTarget.onerror = null
                }
              }}
            />
          </picture>
          <button
            className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist?.(id) }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          </button>
          {/* Rating overlay bottom left */}
          <div className="product-card-rating-overlay">
            <span className="product-card-rating-star">
              <i className="bi bi-star-fill"></i> {product.rating || 4.8}
            </span>
            <span className="product-card-rating-count">| {product.reviewCount || '22k'}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="product-card-content">
          <span className="product-card-category">{category || tag || 'SPORTS'}</span>
          <h3 className="product-card-name">{name}</h3>
          {/* Rating Section */}
          {/* Remove old rating section, now in overlay */}
          <p className="product-card-description">
            {description?.substring(0, 80) || 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vero, possimus nostrum!'}
          </p>

          <div className="product-card-footer">
            <div className="product-card-pricing">
              {originalPrice && (
                <span className="product-original-price">{formatPrice(originalPrice)}</span>
              )}
              <span className="product-sale-price">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="product-discount-badge">
                  {Math.round(100 - (price / originalPrice) * 100)}% Off
                </span>
              )}
            </div>
            <button
              className="product-add-to-cart-btn"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product) }}
              aria-label="Add to cart"
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
