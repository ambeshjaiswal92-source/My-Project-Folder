import { useMemo, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductContext'
import { sportsCategories, productMatchesSport, getSportBySlug } from '../data/sports'

function Sports({ onAddToCart, wishlist, onToggleWishlist }) {
  const { sportSlug } = useParams()
  const { getActiveProducts } = useProducts()
  const products = getActiveProducts()

  const [filterGender, setFilterGender] = useState('All')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [searchTerm, setSearchTerm] = useState('')

  // Get current sport info
  const currentSport = getSportBySlug(sportSlug)

  const clearFilters = () => {
    setFilterGender('All')
    setInStockOnly(false)
    setSearchTerm('')
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const nameVal = (product.name || '').toLowerCase()
      const descVal = (product.description || '').toLowerCase()
      const genderVal = (product.gender || 'Unisex').toLowerCase()

      // Sport filter
      const matchesSport = sportSlug ? productMatchesSport(product, sportSlug) : true

      const matchesGender = filterGender === 'All'
        ? true
        : genderVal === filterGender.toLowerCase()
      const matchesStock = inStockOnly ? Number(product.stock || 0) > 0 : true
      const matchesSearch = nameVal.includes(searchTerm.toLowerCase()) ||
        descVal.includes(searchTerm.toLowerCase())

      return matchesSport && matchesGender && matchesStock && matchesSearch
    })
  }, [products, sportSlug, filterGender, inStockOnly, searchTerm])

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => (a.price || 0) - (b.price || 0))
      case 'price-desc':
        return list.sort((a, b) => (b.price || 0) - (a.price || 0))
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name))
      case 'newest':
        return list.sort((a, b) => (b.createdAt || b.id || '').toString().localeCompare((a.createdAt || a.id || '').toString()))
      default:
        return list
    }
  }, [filteredProducts, sortBy])

  // If no sport selected, show all sports slider
  if (!sportSlug) {
    return (
      <main className="py-5">
        <div className="container-fluid px-3 px-md-5">
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div>
              <span className="badge badge-primary mb-2">Sports</span>
              <h2 className="text-white mb-2">Browse by Sport</h2>
              <p className="text-muted-custom mb-0">Select a sport to explore related products and gear</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <button 
                className="btn btn-outline-light btn-sm rounded-circle"
                onClick={() => {
                  const slider = document.getElementById('sportsSlider')
                  if (slider) slider.scrollBy({ left: -320, behavior: 'smooth' })
                }}
                style={{ width: '40px', height: '40px' }}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button 
                className="btn btn-outline-light btn-sm rounded-circle"
                onClick={() => {
                  const slider = document.getElementById('sportsSlider')
                  if (slider) slider.scrollBy({ left: 320, behavior: 'smooth' })
                }}
                style={{ width: '40px', height: '40px' }}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* Sports Slider */}
          <div 
            id="sportsSlider"
            className="d-flex gap-3 overflow-auto pb-3"
            style={{ 
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {sportsCategories.map((sport) => (
              <Link
                key={sport.slug}
                to={`/sports/${sport.slug}`}
                className="card-dark text-decoration-none d-block overflow-hidden flex-shrink-0"
                style={{ 
                  width: '280px',
                  scrollSnapAlign: 'start',
                  transition: 'transform 0.2s, box-shadow 0.2s' 
                }}
              >
                <div className="position-relative" style={{ height: '200px' }}>
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                  <div 
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)' }}
                  ></div>
                </div>
                <div className="p-3 text-center">
                  <h5 className="text-white mb-1">{sport.name}</h5>
                  <p className="text-muted-custom small mb-0 text-truncate">{sport.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-warning">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/sports" className="text-warning">Sports</Link>
            </li>
            <li className="breadcrumb-item active text-white" aria-current="page">
              {currentSport?.name || sportSlug}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <span className="badge badge-primary mb-2">
              {currentSport?.icon} {currentSport?.name || 'Sport'}
            </span>
            <h2 className="text-white mb-1">
              {currentSport?.name} Products
            </h2>
            <p className="text-muted-custom mb-0">
              {currentSport?.description || 'Browse products for this sport'}
            </p>
          </div>
          {(filterGender !== 'All' || inStockOnly || searchTerm) && (
            <button className="btn btn-outline-warning btn-sm" onClick={clearFilters}>
              <i className="bi bi-x-circle me-1"></i> Clear Filters
            </button>
          )}
        </div>

        {/* Other Sports Pills */}
        <div className="mb-4">
          <label className="text-muted-custom small d-block mb-2">
            <i className="bi bi-trophy me-1"></i> Switch Sport
          </label>
          <div className="d-flex flex-wrap gap-2">
            {sportsCategories.map((sport) => (
              <Link
                key={sport.slug}
                to={`/sports/${sport.slug}`}
                className={`btn btn-sm ${sportSlug === sport.slug ? 'btn-warning' : 'btn-outline-secondary'}`}
              >
                {sport.icon} {sport.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="card-dark mb-4 p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-dark border-custom text-muted-custom">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-control-dark"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-8">
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                <select
                  className="form-select form-select-dark w-auto"
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                >
                  <option value="All">All Genders</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
                <select
                  className="form-select form-select-dark w-auto"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                  <option value="newest">Newest First</option>
                </select>
                <div className="form-check form-switch d-flex align-items-center ms-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="inStockSports"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  <label className="form-check-label text-muted-custom ms-2" htmlFor="inStockSports">
                    In Stock
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count & Slider Controls */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="text-muted-custom mb-0">
            Showing <span className="text-white fw-semibold">{sortedProducts.length}</span> {currentSport?.name} products
          </p>
          <div className="d-flex gap-2 align-items-center">
            <button 
              className="btn btn-outline-light btn-sm rounded-circle"
              onClick={() => {
                const slider = document.getElementById('sportsProductSlider')
                if (slider) slider.scrollBy({ left: -320, behavior: 'smooth' })
              }}
              style={{ width: '40px', height: '40px' }}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button 
              className="btn btn-outline-light btn-sm rounded-circle"
              onClick={() => {
                const slider = document.getElementById('sportsProductSlider')
                if (slider) slider.scrollBy({ left: 320, behavior: 'smooth' })
              }}
              style={{ width: '40px', height: '40px' }}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Products Slider */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-5">
            <div className="display-1 mb-3">😕</div>
            <h4 className="text-white mb-2">No products found</h4>
            <p className="text-muted-custom mb-4">
              We couldn't find any {currentSport?.name} products matching your filters.
            </p>
            <button className="btn btn-warning" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div 
            id="sportsProductSlider"
            className="d-flex gap-3 overflow-auto pb-3"
            style={{ 
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {sortedProducts.map((product) => (
              <div 
                key={product.id} 
                style={{ 
                  minWidth: '280px', 
                  maxWidth: '280px',
                  scrollSnapAlign: 'start'
                }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  isWishlisted={wishlist?.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Sports
