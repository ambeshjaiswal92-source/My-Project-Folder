import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductContext'
import { productTypes, productMatchesSport, getSportBySlug } from '../data/sports'

function Products({ onAddToCart, wishlist, onToggleWishlist }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { getActiveProducts } = useProducts()
  const products = getActiveProducts()

  // Get filters from URL
  const urlSport = searchParams.get('sport') || 'all'
  const urlType = searchParams.get('type') || 'all'

  const categories = useMemo(() => {
    const base = [
      'All',
      'Wear',        // Clothing items
      'Footwear',    // Shoes, sneakers
      'Equipment',   // Sports gear
      'Accessories', // Small items
      'Wearable',    // Smart devices
      'Gear',        // Bags, packs
    ]
    const set = new Set(base)
    products.forEach((p) => {
      const name = (p.category || p.tag || 'Featured').trim() || 'Featured'
      set.add(name)
    })
    return Array.from(set)
  }, [products])

  const [filterSport, setFilterSport] = useState(urlSport)
  const [filterType, setFilterType] = useState(urlType)
  const [filterGender, setFilterGender] = useState('All')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [searchTerm, setSearchTerm] = useState('')

  // Sync URL params with state
  useEffect(() => {
    setFilterSport(urlSport)
    setFilterType(urlType)
  }, [urlSport, urlType])

  // Get current sport name for display
  const currentSport = getSportBySlug(filterSport)

  const handleTypeChange = (type) => {
    setFilterType(type)
    const params = new URLSearchParams(searchParams)
    if (type === 'all') {
      params.delete('type')
    } else {
      params.set('type', type)
    }
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilterSport('all')
    setFilterType('all')
    setFilterGender('All')
    setInStockOnly(false)
    setSearchTerm('')
    setSearchParams({})
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryVal = (product.category || product.tag || '').toLowerCase()
      const nameVal = (product.name || '').toLowerCase()
      const descVal = (product.description || '').toLowerCase()
      const genderVal = (product.gender || 'Unisex').toLowerCase()

      // Sport filter - use the helper function from sports.js (from URL/navbar only)
      const matchesSport = productMatchesSport(product, filterSport)

      // Type filter - check category
      let matchesType = filterType === 'all'
      if (!matchesType) {
        const typeKeyword = filterType.toLowerCase().replace('-', ' ')
        matchesType = categoryVal.includes(typeKeyword) ||
          categoryVal.includes(filterType.toLowerCase())
      }

      const matchesGender = filterGender === 'All'
        ? true
        : genderVal === filterGender.toLowerCase()
      const matchesStock = inStockOnly ? Number(product.stock || 0) > 0 : true
      const matchesSearch = nameVal.includes(searchTerm.toLowerCase()) ||
        descVal.includes(searchTerm.toLowerCase())

      return matchesSport && matchesType && matchesGender && matchesStock && matchesSearch
    })
  }, [products, filterSport, filterType, filterGender, inStockOnly, searchTerm])

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

  // Group sorted products by category
  const grouped = sortedProducts.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <main className="py-5">
      <div className="container">
        {/* Filters UI */}
        <div className="row mb-4 g-2">
          <div className="col-12">
            <div className="d-flex flex-row flex-nowrap gap-2 align-items-center" style={{background:'#f5f7fa', padding:'8px 0'}}>
              {/* Type Filter */}
              <select className="form-select w-auto" style={{background:'#111',color:'#fff',border:'none'}} value={filterType} onChange={e => handleTypeChange(e.target.value)}>
                <option value="all">All Types</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
              {/* Gender Filter */}
              <select className="form-select w-auto" style={{background:'#111',color:'#fff',border:'none'}} value={filterGender} onChange={e => setFilterGender(e.target.value)}>
                <option value="All">All Genders</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
              {/* In Stock Only */}
              <label className="form-check-label ms-2" style={{color:'#111',opacity:0.5}}>
                <input type="checkbox" className="form-check-input me-1" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
                In Stock Only
              </label>
              {/* Sort By */}
              <select className="form-select w-auto ms-2" style={{background:'#111',color:'#fff',border:'none'}} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="newest">Newest</option>
              </select>
              {/* Search */}
              <input type="text" className="form-control w-auto ms-2" style={{background:'#111',color:'#fff',border:'none'}} placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              {/* Clear Filters */}
              <button className="btn btn-link ms-2" style={{color:'#7c8ba1'}} onClick={clearFilters}><i className="bi bi-x-lg me-1"></i>Clear</button>
            </div>
          </div>
        </div>
        {/* Results Count */}
        <div className="mb-3 text-muted-custom small">
          Showing {sortedProducts.length} of {products.length} products
        </div>

        {/* Products Grouped by Category */}
        {Object.keys(grouped).length === 0 ? (
          <div className="col-12 text-center py-5">
            <i className="bi bi-search display-1 text-muted-custom mb-4 d-block"></i>
            <h4 className="text-white mb-2">No products match your filters</h4>
            <p className="text-muted-custom mb-4">Try adjusting your filters or search term.</p>
            <button className="btn btn-primary" onClick={clearFilters}>
              <i className="bi bi-arrow-counterclockwise me-2"></i> Reset Filters
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-5">
              <h4 className="text-warning mb-3">{category}</h4>
              <div className="row g-3 g-md-4">
                {items.map(product => (
                  <div key={product.id} className="col-6 col-md-4 col-lg-4 col-xl-3">
                    <ProductCard
                      product={product}
                      onAddToCart={onAddToCart}
                      wishlist={wishlist}
                      onToggleWishlist={onToggleWishlist}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default Products
