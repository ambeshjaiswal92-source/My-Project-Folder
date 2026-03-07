import { useMemo, useState } from 'react'
import { useProducts } from '../../context/ProductContext'
import axios from 'axios'

function AdminProducts() {
  const { getAllProducts, addProduct, updateProduct, deleteProduct, refreshProducts } = useProducts()
  const products = getAllProducts()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [filterSport, setFilterSport] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Status types for filter dropdown
  const statusList = useMemo(() => {
    const defaultStatuses = ['All', 'Active', 'Low Stock', 'Out of Stock']
    const set = new Set(defaultStatuses)
    products.forEach((p) => {
      if (p.status) set.add(p.status)
    })
    return Array.from(set)
  }, [products])

  // Sports types for filter dropdown
  const sportsList = useMemo(() => {
    const defaultSports = ['All', 'Running', 'Football', 'Basketball', 'Cricket', 'Tennis', 'Gym', 'Swimming', 'Cycling', 'Yoga', 'Other']
    const set = new Set(defaultSports)
    products.forEach((p) => {
      if (p.sport) set.add(p.sport)
    })
    return Array.from(set)
  }, [products])

  const categories = useMemo(() => {
    const validCategories = ['All', 'Performance Wear', 'Footwear', 'Equipment', 'Accessories']
    return validCategories
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory
    const matchesSport = filterSport === 'All' || (product.sport || '') === filterSport
    const matchesStatus = filterStatus === 'All' || (product.status || '') === filterStatus
    return matchesSearch && matchesCategory && matchesSport && matchesStatus
  })

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id)
        // Refresh from backend to ensure sync
        await refreshProducts()
      } catch (error) {
        alert(`Error deleting product: ${error.message}`)
      }
    }
  }

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
      } else {
        await addProduct(productData)
      }
      // Refresh from backend to ensure sync
      await refreshProducts()
      setShowAddModal(false)
      setEditingProduct(null)
    } catch (error) {
      alert(`Error saving product: ${error.message}`)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase().replace(' ', '-')) {
      case 'active': return 'bg-success'
      case 'low-stock': return 'bg-warning text-dark'
      case 'out-of-stock': return 'bg-danger'
      default: return 'bg-secondary'
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="text-white mb-1">
            <i className="bi bi-box-seam me-2 text-warning"></i>Products
          </h2>
          <p className="text-muted-custom mb-0">
            Manage your product inventory 
            <span className="badge bg-success ms-2">
              <i className="bi bi-arrow-repeat me-1"></i>Synced with Store
            </span>
          </p>
        </div>
        <div className="d-flex gap-2">
          <a href="/" target="_blank" className="btn btn-outline-warning">
            <i className="bi bi-eye me-2"></i>Preview Store
          </a>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-lg me-2"></i>Add Product
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert alert-info bg-opacity-10 border-info mb-4" style={{ backgroundColor: 'rgba(13, 202, 240, 0.1)' }}>
        <div className="d-flex align-items-center">
          <i className="bi bi-shop text-info me-3 fs-4"></i>
          <div>
            <strong className="text-white">Store Product Management</strong>
            <p className="text-muted-custom mb-0 small">
              Products added here appear directly in your online store. Changes reflect instantly for customers.
              <span className="ms-2 text-info">User accounts are managed separately in the Users section.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-dark mb-4">
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
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <div className="d-flex gap-2 align-items-center">
                <span className="text-muted-custom small">Category</span>
                <select
                  className="form-select form-select-sm w-auto bg-dark text-white border-secondary"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <span className="text-muted-custom small">Product Status</span>
                <select
                  className="form-select form-select-sm w-auto bg-dark text-white border-secondary"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  {statusList.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <span className="text-muted-custom small">Sports Type</span>
                <select
                  className="form-select form-select-sm w-auto bg-dark text-white border-secondary"
                  value={filterSport}
                  onChange={(e) => setFilterSport(e.target.value)}
                >
                  {sportsList.map((sport) => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card-dark">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted-custom small">
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0">
            <thead>
              <tr className="border-secondary">
                <th className="text-muted-custom fw-normal" style={{ width: '300px' }}>Product</th>
                <th className="text-muted-custom fw-normal">Category</th>
                <th className="text-muted-custom fw-normal">Price</th>
                <th className="text-muted-custom fw-normal">Stock</th>
                <th className="text-muted-custom fw-normal">Status</th>
                <th className="text-muted-custom fw-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-secondary">
                  <td>
                    <div className="d-flex align-items-center">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="rounded me-3"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        onError={(e) => e.target.src = 'https://placehold.co/50x50/1a1a2e/ffffff?text=No+Img'}
                      />
                      <div>
                        <div className="text-white">{product.name}</div>
                        <div className="text-muted-custom small">{product.badge}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-custom">{product.category}</td>
                  <td className="text-warning">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="text-white">{product.stock}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <a
                        href={`/product/${product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-success"
                        title="View in Store"
                      >
                        <i className="bi bi-eye"></i>
                      </a>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          setEditingProduct(product)
                          setShowAddModal(true)
                        }}
                        title="Edit Product"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(product.id)}
                        title="Delete Product"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ProductModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowAddModal(false)
            setEditingProduct(null)
          }}
          categories={categories.filter((c) => c !== 'All')}
        />
      )}
    </div>
  )
}

function ProductModal({ product, onSave, onClose, categories }) {
  // Size presets based on category
  const CLOTHING_SIZES = 'XS, S, M, L, XL, XXL'
  const SHOE_SIZES = '6, 7, 8, 9, 10, 11, 12'
  const PANT_SIZES = '28, 30, 32, 34, 36, 38, 40'
  const ONE_SIZE = 'One Size'

  const getSizesForCategory = (category, productName = '') => {
    const cat = (category || '').toLowerCase()
    const name = (productName || '').toLowerCase()
    
    // Footwear
    if (cat.includes('footwear') || cat.includes('shoe') || cat.includes('sneaker') || cat.includes('boot')) {
      return SHOE_SIZES
    }
    
    // Pants/shorts/trousers (waist sizes)
    if (cat.includes('pant') || cat.includes('trouser') || cat.includes('jean') || cat.includes('short') ||
        name.includes('pant') || name.includes('trouser') || name.includes('jean') || name.includes('short')) {
      return PANT_SIZES
    }
    
    // Other clothing
    if (cat.includes('wear') || cat.includes('cloth') || cat.includes('apparel') || 
        cat.includes('tee') || cat.includes('shirt') || cat.includes('hoodie') || cat.includes('jacket')) {
      return CLOTHING_SIZES
    }
    
    // Equipment/accessories
    if (cat.includes('equipment') || cat.includes('gear') || cat.includes('wearable') || 
        cat.includes('accessori') || cat.includes('bag') || cat.includes('pack') || cat.includes('watch')) {
      return ONE_SIZE
    }
    return CLOTHING_SIZES
  }

  const getInitialSizes = () => {
    if (product?.sizes && Array.isArray(product.sizes)) {
      return product.sizes.join(', ')
    }
    return getSizesForCategory(product?.category || categories[0])
  }

  // Sports categories for dropdown
  const sportsList = ['Running', 'Football', 'Basketball', 'Cricket', 'Tennis', 'Gym', 'Swimming', 'Cycling', 'Yoga', 'Other']

  // Equipment types for gym equipment
  const equipmentTypes = ['Dumbbell', 'Barbell', 'Kettlebell', 'Weight Plate', 'Resistance Band', 'Pull-up Bar', 'Bench', 'Treadmill', 'Exercise Bike', 'Rowing Machine', 'Cable Machine', 'Smith Machine', 'Power Rack', 'Mat', 'Foam Roller', 'Jump Rope', 'Medicine Ball', 'Other']

  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    stock: product?.stock || '',
    category: product?.category || categories[0],
    sport: product?.sport || '',
    badge: product?.badge || '',
    image: product?.image || '',
    images: product?.images || [],
    status: product?.status || 'Active',
    sizes: getInitialSizes(),
    colors: Array.isArray(product?.colors) ? product.colors.join(', ') : 'Black, White',
    gender: product?.gender || 'Unisex',
    // Gym equipment specific fields
    equipmentType: product?.equipmentType || '',
    weight: product?.weight || '',
    weightUnit: product?.weightUnit || 'kg',
    length: product?.length || '',
    width: product?.width || '',
    height: product?.height || '',
    dimensionUnit: product?.dimensionUnit || 'cm',
    material: product?.material || '',
    maxCapacity: product?.maxCapacity || '',
  })

  const [uploading, setUploading] = useState(false)
  const [uploadingExtra, setUploadingExtra] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadExtraError, setUploadExtraError] = useState('')

  // Handle file upload for main image
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('image', file)

    setUploading(true)
    setUploadError('')

    try {
      const token = localStorage.getItem('admin_token')
      const res = await axios.post('http://localhost:4001/api/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })
      setFormData({ ...formData, image: `http://localhost:4001${res.data.imageUrl}` })
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Handle file upload for extra images
  const handleExtraImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (formData.images.length >= 4) {
      setUploadExtraError('Maximum 4 extra images allowed')
      return
    }

    const formDataUpload = new FormData()
    formDataUpload.append('image', file)

    setUploadingExtra(true)
    setUploadExtraError('')

    try {
      const token = localStorage.getItem('admin_token')
      const res = await axios.post('http://localhost:4001/api/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })
      const newImageUrl = `http://localhost:4001${res.data.imageUrl}`
      setFormData({ ...formData, images: [...formData.images, newImageUrl] })
    } catch (error) {
      setUploadExtraError(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingExtra(false)
      e.target.value = '' // Reset file input
    }
  }

  // Remove extra image
  const removeExtraImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  // Check if product is gym equipment
  const isGymEquipment = formData.category?.toLowerCase().includes('equipment') || formData.sport === 'Gym'

  // Update sizes when category changes
  const handleCategoryChange = (newCategory) => {
    const suggestedSizes = getSizesForCategory(newCategory)
    setFormData({ 
      ...formData, 
      category: newCategory,
      sizes: suggestedSizes 
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const stock = Number(formData.stock)
    let status = formData.status
    if (stock <= 0) status = 'Out of Stock'
    else if (stock <= 25) status = 'Low Stock'
    else status = 'Active'
    
    const sizes = formData.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const colors = formData.colors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)

    onSave({
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice) > Number(formData.price) 
        ? Number(formData.originalPrice) 
        : Math.round(Number(formData.price) * 1.2),
      stock,
      status,
      sport: formData.sport || '',
      images: formData.images || [],
      sizes: sizes.length ? sizes : getSizesForCategory(formData.category).split(', '),
      colors: colors.length ? colors : ['Black', 'White'],
      gender: formData.gender || 'Unisex',
      // Gym equipment specific fields
      equipmentType: formData.equipmentType || '',
      weight: formData.weight ? Number(formData.weight) : null,
      weightUnit: formData.weightUnit || 'kg',
      length: formData.length ? Number(formData.length) : null,
      width: formData.width ? Number(formData.width) : null,
      height: formData.height ? Number(formData.height) : null,
      dimensionUnit: formData.dimensionUnit || 'cm',
      material: formData.material || '',
      maxCapacity: formData.maxCapacity ? Number(formData.maxCapacity) : null,
    })
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-dark border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title text-white">
              <i className={`bi ${product ? 'bi-pencil' : 'bi-plus-circle'} me-2 text-warning`}></i>
              {product ? 'Edit Product' : 'Add New Product'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label text-white">Product Name</label>
                <input
                  type="text"
                  className="form-control form-control-dark"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-white">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-dark"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white">Original Price (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-dark"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="For discount display"
                  />
                </div>
              </div>
              
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-white">Stock</label>
                  <input
                    type="number"
                    className="form-control form-control-dark"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white">Badge</label>
                  <input
                    type="text"
                    className="form-control form-control-dark"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. New, Sale, Popular"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label text-white">Category</label>
                <select
                  className="form-select form-control-dark"
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <small className="text-muted-custom">
                  Sizes will auto-adjust: Footwear → shoe sizes, Wear/Apparel → clothing sizes
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label text-white">Sport Category</label>
                <select
                  className="form-select form-control-dark"
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                >
                  <option value="">Select a sport...</option>
                  {sportsList.map((sport) => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
                <small className="text-muted-custom">
                  Helps customers filter products by sport type
                </small>
              </div>

              {/* Gym Equipment Specifications */}
              {isGymEquipment && (
                <div className="card bg-secondary bg-opacity-25 border-warning mb-3">
                  <div className="card-header bg-transparent border-warning">
                    <h6 className="text-warning mb-0">
                      <i className="bi bi-gear-wide-connected me-2"></i>Gym Equipment Specifications
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-white">Equipment Type</label>
                        <select
                          className="form-select form-control-dark"
                          value={formData.equipmentType}
                          onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                        >
                          <option value="">Select type...</option>
                          {equipmentTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-white">Material</label>
                        <input
                          type="text"
                          className="form-control form-control-dark"
                          value={formData.material}
                          onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                          placeholder="e.g. Steel, Rubber, Iron"
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-4">
                        <label className="form-label text-white">Weight</label>
                        <div className="input-group">
                          <input
                            type="number"
                            step="0.1"
                            className="form-control form-control-dark"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            placeholder="0"
                          />
                          <select
                            className="form-select form-control-dark"
                            style={{ maxWidth: '80px' }}
                            value={formData.weightUnit}
                            onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                          >
                            <option value="kg">kg</option>
                            <option value="lbs">lbs</option>
                            <option value="g">g</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-white">Max Capacity</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control form-control-dark"
                            value={formData.maxCapacity}
                            onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                            placeholder="e.g. 150"
                          />
                          <span className="input-group-text bg-dark border-secondary text-muted-custom">kg</span>
                        </div>
                        <small className="text-muted-custom">Max user/load capacity</small>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-white">Dimension Unit</label>
                        <select
                          className="form-select form-control-dark"
                          value={formData.dimensionUnit}
                          onChange={(e) => setFormData({ ...formData, dimensionUnit: e.target.value })}
                        >
                          <option value="cm">Centimeters (cm)</option>
                          <option value="m">Meters (m)</option>
                          <option value="inch">Inches (in)</option>
                        </select>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label text-white">Length ({formData.dimensionUnit})</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control form-control-dark"
                          value={formData.length}
                          onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-white">Width ({formData.dimensionUnit})</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control form-control-dark"
                          value={formData.width}
                          onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-white">Height ({formData.dimensionUnit})</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control form-control-dark"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-3">
                <label className="form-label text-white">Main Product Image</label>
                <div className="d-flex gap-2 align-items-center mb-2">
                  <input
                    type="file"
                    className="form-control form-control-dark"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="spinner-border spinner-border-sm text-warning" role="status">
                      <span className="visually-hidden">Uploading...</span>
                    </div>
                  )}
                </div>
                {uploadError && <small className="text-danger">{uploadError}</small>}
                <div className="mt-2">
                  <small className="text-muted-custom">Or enter image URL directly:</small>
                  <input
                    type="text"
                    className="form-control form-control-dark mt-1"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                {formData.image && (
                  <div className="mt-2">
                    <small className="text-muted-custom">Preview:</small>
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="d-block mt-1 rounded" 
                      style={{ maxHeight: '100px', maxWidth: '100px', objectFit: 'cover' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              {/* Extra Images Section */}
              <div className="mb-3">
                <label className="form-label text-white">
                  Extra Images ({formData.images.length}/4)
                  <small className="text-muted-custom ms-2">Additional product views</small>
                </label>
                <div className="d-flex gap-2 align-items-center mb-2">
                  <input
                    type="file"
                    className="form-control form-control-dark"
                    accept="image/*"
                    onChange={handleExtraImageUpload}
                    disabled={uploadingExtra || formData.images.length >= 4}
                  />
                  {uploadingExtra && (
                    <div className="spinner-border spinner-border-sm text-warning" role="status">
                      <span className="visually-hidden">Uploading...</span>
                    </div>
                  )}
                </div>
                {uploadExtraError && <small className="text-danger d-block mb-2">{uploadExtraError}</small>}
                {formData.images.length >= 4 && (
                  <small className="text-warning d-block mb-2">
                    <i className="bi bi-info-circle me-1"></i>Maximum 4 extra images reached
                  </small>
                )}
                {formData.images.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="position-relative">
                        <img 
                          src={img} 
                          alt={`Extra ${index + 1}`} 
                          className="rounded border border-secondary" 
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          onError={(e) => e.target.src = 'https://placehold.co/80x80/1a1a2e/ffffff?text=Error'}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
                          style={{ width: '20px', height: '20px', transform: 'translate(25%, -25%)' }}
                          onClick={() => removeExtraImage(index)}
                          title="Remove image"
                        >
                          <i className="bi bi-x" style={{ fontSize: '12px' }}></i>
                        </button>
                        <small className="d-block text-center text-muted-custom mt-1" style={{ fontSize: '10px' }}>
                          Image {index + 1}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-white">Sizes (comma separated)</label>
                  <input
                    type="text"
                    className="form-control form-control-dark"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder={formData.category?.toLowerCase().includes('footwear') ? '6, 7, 8, 9, 10, 11, 12' : 
                                 formData.name?.toLowerCase().includes('pant') || formData.name?.toLowerCase().includes('short') ? '28, 30, 32, 34, 36, 38, 40' :
                                 'XS, S, M, L, XL, XXL'}
                  />
                  <small className="text-muted-custom">
                    {formData.category?.toLowerCase().includes('footwear') ? 'Shoe sizes' : 
                     formData.name?.toLowerCase().includes('pant') || formData.name?.toLowerCase().includes('short') ? 'Waist sizes (inches)' :
                     formData.category?.toLowerCase().includes('wear') ? 'Clothing sizes' : 'Product sizes'}
                  </small>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white">Colors (comma separated)</label>
                  <input
                    type="text"
                    className="form-control form-control-dark"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Black, White"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="form-label text-white">Gender</label>
                <select
                  className="form-select form-control-dark"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  {['Unisex', 'Men', 'Women'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                <i className={`bi ${product ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                {product ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminProducts
