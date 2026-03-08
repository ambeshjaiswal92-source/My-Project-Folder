
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../services/api'

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

function Cart({ cart, updateQty, removeFromCart, total, appliedCoupon, onApplyCoupon, onRemoveCoupon }) {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        orderTotal: total
      })

      // Pass coupon info to parent (App.jsx)
      if (onApplyCoupon) {
        onApplyCoupon({
          code: response.data.coupon.code,
          discount: response.data.discount,
          description: response.data.coupon.description
        })
      }

      Swal.fire({
        title: 'Coupon Applied!',
        text: `You saved ${formatPrice(response.data.discount)}`,
        icon: 'success',
        background: '#1a1a2e',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code')
      if (onApplyCoupon) {
        onApplyCoupon(null)
      }
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponError('')
    if (onRemoveCoupon) {
      onRemoveCoupon()
    }
  }

  const finalTotal = appliedCoupon ? total - appliedCoupon.discount : total

  const handleCheckout = async () => {
    const result = await Swal.fire({
      title: 'Confirm Order',
      text: 'Are you sure you want to proceed to checkout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel',
      background: '#1a1a2e',
      color: '#fff',
      iconColor: '#28a745',
      customClass: {
        popup: 'border border-secondary'
      }
    });
    if (result.isConfirmed) {
      navigate('/payment');
    }
  };
  if (cart.length === 0) {
    return (
      <main className="container-fluid py-5" style={{ background: 'linear-gradient(135deg, #f7f7fa 0%, #f2f2f2 100%)', minHeight: '100vh' }}>
        <div className="text-center py-5">
          <i className="bi bi-bag-x display-1 mb-4" style={{ color: '#e3343c' }}></i>
          <h2 className="mb-3" style={{ color: '#222', fontWeight: 700 }}>Your bag is empty</h2>
          <p className="mb-4" style={{ color: '#888' }}>Add some gear from our featured collection to get started.</p>
          <Link to="/" className="btn btn-danger btn-lg" style={{ background: '#e3343c', border: 'none' }}>
            <i className="bi bi-arrow-left me-2"></i> Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container-fluid py-4" style={{ background: 'linear-gradient(135deg, #f7f7fa 0%, #f2f2f2 100%)', minHeight: '100vh' }}>
      <div className="mb-4">
        <h1 className="mb-2" style={{ color: '#222', fontWeight: 700 }}>Your Bag</h1>
        <p style={{ color: '#888' }}>{cart.length} item{cart.length !== 1 && 's'} in your cart</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {cart.map((item) => (
            <div key={item.id} className="cart-item d-flex justify-content-between align-items-center mb-3" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '18px' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded overflow-hidden" style={{ width: '80px', height: '80px', flexShrink: 0, background: '#f7f7fa' }}>
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center h-100">
                      <i className="bi bi-box-seam text-secondary fs-3"></i>
                    </div>
                  )}
                </div>
                <div>
                  <h6 className="mb-1" style={{ color: '#222', fontWeight: 600 }}>{item.name}</h6>
                  {(item.selectedSize || item.selectedColor) && (
                    <div className="mb-1">
                      {item.selectedSize && <span className="badge bg-secondary me-1">Size: {item.selectedSize}</span>}
                      {item.selectedColor && <span className="badge bg-secondary">Color: {item.selectedColor}</span>}
                    </div>
                  )}
                  <small style={{ color: '#888' }}>{formatPrice(item.price)} each</small>
                </div>
              </div>

              <div className="d-flex align-items-center gap-4">
                <div className="quantity-selector">
                  <button onClick={() => updateQty(item.id, -1)} style={{ background: '#f2f2f2', border: 'none', color: '#e3343c', fontWeight: 700, borderRadius: '50%', width: 32, height: 32 }}>
                    <i className="bi bi-dash"></i>
                  </button>
                  <span style={{ color: '#222', fontWeight: 600 }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ background: '#f2f2f2', border: 'none', color: '#28a745', fontWeight: 700, borderRadius: '50%', width: 32, height: 32 }}>
                    <i className="bi bi-plus"></i>
                  </button>
                </div>

                <span className="fw-bold" style={{ minWidth: '100px', color: '#222' }}>
                  {formatPrice(item.price * item.qty)}
                </span>

                <button className="btn btn-ghost btn-sm" style={{ color: '#e3343c' }} onClick={() => removeFromCart(item.id)}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="col-lg-4">
          <div className="card" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', background: '#fff' }}>
            <div className="card-body">
              <h5 className="mb-4" style={{ color: '#222', fontWeight: 700 }}>Order Summary</h5>

              {/* Coupon Input */}
              <div className="mb-4">
                <label className="form-label small" style={{ color: '#666' }}>Have a coupon?</label>
                {appliedCoupon ? (
                  <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: '#e8f5e9', border: '1px solid #4caf50' }}>
                    <div>
                      <span className="fw-bold text-success">{appliedCoupon.code}</span>
                      <small className="d-block text-muted">{appliedCoupon.description}</small>
                    </div>
                    <button 
                      className="btn btn-sm text-danger" 
                      onClick={handleRemoveCoupon}
                      title="Remove coupon"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                ) : (
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{ borderColor: couponError ? '#dc3545' : '#ddd', backgroundColor: '#fff', color: '#333' }}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                )}
                {couponError && (
                  <small className="text-danger">{couponError}</small>
                )}
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span style={{ color: '#888' }}>Subtotal</span>
                <span style={{ color: '#222' }}>{formatPrice(total)}</span>
              </div>

              {appliedCoupon && (
                <div className="d-flex justify-content-between mb-3">
                  <span style={{ color: '#4caf50' }}>Discount</span>
                  <span style={{ color: '#4caf50' }}>-{formatPrice(appliedCoupon.discount)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-3">
                <span style={{ color: '#888' }}>Shipping</span>
                <span style={{ color: '#888' }}>Calculated at checkout</span>
              </div>

              <hr style={{ borderColor: '#eee' }} />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-semibold" style={{ color: '#222' }}>Total</span>
                <span className="fw-bold fs-5" style={{ color: '#e3343c' }}>{formatPrice(finalTotal)}</span>
              </div>

              <div className="d-grid gap-2">
                <button type="button" className="btn btn-danger btn-lg" style={{ background: '#e3343c', border: 'none' }} onClick={handleCheckout}>
                  <i className="bi bi-credit-card me-2"></i> Proceed to Checkout
                </button>
                <Link to="/" className="btn btn-light">
                  <i className="bi bi-arrow-left me-2"></i> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Cart
