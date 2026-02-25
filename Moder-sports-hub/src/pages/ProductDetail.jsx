import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'
import Swal from 'sweetalert2'

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

// Sample reviews data (in real app, this would come from backend)
const getInitialReviews = (productId) => {
  const storedReviews = localStorage.getItem(`reviews_${productId}`)
  if (storedReviews) {
    return JSON.parse(storedReviews)
  }
  // Default sample reviews
  return [
    {
      id: 1,
      userName: 'Rahul Sharma',
      rating: 5,
      date: '2026-01-15',
      title: 'Excellent Quality!',
      comment: 'Amazing product! The quality is top-notch and delivery was super fast. Highly recommended for all sports enthusiasts.',
      helpful: 24,
      verified: true
    },
    {
      id: 2,
      userName: 'Priya Patel',
      rating: 4,
      date: '2026-01-10',
      title: 'Good value for money',
      comment: 'Great product overall. Comfortable and durable. Only giving 4 stars because the color was slightly different from the image.',
      helpful: 18,
      verified: true
    },
    {
      id: 3,
      userName: 'Amit Kumar',
      rating: 5,
      date: '2026-01-05',
      title: 'Perfect for training',
      comment: 'Been using this for a month now. Perfect for my daily training sessions. The material is breathable and comfortable.',
      helpful: 12,
      verified: false
    }
  ]
}

function ProductDetail({ onAddToCart, wishlist, onToggleWishlist, user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProductById, getActiveProducts } = useProducts()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  
  // Review states
  const [reviews, setReviews] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  })
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewFilter, setReviewFilter] = useState('all')
  const [helpfulClicked, setHelpfulClicked] = useState([])

  // Reset state and scroll to top when product id changes
  useEffect(() => {
    setQuantity(1)
    setSelectedSize('')
    setSelectedColor('')
    window.scrollTo(0, 0)
  }, [id])

  // Load reviews on mount
  useEffect(() => {
    if (id) {
      setReviews(getInitialReviews(id))
      const storedHelpful = localStorage.getItem(`helpful_${id}`)
      if (storedHelpful) {
        setHelpfulClicked(JSON.parse(storedHelpful))
      }
    }
  }, [id])

  // Calculate review statistics
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 
      ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100)
      : 0
  }))

  // Filter reviews
  const filteredReviews = reviewFilter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(reviewFilter))

  // Handle submit review
  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to submit a review',
        icon: 'warning',
        confirmButtonText: 'Login',
        confirmButtonColor: '#667eea',
        background: '#1a1a2e',
        color: '#fff'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login')
        }
      })
      return
    }

    if (!newReview.title.trim() || !newReview.comment.trim()) {
      Swal.fire({
        title: 'Incomplete Review',
        text: 'Please fill in both title and comment',
        icon: 'warning',
        confirmButtonColor: '#667eea',
        background: '#1a1a2e',
        color: '#fff'
      })
      return
    }

    const review = {
      id: Date.now(),
      userName: user.name || user.email?.split('@')[0] || 'Anonymous',
      rating: newReview.rating,
      date: new Date().toISOString().split('T')[0],
      title: newReview.title,
      comment: newReview.comment,
      helpful: 0,
      verified: true
    }

    const updatedReviews = [review, ...reviews]
    setReviews(updatedReviews)
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews))
    
    setNewReview({ rating: 5, title: '', comment: '' })
    setShowReviewForm(false)

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Review Submitted!',
      text: 'Thank you for your feedback',
      showConfirmButton: false,
      timer: 2000,
      background: '#1a1a2e',
      color: '#fff'
    })
  }

  // Handle helpful click
  const handleHelpful = (reviewId) => {
    if (helpfulClicked.includes(reviewId)) return
    
    const updatedReviews = reviews.map(r => 
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    )
    setReviews(updatedReviews)
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews))
    
    const updatedHelpful = [...helpfulClicked, reviewId]
    setHelpfulClicked(updatedHelpful)
    localStorage.setItem(`helpful_${id}`, JSON.stringify(updatedHelpful))
  }

  // Render star rating
  const renderStars = (rating, size = 'fs-6') => {
    return (
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <i 
            key={star} 
            className={`bi ${star <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted-custom'} ${size}`}
          ></i>
        ))}
      </div>
    )
  }

  const product = getProductById(id)
  const allProducts = getActiveProducts()

  // Show products from different categories (excluding current product)
  const productsByCategory = product
    ? Object.entries(
        allProducts
          .filter(p => p.id !== product.id)
          .reduce((acc, p) => {
            const cat = p.category || 'Other'
            if (!acc[cat]) acc[cat] = []
            acc[cat].push(p)
            return acc
          }, {})
      ).map(([category, items]) => ({ category, items: items.slice(0, 6) }))
    : []

  if (!product) {
    return (
      <main className="container py-5">
        <div className="text-center py-5">
          <i className="bi bi-exclamation-circle display-1 text-muted-custom mb-4"></i>
          <h2 className="text-white mb-3">Product not found</h2>
          <Link to="/" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i> Back to Shop
          </Link>
        </div>
      </main>
    )
  }

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0
  const isWishlisted = wishlist?.includes(product.id)

  const handleAddToCart = () => {
    const unavailableColors = ['Yellow', 'Orange', 'Pink', 'Purple']
    
    if (!selectedSize) {
      Swal.fire({
        title: 'Size Required',
        text: 'Please select a size before adding to cart',
        icon: 'warning',
        confirmButtonText: 'Select Size',
        confirmButtonColor: '#667eea',
        background: '#1a1a2e',
        color: '#fff',
        customClass: {
          popup: 'border border-secondary'
        }
      })
      return
    }
    if (!selectedColor) {
      Swal.fire({
        title: 'Color Required',
        text: 'Please select a color before adding to cart',
        icon: 'warning',
        confirmButtonText: 'Select Color',
        confirmButtonColor: '#667eea',
        background: '#1a1a2e',
        color: '#fff',
        customClass: {
          popup: 'border border-secondary'
        }
      })
      return
    }
    
    // Check if selected color is available
    if (unavailableColors.includes(selectedColor)) {
      Swal.fire({
        title: 'Color Not Available',
        html: `<p style="color: #ccc;">Sorry, <strong>${selectedColor}</strong> is currently out of stock.</p><p style="color: #888;">Please select a different color.</p>`,
        icon: 'error',
        confirmButtonText: 'Select Another Color',
        confirmButtonColor: '#667eea',
        background: '#1a1a2e',
        color: '#fff',
        customClass: {
          popup: 'border border-secondary'
        }
      })
      return
    }
    
    for (let i = 0; i < quantity; i++) {
      onAddToCart({ ...product, selectedSize, selectedColor })
    }
    
    // Success toast notification
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Added to Cart!',
      text: `${product.name} (${selectedSize}, ${selectedColor})`,
      showConfirmButton: false,
      timer: 2000,
      background: '#1a1a2e',
      color: '#fff'
    })
    
    navigate('/cart')
  }

  return (
    <main className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/" className="text-muted-custom">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/#products" className="text-muted-custom">Products</Link></li>
          <li className="breadcrumb-item active text-white" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Product Image and Reviews */}
        <div className="col-lg-6">
          <div className="product-detail-img position-relative" style={{ lineHeight: 0 }}>
            <img src={product.image} alt={product.name} className="img-fluid rounded-4" style={{ display: 'block', width: '100%', height: 'auto' }} />
            {discount > 0 && (
              <span className="position-absolute top-0 start-0 m-3 badge bg-danger fs-6">
                -{discount}%
              </span>
            )}
          </div>

          {/* Reviews & Feedback Section - Below Image */}
          <div className="mt-3">
            <div className="card-dark p-2 mb-2">
              <div className="card-body p-2">
                <h6 className="text-white mb-2">
                  <i className="bi bi-star-fill text-warning me-2 small"></i>
                  Customer Reviews
                </h6>
                
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="text-center">
                    <div className="fs-3 fw-bold text-warning">{averageRating}</div>
                    <div className="mb-1">{renderStars(Math.round(averageRating), 'small')}</div>
                  </div>
                  <div className="flex-grow-1">
                    {ratingDistribution.map(({ star, count, percentage }) => (
                      <div key={star} className="d-flex align-items-center gap-1 mb-0">
                        <span className="text-white small" style={{ width: '12px', fontSize: '0.7rem' }}>{star}</span>
                        <i className="bi bi-star-fill text-warning" style={{ fontSize: '0.6rem' }}></i>
                        <div className="progress flex-grow-1" style={{ height: '4px', backgroundColor: '#2a2a3e' }}>
                          <div className="progress-bar bg-warning" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-muted-custom small" style={{ width: '15px', fontSize: '0.7rem' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-muted-custom mb-2 small">Based on {reviews.length} reviews</p>
                
                <button 
                  className="btn btn-primary btn-sm w-100"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  <i className="bi bi-pencil-square me-1"></i>
                  Write Review
                </button>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="card bg-dark border-primary mb-2">
                <div className="card-body p-2">
                  <h6 className="text-white mb-2 small">Write Your Review</h6>
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-2">
                      <div className="d-flex gap-1 align-items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            className="btn btn-link p-0"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                          >
                            <i className={`bi ${star <= (hoverRating || newReview.rating) ? 'bi-star-fill' : 'bi-star'} text-warning`}></i>
                          </button>
                        ))}
                        <span className="text-muted-custom ms-1 small">{newReview.rating}/5</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary mb-2"
                      placeholder="Review title"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      maxLength={100}
                    />
                    <textarea
                      className="form-control form-control-sm bg-dark text-white border-secondary mb-2"
                      rows="2"
                      placeholder="Your review..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      maxLength={500}
                    ></textarea>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowReviewForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="card-dark p-2">
              <div className="card-body p-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="text-white mb-0 small">
                    <i className="bi bi-chat-quote me-1"></i>
                    Feedback
                  </h6>
                  <select 
                    className="form-select form-select-sm bg-dark text-white border-secondary py-0"
                    style={{ width: 'auto', fontSize: '0.7rem' }}
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="5">5★</option>
                    <option value="4">4★</option>
                    <option value="3">3★</option>
                    <option value="2">2★</option>
                    <option value="1">1★</option>
                  </select>
                </div>

                {filteredReviews.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredReviews.map((review) => (
                      <div key={review.id} className="border-bottom border-secondary pb-2 mb-2">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div className="d-flex align-items-center gap-1">
                            <span className="fw-semibold text-white small">{review.userName}</span>
                            {review.verified && (
                              <span className="badge bg-success" style={{ fontSize: '0.6rem', padding: '0.1em 0.3em' }}>✓</span>
                            )}
                          </div>
                          <span className="text-muted-custom" style={{ fontSize: '0.65rem' }}>{review.date}</span>
                        </div>
                        <div className="mb-1">{renderStars(review.rating, 'small')}</div>
                        <p className="text-white mb-0 small fw-semibold" style={{ fontSize: '0.8rem' }}>{review.title}</p>
                        <p className="text-muted-custom mb-1" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>{review.comment}</p>
                        <button 
                          className={`btn btn-sm py-0 px-1 ${helpfulClicked.includes(review.id) ? 'btn-success' : 'btn-outline-secondary'}`}
                          style={{ fontSize: '0.65rem' }}
                          onClick={() => handleHelpful(review.id)}
                          disabled={helpfulClicked.includes(review.id)}
                        >
                          <i className="bi bi-hand-thumbs-up me-1"></i>Helpful ({review.helpful})
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-muted-custom mb-0 small">No reviews yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="col-lg-6">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <span className="badge badge-info mb-2">{product.tag}</span>
              <h1 className="product-name-highlight mb-0">{product.name}</h1>
            </div>
            <button
              className={`btn btn-ghost btn-lg rounded-circle ${isWishlisted ? 'text-danger' : ''}`}
              onClick={() => onToggleWishlist(product.id)}
            >
              <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'} fs-4`}></i>
            </button>
          </div>

          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="fs-2 fw-bold text-white">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="fs-5 text-decoration-line-through text-muted-custom">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="badge bg-success">Save {discount}%</span>
              </>
            )}
          </div>

          <p className="text-muted-custom mb-4">{product.description}</p>

          <span className="badge badge-primary mb-4">{product.badge}</span>

          {/* Gym Equipment Specifications */}
          {(product.category?.toLowerCase().includes('equipment') || product.sport === 'Gym') && (product.weight || product.length || product.equipmentType || product.material) && (
            <div className="card bg-dark border-warning mb-4">
              <div className="card-header bg-transparent border-warning py-2">
                <h6 className="text-warning mb-0">
                  <i className="bi bi-gear-wide-connected me-2"></i>Equipment Specifications
                </h6>
              </div>
              <div className="card-body py-3">
                <div className="row g-3">
                  {product.equipmentType && (
                    <div className="col-6 col-md-4">
                      <small className="text-muted-custom d-block">Type</small>
                      <span className="text-white">{product.equipmentType}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="col-6 col-md-4">
                      <small className="text-muted-custom d-block">Weight</small>
                      <span className="text-warning fw-bold">{product.weight} {product.weightUnit || 'kg'}</span>
                    </div>
                  )}
                  {product.maxCapacity && (
                    <div className="col-6 col-md-4">
                      <small className="text-muted-custom d-block">Max Capacity</small>
                      <span className="text-white">{product.maxCapacity} kg</span>
                    </div>
                  )}
                  {product.material && (
                    <div className="col-6 col-md-4">
                      <small className="text-muted-custom d-block">Material</small>
                      <span className="text-white">{product.material}</span>
                    </div>
                  )}
                  {(product.length || product.width || product.height) && (
                    <div className="col-6 col-md-4">
                      <small className="text-muted-custom d-block">Dimensions (L×W×H)</small>
                      <span className="text-white">
                        {product.length || '-'} × {product.width || '-'} × {product.height || '-'} {product.dimensionUnit || 'cm'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div className="mb-4">
            <label className="form-label fw-semibold black-font">Size</label>
            <div className="d-flex flex-wrap gap-2">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  className={`option-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-4">
            <label className="form-label fw-semibold black-font">Color</label>
            <div className="d-flex flex-wrap gap-2">
              {product.colors?.map((color) => {
                const unavailableColors = ['Yellow', 'Orange', 'Pink', 'Purple'];
                const isAvailable = !unavailableColors.includes(color);
                let swatchColor;
                if (typeof color === 'string') {
                  swatchColor = color.toLowerCase().replace(/\s/g, '');
                  if (["rickieorange", "white-rickieorange"].includes(swatchColor)) swatchColor = "#ff8533";
                  else if (swatchColor === "white") swatchColor = "#fff";
                  else if (/^#[0-9a-f]{3,6}$/i.test(swatchColor)) swatchColor = swatchColor;
                  else if (["black","red","blue","green","yellow","orange","pink","purple","grey","gray","brown"].includes(swatchColor)) swatchColor = swatchColor;
                  else swatchColor = "#eee";
                } else {
                  swatchColor = "#eee";
                }
                return (
                  <button
                    key={color}
                    className={`option-btn ${selectedColor === color ? 'active' : ''} ${!isAvailable ? 'opacity-50' : ''}`}
                    onClick={() => {
                      setSelectedColor(color);
                      if (isAvailable) {
                        Swal.fire({
                          toast: true,
                          position: 'top-end',
                          icon: 'success',
                          title: 'In Stock!',
                          html: `<span style=\"color: #111;\">${color} is available</span>`,
                          showConfirmButton: false,
                          timer: 1500,
                          background: '#fff',
                          color: '#111',
                          iconColor: '#28a745'
                        });
                      } else {
                        Swal.fire({
                          toast: true,
                          position: 'top-end',
                          icon: 'error',
                          title: 'Out of Stock',
                          html: `<span style=\"color: #111;\">${color} is not available</span>`,
                          showConfirmButton: false,
                          timer: 2000,
                          background: '#fff',
                          color: '#111',
                          iconColor: '#dc3545'
                        });
                      }
                    }}
                  >
                    <span className={`color-swatch${selectedColor === color ? ' selected' : ''}`} style={{ background: swatchColor, borderColor: selectedColor === color ? '#111' : '#bbb' }}></span>
                    {color}
                    {!isAvailable && <i className="bi bi-x-circle ms-1 small"></i>}
                  </button>
                );
              })}
            </div>
            {selectedColor && (
              <div className="mt-2">
                {!['Yellow', 'Orange', 'Pink', 'Purple'].includes(selectedColor) ? (
                  <small className="text-success black-font">
                    <i className="bi bi-check-circle me-1"></i>
                    {selectedColor} is available
                  </small>
                ) : (
                  <small className="text-danger black-font">
                    <i className="bi bi-x-circle me-1"></i>
                    {selectedColor} is not available - Please select another color
                  </small>
                )}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <label className="form-label fw-semibold black-font">Quantity</label>
            <div className="quantity-selector">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <i className="bi bi-dash"></i>
              </button>
              <span className="black-font">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
                <i className="bi bi-plus"></i>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="d-grid gap-3 mb-4">
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
              <i className="bi bi-bag-plus me-2"></i>
              Add to Cart - {formatPrice(product.price * quantity)}
            </button>
            <button
              className={`btn btn-ghost btn-lg ${isWishlisted ? 'text-danger' : ''}`}
              onClick={() => onToggleWishlist(product.id)}
            >
              <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
              {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Extra Info */}
          <div className="card-dark">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-truck text-warning fs-4"></i>
                <span className="text-muted-custom" style={{color: '#111'}}>Free shipping on orders over ₹5,000</span>
              </div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-arrow-repeat text-warning fs-4"></i>
                <span className="text-muted-custom" style={{color: '#111'}}>30-day free returns</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-check-circle text-success fs-4"></i>
                <span className="text-muted-custom" style={{color: '#111'}}>In stock - Ships within 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grouped by Category */}
      {productsByCategory.length > 0 && (
        <section className="mt-5 pt-4 border-top border-custom">
          <div className="mb-4">
            <span className="badge badge-primary mb-2" style={{color: '#111'}}>You May Also Like</span>
            <h3 className="mb-0" style={{color: '#111'}}>Related Products</h3>
          </div>
          {productsByCategory.map(({ category, items }) => (
            <div key={category} className="mb-4">
              <h5 className="text-warning mb-2">{category}</h5>
              <div className="d-flex gap-3 overflow-auto pb-3" style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {items.map(relatedProduct => (
                  <div
                    key={relatedProduct.id}
                    style={{ minWidth: '280px', maxWidth: '280px', scrollSnapAlign: 'start' }}
                  >
                    <ProductCard
                      product={relatedProduct}
                      onAddToCart={onAddToCart}
                      isWishlisted={wishlist?.includes(relatedProduct.id)}
                      onToggleWishlist={onToggleWishlist}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}

export default ProductDetail
