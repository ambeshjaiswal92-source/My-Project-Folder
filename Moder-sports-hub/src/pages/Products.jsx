import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import FilterSidebar from '../components/FilterSidebar'
import { useProducts } from '../context/ProductContext'
import { sportsCategories, productMatchesSport } from '../data/sports'

function Products({ onAddToCart, wishlist, onToggleWishlist }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { getActiveProducts } = useProducts()
  const products = getActiveProducts()

  // Get filters from URL
  const urlSport = searchParams.get('sport') || ''

  const categories = useMemo(() => {
    const base = ['Wear', 'Footwear', 'Equipment', 'Accessories']
    const excludeCategories = ['Wearable', 'Gear', 'Performance Wear', 'All']
    const set = new Set(base)
    products.forEach((p) => {
      const name = (p.category || p.tag || 'Featured').trim() || 'Featured'
      if (!excludeCategories.includes(name)) {
        set.add(name)
      }
    })
    return Array.from(set)
  }, [products])

  // Extract unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set()
    products.forEach((p) => {
      if (p.brand) brandSet.add(p.brand)
    })
    return Array.from(brandSet).sort()
  }, [products])

  // Multi-select filter states
  const [selectedSports, setSelectedSports] = useState(urlSport ? [urlSport] : [])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedGenders, setSelectedGenders] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [sortBy, setSortBy] = useState('featured')
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Sync URL params with state
  useEffect(() => {
    if (urlSport && !selectedSports.includes(urlSport)) {
      setSelectedSports([urlSport])
    }
  }, [urlSport])

  // Filter handlers
  const handleSportChange = (sport, checked) => {
    setSelectedSports(prev => 
      checked ? [...prev, sport] : prev.filter(s => s !== sport)
    )
  }

  const handleCategoryChange = (category, checked) => {
    setSelectedCategories(prev => 
      checked ? [...prev, category] : prev.filter(c => c !== category)
    )
  }

  const handleGenderChange = (gender, checked) => {
    setSelectedGenders(prev => 
      checked ? [...prev, gender] : prev.filter(g => g !== gender)
    )
  }

  const handleBrandChange = (brand, checked) => {
    setSelectedBrands(prev => 
      checked ? [...prev, brand] : prev.filter(b => b !== brand)
    )
  }

  const clearFilters = () => {
    setSelectedSports([])
    setSelectedCategories([])
    setSelectedGenders([])
    setSelectedBrands([])
    setSearchTerm('')
    setSearchParams({})
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryVal = (product.category || product.tag || '').toLowerCase()
      const nameVal = (product.name || '').toLowerCase()
      const descVal = (product.description || '').toLowerCase()
      const genderVal = (product.gender || 'Unisex')
      const brandVal = product.brand || ''

      // Sport filter - check if any selected sport matches
      let matchesSport = selectedSports.length === 0
      if (!matchesSport) {
        matchesSport = selectedSports.some(sport => productMatchesSport(product, sport))
      }

      // Category filter
      let matchesCategory = selectedCategories.length === 0
      if (!matchesCategory) {
        matchesCategory = selectedCategories.some(cat => categoryVal.includes(cat))
      }

      // Gender filter
      let matchesGender = selectedGenders.length === 0
      if (!matchesGender) {
        matchesGender = selectedGenders.includes(genderVal)
      }

      // Brand filter
      let matchesBrand = selectedBrands.length === 0
      if (!matchesBrand) {
        matchesBrand = selectedBrands.includes(brandVal)
      }

      // Search filter
      const matchesSearch = searchTerm === '' || 
        nameVal.includes(searchTerm.toLowerCase()) ||
        descVal.includes(searchTerm.toLowerCase())

      return matchesSport && matchesCategory && matchesGender && matchesBrand && matchesSearch
    })
  }, [products, selectedSports, selectedCategories, selectedGenders, selectedBrands, searchTerm])

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

  const activeFilterCount = selectedSports.length + selectedCategories.length + 
    selectedGenders.length + selectedBrands.length

  return (
    <main className="py-4">
      <div className="container-fluid px-3 px-lg-5">
        <div className="row">
          {/* Mobile Filter Toggle */}
          <div className="col-12 d-lg-none mb-3">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <i className="bi bi-funnel me-2"></i>
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {/* Mobile Filter Overlay */}
          {showMobileFilters && (
            <div className="filter-mobile-overlay d-lg-none">
              <div className="filter-mobile-content">
                <div className="filter-mobile-header">
                  <h5>Filters</h5>
                  <button 
                    className="btn-close" 
                    onClick={() => setShowMobileFilters(false)}
                  ></button>
                </div>
                <FilterSidebar
                  sports={sportsCategories}
                  categories={categories}
                  brands={brands}
                  selectedSports={selectedSports}
                  selectedCategories={selectedCategories}
                  selectedGenders={selectedGenders}
                  selectedBrands={selectedBrands}
                  onSportChange={handleSportChange}
                  onCategoryChange={handleCategoryChange}
                  onGenderChange={handleGenderChange}
                  onBrandChange={handleBrandChange}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="col-lg-3 col-xl-2 d-none d-lg-block">
            <FilterSidebar
              sports={sportsCategories}
              categories={categories}
              brands={brands}
              selectedSports={selectedSports}
              selectedCategories={selectedCategories}
              selectedGenders={selectedGenders}
              selectedBrands={selectedBrands}
              onSportChange={handleSportChange}
              onCategoryChange={handleCategoryChange}
              onGenderChange={handleGenderChange}
              onBrandChange={handleBrandChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Products Section */}
          <div className="col-lg-9 col-xl-10">
            {/* Top Bar: Search and Sort */}
            <div className="products-topbar mb-4">
              <div className="products-topbar-left">
                <input 
                  type="text" 
                  className="products-search-input" 
                  placeholder="Search products..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
              <div className="products-topbar-right">
                <span className="products-count">
                  {sortedProducts.length} products
                </span>
                <select 
                  className="products-sort-select" 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="active-filters mb-3">
                {selectedSports.map(sport => {
                  const sportData = sportsCategories.find(s => s.slug === sport)
                  return (
                    <span key={sport} className="active-filter-tag">
                      {sportData?.name || sport}
                      <button onClick={() => handleSportChange(sport, false)}>
                        <i className="bi bi-x"></i>
                      </button>
                    </span>
                  )
                })}
                {selectedCategories.map(cat => (
                  <span key={cat} className="active-filter-tag">
                    {cat}
                    <button onClick={() => handleCategoryChange(cat, false)}>
                      <i className="bi bi-x"></i>
                    </button>
                  </span>
                ))}
                {selectedGenders.map(gender => (
                  <span key={gender} className="active-filter-tag">
                    {gender}
                    <button onClick={() => handleGenderChange(gender, false)}>
                      <i className="bi bi-x"></i>
                    </button>
                  </span>
                ))}
                {selectedBrands.map(brand => (
                  <span key={brand} className="active-filter-tag">
                    {brand}
                    <button onClick={() => handleBrandChange(brand, false)}>
                      <i className="bi bi-x"></i>
                    </button>
                  </span>
                ))}
                <button className="clear-all-filters-btn" onClick={clearFilters}>
                  Clear All
                </button>
              </div>
            )}

            {/* Products Grid */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search display-1 text-muted-custom mb-4 d-block"></i>
                <h4 className="text-white mb-2">No products match your filters</h4>
                <p className="text-muted-custom mb-4">Try adjusting your filters or search term.</p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  <i className="bi bi-arrow-counterclockwise me-2"></i> Reset Filters
                </button>
              </div>
            ) : (
              <div className="row g-3 g-md-4">
                {sortedProducts.map(product => (
                  <div key={product.id} className="col-6 col-md-4 col-xl-3">
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      wishlist={wishlist}
                      onToggleWishlist={onToggleWishlist}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Products
