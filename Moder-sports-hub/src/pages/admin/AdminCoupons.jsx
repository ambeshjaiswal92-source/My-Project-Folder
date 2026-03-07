import { useState, useEffect } from 'react'
import api from '../../services/api'

function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    isActive: true
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await api.get('/coupons')
      setCoupons(response.data)
    } catch (err) {
      setError('Failed to fetch coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      isActive: true
    })
    setEditingCoupon(null)
    setError('')
  }

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount || '',
        maxDiscount: coupon.maxDiscount || '',
        usageLimit: coupon.usageLimit || '',
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
        endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
        isActive: coupon.isActive
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
      }

      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, payload)
        setSuccess('Coupon updated successfully!')
      } else {
        await api.post('/coupons', payload)
        setSuccess('Coupon created successfully!')
      }

      fetchCoupons()
      closeModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return

    try {
      await api.delete(`/coupons/${id}`)
      setSuccess('Coupon deleted successfully!')
      fetchCoupons()
    } catch (err) {
      setError('Failed to delete coupon')
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/coupons/${id}/toggle`)
      fetchCoupons()
    } catch (err) {
      setError('Failed to update coupon status')
    }
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isExpired = (endDate) => new Date(endDate) < new Date()
  const isUpcoming = (startDate) => new Date(startDate) > new Date()

  const getStatusBadge = (coupon) => {
    if (!coupon.isActive) return <span className="badge bg-secondary">Inactive</span>
    if (isExpired(coupon.endDate)) return <span className="badge bg-danger">Expired</span>
    if (isUpcoming(coupon.startDate)) return <span className="badge bg-info">Upcoming</span>
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <span className="badge bg-warning text-dark">Limit Reached</span>
    }
    return <span className="badge bg-success">Active</span>
  }

  return (
    <div className="admin-coupons">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Coupon Management</h2>
          <p className="text-muted-custom mb-0">Create and manage discount coupons</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <i className="bi bi-plus-lg me-2"></i>Create Coupon
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search coupons by code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75">Total Coupons</p>
                  <h3 className="mb-0">{coupons.length}</h3>
                </div>
                <i className="bi bi-ticket-perforated fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75">Active</p>
                  <h3 className="mb-0">
                    {coupons.filter(c => c.isActive && !isExpired(c.endDate)).length}
                  </h3>
                </div>
                <i className="bi bi-check-circle fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75">Expired</p>
                  <h3 className="mb-0">
                    {coupons.filter(c => isExpired(c.endDate)).length}
                  </h3>
                </div>
                <i className="bi bi-x-circle fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75">Total Used</p>
                  <h3 className="mb-0">
                    {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
                  </h3>
                </div>
                <i className="bi bi-graph-up fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-ticket-perforated display-1 text-muted-custom mb-3 d-block"></i>
              <h5 className="text-muted-custom">No coupons found</h5>
              <p className="text-muted-custom">Create your first coupon to get started</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Usage</th>
                    <th>Valid Period</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td>
                        <div>
                          <span className="fw-bold font-monospace text-dark">{coupon.code}</span>
                          {coupon.description && (
                            <small className="d-block text-secondary">{coupon.description}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          {coupon.discountType === 'percentage' 
                            ? `${coupon.discountValue}% OFF` 
                            : `₹${coupon.discountValue} OFF`}
                        </span>
                        {coupon.minOrderAmount > 0 && (
                          <small className="d-block text-dark">
                            Min: ₹{coupon.minOrderAmount}
                          </small>
                        )}
                      </td>
                      <td>
                        <span className="fw-semibold text-dark">{coupon.usedCount || 0}</span>
                        {coupon.usageLimit && (
                          <span className="text-secondary"> / {coupon.usageLimit}</span>
                        )}
                      </td>
                      <td>
                        <small>
                          <div className="text-dark">{new Date(coupon.startDate).toLocaleDateString()}</div>
                          <div className="text-secondary">to {new Date(coupon.endDate).toLocaleDateString()}</div>
                        </small>
                      </td>
                      <td>{getStatusBadge(coupon)}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleToggleStatus(coupon._id)}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`bi ${coupon.isActive ? 'bi-pause' : 'bi-play'}`}></i>
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => openModal(coupon)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(coupon._id)}
                            title="Delete"
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
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Coupon Code *</label>
                      <input
                        type="text"
                        className="form-control text-uppercase"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="e.g., SAVE20"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="20% off on all products"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Discount Type *</label>
                      <select
                        className="form-select"
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Minimum Order Amount ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="minOrderAmount"
                        value={formData.minOrderAmount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Maximum Discount ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="maxDiscount"
                        value={formData.maxDiscount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="No limit"
                      />
                      <small className="text-muted">Only for percentage discounts</small>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Usage Limit</label>
                      <input
                        type="number"
                        className="form-control"
                        name="usageLimit"
                        value={formData.usageLimit}
                        onChange={handleInputChange}
                        min="1"
                        placeholder="Unlimited"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isActive"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Active (can be used immediately)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCoupons
