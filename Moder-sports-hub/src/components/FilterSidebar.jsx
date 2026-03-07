import { useState } from 'react'

function FilterSidebar({
  sports,
  categories,
  brands,
  selectedSports,
  selectedCategories,
  selectedGenders,
  selectedBrands,
  onSportChange,
  onCategoryChange,
  onGenderChange,
  onBrandChange,
  onClearFilters
}) {
  const [expandedSections, setExpandedSections] = useState({
    sport: true,
    brand: false,
    category: false,
    gender: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const genders = ['Men', 'Women', 'Unisex']

  const handleCheckboxChange = (type, value, checked) => {
    switch (type) {
      case 'sport':
        onSportChange(value, checked)
        break
      case 'category':
        onCategoryChange(value, checked)
        break
      case 'gender':
        onGenderChange(value, checked)
        break
      case 'brand':
        onBrandChange(value, checked)
        break
    }
  }

  const hasActiveFilters = selectedSports.length > 0 || 
    selectedCategories.length > 0 || 
    selectedGenders.length > 0 || 
    selectedBrands.length > 0

  return (
    <div className="filter-sidebar">
      <div className="filter-sidebar-header">
        <h5 className="filter-sidebar-title">Filters</h5>
        {hasActiveFilters && (
          <button className="filter-clear-link" onClick={onClearFilters}>
            Clear all
          </button>
        )}
      </div>

      {/* Sport Filter */}
      <div className="filter-section">
        <button 
          className="filter-section-toggle"
          onClick={() => toggleSection('sport')}
        >
          <span>Sport</span>
          <i className={`bi ${expandedSections.sport ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
        {expandedSections.sport && (
          <div className="filter-section-content">
            {sports.map((sport) => (
              <label key={sport.id} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedSports.includes(sport.slug)}
                  onChange={(e) => handleCheckboxChange('sport', sport.slug, e.target.checked)}
                />
                <span className="filter-checkbox-text">{sport.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div className="filter-section">
        <button 
          className="filter-section-toggle"
          onClick={() => toggleSection('brand')}
        >
          <span>Brand</span>
          <i className={`bi ${expandedSections.brand ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
        {expandedSections.brand && (
          <div className="filter-section-content">
            {brands.map((brand) => (
              <label key={brand} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={(e) => handleCheckboxChange('brand', brand, e.target.checked)}
                />
                <span className="filter-checkbox-text">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <button 
          className="filter-section-toggle"
          onClick={() => toggleSection('category')}
        >
          <span>Category</span>
          <i className={`bi ${expandedSections.category ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
        {expandedSections.category && (
          <div className="filter-section-content">
            {categories.map((cat) => (
              <label key={cat} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.toLowerCase())}
                  onChange={(e) => handleCheckboxChange('category', cat.toLowerCase(), e.target.checked)}
                />
                <span className="filter-checkbox-text">{cat}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Gender Filter */}
      <div className="filter-section">
        <button 
          className="filter-section-toggle"
          onClick={() => toggleSection('gender')}
        >
          <span>Gender</span>
          <i className={`bi ${expandedSections.gender ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
        {expandedSections.gender && (
          <div className="filter-section-content">
            {genders.map((gender) => (
              <label key={gender} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedGenders.includes(gender)}
                  onChange={(e) => handleCheckboxChange('gender', gender, e.target.checked)}
                />
                <span className="filter-checkbox-text">{gender}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterSidebar
